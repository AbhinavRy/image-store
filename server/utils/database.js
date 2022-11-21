const mongoose = require("mongoose");

exports.mongoConnect = () => {
    mongoose.connect(process.env.DB_CONNECT)
    .then(() => {
        console.log("Connnected to DB.");
    })
    .catch(err => {
        console.log("cannot connect to mongodb",err.message);
    })
}