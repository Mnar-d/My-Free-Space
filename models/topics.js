const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const postSchema = new Schema({
    type:String,
    title:String, 
    content:String,
})


 var Posts = mongoose.model("Posts", postSchema)
module.exports = Posts;
