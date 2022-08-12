const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  name: String,
  // filename: String, //unique
  albumId: String,
  createBy: String,
  width: {
    type: Number,
    default: 0,
  },
  height: {
    type: Number,
    default: 0,
  },
  uploadDay: {
    type: Date,
    default: Date.now,
  },
  sharedTo: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("Image", imageSchema);
