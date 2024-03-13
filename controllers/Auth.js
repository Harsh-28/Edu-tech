const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenrator = require('otp-genrator');
const bcrypt = require('bcrypt');
//sendOTP
exports.sendOTP = async (req, res) => {
  try{
        const email = req.body; //fetch email form request body
        const checkUserPersent = await User.findOne({ email }); //Check User Ecist or not

        if(checkUserPersent){
            return res.status(401).json({
                success: false,
                message: "User is already exist",
            })
    }

    //Genrate OTP
    var otp = otpGenrator.genrate(6,{
        upperCaseAlphabet: false,
        lowerCaseAlphabet: false,
        specialChars: false,
    });
    console.log(otp);

    //check Unique OTP
    let result = await otp.findOne({otp: otp});
    while(result){
      otp = otpGenrator(6,{
        upperCaseAlphabet: false,
        lowerCaseAlphabet: false,
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
exports.signUp = async(req, res) => {
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
    } else if(otp !== recentOtp.otp){
      return res.status(400).json({
        success: flase,
        message: "Invaild OTP"
      });
    }
    
    //hashPasword
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const profileDetails = await Profile.create({
      gender: nul,
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
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstNae} ${lastName}`,
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


//changePassword

