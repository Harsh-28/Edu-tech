const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) =>{
    try{
        //data fetch
        const {sectionName, courseId} = req.body;

        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message: "Missing Properties",
            });
        }

        //create Section
        const newSection = await Section.create({sectionName});

        const updateCourseDetails = await Course.findByIdAndUpdate(courseId,
                                                                    {
                                                                        $push:{
                                                                            courseContent: newSection._id,
                                                                        },
                                                                    },
                                                                    {new: true},
                                                                );


        return res.status(200).json({
            success: true,
            message: "section Created successfully",
            updateCourseDetails,
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "unable to create section",
        })
    }
}

exports.updateSection = async(req, res) => {
    try{
        //data input
        const {sectionName, sectionId} = req.body;
        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message: "Missing Properties",
            });
        }
        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true})

        return res.status(200).json({
            success: true,
            message: "section Updated successfully",
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "unable to Update section",
        })
    }

}

exports.deleteSection = async(req, res) => {
    try{
        //get Id
        const {sectionId} = req.params

        await Section.findByIdAndDelete(sectionId);
        return res.status(200).json({
            success: true,
            message: "section deleted successfully",
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "unable to delete  section",
        })
    }

}
