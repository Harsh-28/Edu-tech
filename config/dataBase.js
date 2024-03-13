const mongoose = require('mongoose');
require('dotenv').config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        userNewUrlParser: true,
        useUnifiedTopology: true,
    })

    .then(() => console.log('dataBase Successfully Connected!!'))
    .catch((error) => {
        console.log("DB connection failed!)");
        console.error(error);
        process.exit(1);
    })
};
