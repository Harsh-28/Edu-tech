const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken')
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require('dotenv').config
//sendOTP
exports.sendotp = async (req, res) => {
  try{
        const {email} = req.body; //fetch email form request body
        const checkUserPersent = await User.findOne({ email }); //Check User Exist or not

        if(checkUserPersent){
            return res.status(401).json({
                success: false,
                message: "User is already exist",
            })
    }

    //Genrate OTP
    var otp = otpGenerator.generate(6,{
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
    console.log(otp);

    //check Unique OTP
    let result = await OTP.findOne({otp: otp});
    while(result){
      otp = otpGenerator.generate(6,{
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({otp: otp}); 
    } 
    const otpPlayLoad = {email, otp};

    // create an entry for OTP
    const otpBody = await OTP.create(otpPlayLoad);
    console.log(otpBody);

    //return response successfully
    res.status(200).json({
      success: true,
      message: "OTP sent succesfully",
      otp,
    })
  }
  catch(error){
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};


//signUp
exports.signup = async(req, res) => {
  try{
      const {
        firstName,
        lastName,
        email, 
        password,
        confrimPassword,
        accountType,
        contactNaumber,
        otp
      } = req.body;
    
    
    //validate data
    if(!firstName || !lastName || !email || !password || !confrimPassword || !otp){
      return res.status(403).json({
        success: false,
        message: "all fields required"
      })
    }
    
    // match Passwords
    if( password !== confrimPassword){
      return res.status(400).json({
        success: false,
        message: "password did not match"
      })
    }
    
    const existingUser = await User.findOne({email});
    if( existingUser){
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      })
    }
    
    
    const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);
    console.log(recentOtp);
    
    if(recentOtp.length == 0){
      return res.status(400).json({
        success: flase,
        message: 'OTP Not found',
      })
    } else if(otp !== recentOtp[0].otp){
      return res.status(400).json({
        success: false,
        message: "Invaild OTP"
      });
    }
    
    //hashPasword
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user
		let approved = "";
		// approved === "Instructor" ? (approved = false) : (approved = true);
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNaumber: null,
    })
    
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNaumber,
      password:hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })
    return res.status(200).json({
      success: true,
      message: "User is registered successfully",
      user,
    })
  }

  catch(error){
    console.log(error);
    res.status(500).json({
      success: false,
      message: "User is not registered! please try again later",
    })
  }
}

//Login
exports.login = async(req, res) => {
  try{
    const {email, password} = req.body

    //Validate form
    if(!email || !password){
      return res.status(403).josn({
        success: false,
        message: "All fields are required to fill",
      });
    }

    //User existance
    const user = await User.findOne({email})
    if(!user){
      return res.status(401).json({
        success: false,
        message: "User is Not registered",
      });
    }

    //password Matching and JWT genration
    if(await bcrypt.compare(password, user.password)){
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      }
      const token = JWT.sign(payload, process.env.JWT_SECRET,{
        expiresIn: '2h',
      });
      user.token = token;
      user.password = undefined;

    //create cookie ans send response
      const options = {
        expires: new Date(Date.now() + 3*24*60*60*1000),
        httpOnly: true,
      }
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
      })
    } else{
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      })
    }
    
  }
  catch(error){
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Login Failed!! try again later", 
    });
  }
}

// Controller for Changing Passwor
exports.changePassword = async(req, res) =>{
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};

