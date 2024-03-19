const Section = require("../models/Section");
const SubSection = require("../models/Subsection");
const { uploadImageToCloudinary } = require("../utils/imageUploader")
// Create a new sub-section for a given section
exports.createSubSection = async(req, res) => {
    try{
        // Extract necessary information from the request body
        const {sectionId, title, description, timeDuration} = req.body;
        const video = req.files.videoFilel

        // Check if all necessary fields are provided
        if(!sectionId || !title || !description || !timeDuration  || !video){
            return res.status(400).json({
                success: false,
                message: "all fields are required"
            })
        }

        // Upload the video file to Cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // Create a new sub-section with the necessary information
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            videourl: uploadDetails.secrure_url,
        })

        // Update the corresponding section with the newly created sub-section
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: subSectionDetails._id } },
            { new: true }
        ).populate("subSection")
        
        // Return the updated section in the response
        return res.status(200).json({ success: true, data: updatedSection }) 
    } catch(error){
        // Handle any errors that may occur during the process
        console.error("Error creating new sub-section:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
    })
    }
}


exports.updatedSubSection = async(req, res) => {
    try{
        const {sectionId, subSectionId, title, description} = req.body
        const subSection = await Subsection.findById({subSectionId})

        if(!subSection){
            return res.status(404).json({
                success: false,
                message: "Subsection not Found",
            })
        }
        if (title !== undefined) {
            subSection.title = title
        }
      
        if (description !== undefined) {
            subSection.description = description
        }
        if(req.files && req.files.video !== undefined){
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videourl = uploadDetails.secrure_url,
            subSection.timeDuration = `${uploadDetails.duration}`
        }
        await subSection.save()

         // find updated section and return it
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        )
    
        console.log("updated section", updatedSection)
    
        return res.json({
            success: true,
            message: "Section updated successfully",
            data: updatedSection,
        })
        } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the section",
        })
    }
}


exports.deleteSubSection = async (req,res) => {
    try{
        const {subSectionId, sectionId} = req.body;
        await Section.findByIdAndUpdate({_id: sectionId},
            {
                $push:{
                    subsSection: subSectionID,
                },
            })
        const subSection = await SubSection.findByIdAndDelete({_id: subSectionId})

        if(!subSection){
            return res.status(404).json({
                success: false, 
                message: "SubSection not found"
            })
        }

        //find updated section and return it
        const updatedSection = await Section.findById(sectionId).populate("subSection")

        return res.json({
            success: true,
            message: "Subsetion deleted sucessfully"
        })
        
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({
          success: false,
          message: "An error occurred while deleting the SubSection",
        })
      }
}
