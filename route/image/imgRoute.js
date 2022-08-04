const express = require("express");
const checkToken = require("../../middlewares/check-auth");
const {
  uploadAnImage,
  getAnImage,
  getAnCustomImage,
  getImagesByAlbumId,
  getDzi,
  getFolderDzi,
  getAnImageInfo,
} = require("./imgControl");

const imageRoutes = express.Router();

//
const multer = require("multer");

const upload = multer({
  dest: "imgs",
});
//
imageRoutes.route("/upload").post(upload.single("imgs"), uploadAnImage);
imageRoutes.route("/getcustom").get(getAnCustomImage); // custom size
imageRoutes.route("/").get(getAnImage); // get file img
imageRoutes.route("/info").get(getAnImageInfo); // get info's img
imageRoutes.route("/albumid/:id").get(getImagesByAlbumId);
imageRoutes.route("/getdzi").get(getDzi);
imageRoutes.route("/getFolderDzi/:file/:number/:name").get(getFolderDzi);

module.exports = imageRoutes;
