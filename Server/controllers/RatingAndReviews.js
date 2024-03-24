const ratingAndReviews = require('../models/RatingAndRaview');
const Course = require('../models/Course');
const RatingAndRaview = require('../models/RatingAndRaview');


//Create Rating
exports.createRating = async(req, res) => {
    try{
        const userId = req.user.id;

        const {rating, review, courseId} = req.body

        const courseDetails = await Course.findOne({_id: userId, studentsEnrolled: {$eleMatch: {$eq: userId}}})

        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: "Studnt is not enrolled"
            });
        }

        const alreadyReviewd = await RatingAndRaview.findOne({
            user: userId,
            course: courseId
        });

        if(alreadyReviewd){
            return res.status(403).json({
                success: false,
                message: "Allready reviwed"
            })
        }

        
        const ratingReview = await RatingAndRaview.create({
            rating, review,
            course: courseId,
            user: userId
        })
        

        await Course.findByIdAndUpdate({_id:courseId},
                                    {
                                        $push: {
                                            ratingAndReviews: ratingReview._id,
                                        },
                                    },
                                    {new: true});
        
        return res.status(200).json({
            success: true,
            message: "rating and review created successfully"
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false, 
            message:error.message,
        })
    }
}


//getAverageRating
exports.getAverageRating = async (req, res) => {
    try {
            //get course ID
            const courseId = req.body.courseId;
            //calculate avg rating

            const result = await RatingAndReview.aggregate([
                {
                    $match:{
                        course: new mongoose.Types.ObjectId(courseId),
                    },
                },
                {
                    $group:{
                        _id:null,
                        averageRating: { $avg: "$rating"},
                    }
                }
            ])

            //return rating
            if(result.length > 0) {

                return res.status(200).json({
                    success:true,
                    averageRating: result[0].averageRating,
                })

            }
            
            //if no rating/Review exist
            return res.status(200).json({
                success:true,
                message:'Average Rating is 0, no ratings given till now',
                averageRating:0,
            })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


//getAllRatingAndReviews

exports.getAllRating = async (req, res) => {
    try{
            const allReviews = await RatingAndReview.find({})
                                    .sort({rating: "desc"})
                                    .populate({
                                        path:"user",
                                        select:"firstName lastName email image",
                                    })
                                    .populate({
                                        path:"course",
                                        select: "courseName",
                                    })
                                    .exec();
            return res.status(200).json({
                success:true,
                message:"All reviews fetched successfully",
                data:allReviews,
            });
    }   
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    } 
}