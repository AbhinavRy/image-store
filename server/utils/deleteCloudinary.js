const cloudinary = require('cloudinary').v2;

exports.deleteImageCloudinary = async (image) => {
    await image.map((img) => cloudinary.uploader.destroy(img));
};