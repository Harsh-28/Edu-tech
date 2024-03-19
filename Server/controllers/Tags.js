const Tag = require('../models/tags');

exports.createTags = async(req, res)=>{
    try{
        //fetch Data
        const {name, description} = req.body;

        //validate
        if(!description || !name){
            return res.status(400).json({
                success: false,
                message: "All fileds are required",
            });
        }
        //Create entry in database
        const tagDetails = await Tag.create({
            name: name,
            description: description,
        });

        console.log(tagDetails);

        return res.status(200).json({
            success: true,
            message: "Tags created successfully"
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.showTags = async (req, res) => {
    try{
        const allTags = await Tag.find({}, {name: true, description:  true});
        return res.status(200).json({
            success: true,
            message: "All Tags are return",
            allTags,
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};