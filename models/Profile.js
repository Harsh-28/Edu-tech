const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    gender:{
        type: string,
    },
    dateOfbirth:{
        type: string,
    },
    about:{
        type: string,
        trim: true
    },
    contactNumber:{
        type: number,
        trim: true
    }

});

module.exports = mongoose.model("Profile", profileSchema)