const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async(req, res) => {
    try{
        //fetch required data from req.body 
        const {
            dateOfBirth = "",
            about = "",
            contactNumber,
            gender
        } = req.body
        const id = req.user.id;

        //validation 
        if(!contactNumber || !gender){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await User.findById(profileId);

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;

        await profileDetails.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profileDetails
        })
    }
    catch(err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

exports.deleteAccount = async(req, res) => {
    try{
        const id = req.user.id;
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            })
        }

        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        await User.findByIdAndDelete({_id:id});

        return res.status(200).json({
            sucess: true,
            message: "User Successfully Deleted"
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
          })
    }
}

exports.getAllUserDetails = async (req, res) => {
    try {
      const id = req.user.id
      const userDetails = await User.findById(id)
        .populate("additionalDetails")
        .exec()
      console.log(userDetails)
      res.status(200).json({
        success: true,
        message: "User Data fetched successfully",
        data: userDetails,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }