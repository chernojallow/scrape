var mongoose = require("mongoose");

// save a reference to the schema constructor
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    title: String,
    body: String
});


var Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;
// This creates our model from the above schema, using mongoose's model method