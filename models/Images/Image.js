const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  name: String,
  filename: String, //unique
  albumId: String,
  createBy: String,
  width: Number,
  height: Number,
  uploadDay: {
    type: Date,
    default: Date.now,
  },
  sharedTo: Array,
});

module.exports = mongoose.model("Image", imageSchema);
