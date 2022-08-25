const express = require("express");
const checkToken = require("../../middlewares/check-auth");
const {
  uploadAnImage,
  getAnImage,
  getAnCustomImage,
  getFolderDzi,
  imageInAlbum,
  getAnImageInfo,
  deleteImage,
  shareAnImage,
  renameImage,
  uploadMultiple,
  test,
  unShareAnImage,
  myImage,
  sharedToMeImage,
} = require("./imgControl");

const imageRoutes = express.Router();

//
const multer = require("multer");

const upload = multer({
  dest: "imgs",
});
// chỉ owner và shared mới xem đc
imageRoutes
  .route("/")
  .get(checkToken, getAnCustomImage)
  .post(checkToken, upload.single("imgs"), uploadAnImage)
  .put(checkToken, renameImage)
  .delete(checkToken, deleteImage);
imageRoutes
  .route("/multiple")
  .post(checkToken, upload.array("imgs", 20), uploadMultiple);
imageRoutes.route("/getcustom").get(checkToken, getAnCustomImage); // custom size
imageRoutes.route("/info").get(checkToken, getAnImageInfo); // get info's img,,, nen chuyen qua route tren
imageRoutes.route("/albumid/:id").get(checkToken, imageInAlbum);
imageRoutes.route("/share").post(checkToken, shareAnImage);
imageRoutes.route("/unshare").post(checkToken, unShareAnImage);
imageRoutes.route("/getFolderDzi/:file/:number/:name").get(getFolderDzi);
imageRoutes
  .route("/check")
  // .get(checkToken, test)
  .post(checkToken, test);
imageRoutes.route("/myimage").get(checkToken, myImage);
imageRoutes.route("/sharedtome").get(checkToken, sharedToMeImage);
// imageRoutes.route("/getdzi").get(getDzi);

module.exports = imageRoutes;
