const User = require('../models/User');
const mailSender = require('../utils/mailSender');

//resetPasswordToken 
exports.resetPasswordToken = async(req, res) => {
    try{
        //get email from req body
        const email = req.body.email;
        //check user for email || email validation
        const user = await User.findOne({ email: email });
        if(!user){
            return res.json({
                success: false,
                message: 'Email not registered! Sign in First'
            });
        }
        //genrate token 
        const token = crypto.randomUUID();
        //update user by token and expriration time
        const updatedDetails = await User.findOneAndUpdate(
            {email: email},
            {token: token,
            resetPasswordExpires: Date.now() + 5*60*1000,},
            {new: true},
            );

        //create Url
        const url = `http//localhost:3000/update-password/${token}`;
        //send mail to user
        await mailSender(email, "Password reset Link", url)
        //return res.
        return res.json({
            success: true,
            message: "Email sent Successfully"
        });
    }
    catch (err) {
        console.error(err);
        return res.json({
            success: false,
            message: "Somthing went wrong",
        });
    }
}


//resetPassword
exports.resetPassword = async(req, res) =>{
    try{
        //data fetch
        const {password, confirmPassword, token} = req.body; 
        //validation
        if(!password !== confirmPassword){
            return res.json({
                success: false,
                message: "Password did not match! try Again",
            });
        }
        //get user details from database using tokens
        const userDetails = await User.findOne({token: token});
        //if !entry --> invalid token
        if(!userDetails){
            return res.json({
                success: false,
                message: "User does not exist"
            })
        }
        //token time check
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success: false,
                message: "Link expired, please try again!!"
            });
        }
        //hash pwd
        const hashedPassword = await brcypt.hash(password, 10);
        //password update
        await User.findOneAndUpdate(
            {token: token},
            {password: hashedPassword},
            {new: true},
        )
        //return response
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message:"somthing went wrong",
        });
    }
}