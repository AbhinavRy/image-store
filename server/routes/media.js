const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { getMedia, addMedia, deleteMedia } = require("../controllers/media");
const { checkAuth, checkVerification } = require("../middleware/checkAuth");

router.get("/", checkAuth, getMedia);
router.post("/upload", 
    checkAuth, 
    checkVerification, 
    upload.array('image'), 
    addMedia
);
router.delete("/", checkAuth, deleteMedia);

module.exports = router;