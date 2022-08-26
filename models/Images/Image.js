const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  name: String,
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
  sharedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  status: {
    type: String,
    default: "init",
  },
  worker: Number,
});

module.exports = mongoose.model("Image", imageSchema);
