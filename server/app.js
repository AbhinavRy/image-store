const express = require("express");
const app = express();
const morgan = require("morgan");
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require("dotenv").config();

const authRouter = require("./routes/auth");
const mediaRouter = require("./routes/media");
const { mongoConnect } = require("./utils/database");
const cloudinary = require('./utils/cloudinary');

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use(cookieParser());

cloudinary();

const buildPath = path.join(__dirname, '..', 'dist');
app.use(express.static(buildPath));

app.use("/auth", authRouter);
app.use("/media", mediaRouter);

app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist/index.html'));
});


// app.use("*", (req, res) => {
//     res.status(400).send("Not found.");
// });

const PORT = process.env.PORT;
app.listen(PORT, () => {
    mongoConnect();
    console.log("Server running on port 5000.");
})