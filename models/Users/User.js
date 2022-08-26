const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  address: String,
  email: String,
  password: String,
  secret: String,
  scaned: { type: Boolean, default: false },
  // sharedAlbums: { type: Array, default: [] },
  // sharedImages: { type: Array, default: [] },
  sharedAlbums: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "albums",
    },
  ],
  sharedImages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
