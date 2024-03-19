const Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//create Course
exports.createCourse = async (req, res) => {
    try{
        //fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;
        const thumbnail =  req.files.thumbnailImage;

        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details", instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message: "Instructor Details not found"
            })
        }

        //check tag
        const tagDetails = await Tag.findById(tag);
        if(!tag){
                return res.status(404).json({
                success:false,
                message: "tag Details not found"
            })
        }

        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor : instructorDetails._id,
            whatYouWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,
        })


        await User.findByIdAndUpdate({
            _id: instructorDetails._id
        },
            {
                $push:{
                    courses: newCourse._id,
                }
            },
            {new: true},
        )

        return res.status(200).json({
            success: true,
            message: "courses Created successfully"
        })
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "failed to create courses",
        })
    }
};


//get all courses

exports.getAllCourses = async (req, res) => {
    try{
        const allCourses = await Course.find({}, {
                                                    courseName: true,
                                                    price: true,
                                                    thumbnail: true,
                                                    instructor: true,
                                                    ratingAndReviews: true,
                                                    studentsEnrolled: true
        }).populate("instructor").exec();
        return res.status(200).json({
            success: true,
            message: "all courses successfully fetched",
            data : allCourses,
        })
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Cannot fetch course data"
        })
    }
}