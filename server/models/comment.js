const { Schema } = require("mongoose");

const commentSchema = new Schema(
    {
        
    }
);

module.exports = Comment = mongoose.model('comments', commentSchema);