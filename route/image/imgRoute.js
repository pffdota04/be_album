const express = require("express");
const checkToken = require("../../middlewares/check-auth");
const {
  uploadAnImage,
  getAnImage,
  getAnCustomImage,
  getImagesByAlbumId,
  getDzi,
  getFolderDzi,
} = require("./imgControl");

const imageRoutes = express.Router();

//
const multer = require("multer");

const upload = multer({
  dest: "imgs",
});
//
imageRoutes.route("/upload").post(upload.single("imgs"), uploadAnImage);
imageRoutes.route("/getcustom").get(getAnCustomImage);
imageRoutes.route("/").get(getAnImage);
imageRoutes.route("/albumid/:id").get(getImagesByAlbumId);
imageRoutes.route("/getdzi").get(getDzi);
imageRoutes.route("/getFolderDzi/:number/:name").get(getFolderDzi);

module.exports = imageRoutes;
