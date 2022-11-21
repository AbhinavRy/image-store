const mongoose = require("mongoose");
const Media = require("../models/media");
const User = require("../models/user");
const { decodeJwt } = require("./util/helper");
const fileUpload = require("../utils/fileUpload");
const { deleteImageCloudinary } = require('../utils/deleteCloudinary');

exports.getMedia = async (req, res) => {
    const { skip, limit } = req.query;
    try {
        const { userId } = req.user;
        if(!userId){
            return res.status(401).json({ message: "Access Denied." });
        }
        const result = await Media.findOne({ userId })
        
        if(result){
            res.status(200).json({ data: result.media });
        }
        else{
            res.status(200).json({ data: [], message: "No data found." });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Something went wrong." });
    }
}

exports.addMedia = async (req, res) => {
    let bodyData = req.body;
    try {
        const userData =  req.user;
        const { userId } = userData;
        
        const files = req.files;
        if(!files || files.length === 0){
            return res.status(400).json({ message: "No media file found for the media upload. Please provide one." });
        }

        // return res.status(400).json({ message: "Bad Request." });
        let image = [];
        for (const file of files) {
            const newPath = await fileUpload(file);

            image.push({
                fileName: file.originalname,
                fileType: file.mimetype.split('/')[1],
                cloudinary_id: newPath.public_id,
                url: newPath.secure_url,
            });
        }

        const result = await Media.findOneAndUpdate(
            { userId },
            {
                $push:{
                    media: { $each: image }
                }
            },
            {
                upsert: true,
                new: true
            }
        )

        if(result){
            return res.status(200).json({ message: "Media uploaded successfully." });
        }
        return res.status(500).json({ message: "Media Upload Failed." });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Something went wrong." });
    }
}

exports.deleteMedia = async (req, res) => {
    try {
        const { userId } = req.user;
        const  { mediaId } = req.query
        if(!mediaId || mediaId.length === 0){
            return res.status(400).json({ message: "Unable to delete media provide necessary input." });
        }
        const result = await Media.findOneAndUpdate(
            { userId },
            {
                $pull: {
                    media: { cloudinary_id: { $in: mediaId } }
                }
            },
            {
                new: true,
                rawResult: true
            }
        );
        if(result && result.lastErrorObject.updatedExisting){
            await deleteImageCloudinary(mediaId);
            return res.status(200).json({ message: "Media deleted successfully." });
        }
        else{
            res.status(500).json({ message: "Unable to delete media." });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Something went wrong." });
    }
}


