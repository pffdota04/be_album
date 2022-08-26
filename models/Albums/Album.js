const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema({
  uid: String, //unique
  name: String,
  createDay: {
    type: Date,
    default: Date.now,
  },
  lastUpdate: {
    type: Date,
    default: Date.now,
  },
  totalImage: {
    type: Number,
    default: 0,
  },
  sharedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
});

module.exports = mongoose.model("Album", albumSchema);
