const {instance} = require('../config/razorpay')
const Course = require("../models/Course")
const User = require('../models/User')
const mailSender = require("../utils/mailsender")
const {courserEnrollment} = require('../mail/templates/courseEnrollmentEmail');
const { default: mongoose } = require('mongoose');

//
exports.capturePayment = async(req, res) => {
    //get courseId and UserId
    const courseId = req.body
    const userId = req.user.id
    //Validation on courseId
    if(!courseId){
        return res.json({
            success: false,
            message: "please Provide valid CourseId"
        });
    }

    //validation On course
    let course;
    try{
        course = await Course.findById(courseId);
        if(!course){
            return res.json({
                success: false,
                message: "could Not find the course" 
            });
        }

        //Check If user already pay for the course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success: false,
                message: "student is already enrolled"
            });
        }
    } 
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }

    //Create order
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{
            courseId: courseId,
            userId,
        }
    }

    try{
        //initiate payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        // return 
        return res.status(200).jso({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        });

    }
    catch(error){
        return res.json({
            success: flase,
            message: error.message
        });
    }

};

//verify Signature

exports. verifySignature = async (req, res) => {
    const webHookSecret = "7348471460"
    const signature = req.headers["X-razorpay-signature"];

    const shaSum = crypto.createHmac("sha256", webHookSecret);
    shaSum.update(JSON.stringify(req.body));
    const digest = shaSum.digest("hex");

    if(signature === digest){
        console.log("payment is Authorised")

        const {courseId, userId} = req.body.payload.payment.entity.notes;
        
        try{
            //fulfil the action

            //find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                                            {_id: courseId},
                                            {$push:{studentsEnrolled: userId}},
                                            {new:true},
            );

            if(!enrolledCourse) {
                return res.status(500).json({
                    success:false,
                    message:'Course not Found',
                });
            }

            console.log(enrolledCourse);

            //find the student andadd the course to their list enrolled courses me 
            const enrolledStudent = await User.findOneAndUpdate(
                                            {_id:userId},
                                            {$push:{courses:courseId}},
                                            {new:true},
            );

            console.log(enrolledStudent);

            //mail send krdo confirmation wala 
            const emailResponse = await mailSender(
                                    enrolledStudent.email,
                                    "Congratulations from CodeHelp",
                                    "Congratulations, you are onboarded into new CodeHelp Course",
            );

            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:"Signature Verified and COurse Added",
            });


    }       
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
    else {
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        });
    }
}