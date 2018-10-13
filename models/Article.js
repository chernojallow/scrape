var mongoose = require("mongoose");

// Save a reference to the Schema construction 
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },


    summary: {
        type: String,
        required: true
    },
    imgLink: {
        type: String,
        required: true
    },



});

var Article = mongoose.model("Article", ArticleSchema);

// Exports the Article model
module.exports = Article;