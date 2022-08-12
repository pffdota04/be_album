const express = require("express");
const checkToken = require("../../middlewares/check-auth");
const {
  uploadAnImage,
  getAnImage,
  getAnCustomImage,
  getImagesByAlbumId,
  getFolderDzi,
  getAnImageInfo,
  deleteImage,
  shareAnImage,
  renameImage,
  uploadMultiple,
  test,
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
  .get(test)
  // .get(checkToken, getAnImage)
  .post(checkToken, upload.single("imgs"), uploadAnImage)
  .put(checkToken, renameImage)
  .delete(checkToken, deleteImage);
imageRoutes
  .route("/multiple")
  .post(checkToken, upload.array("imgs", 20), uploadMultiple);
imageRoutes.route("/getcustom").get(checkToken, getAnCustomImage); // custom size
imageRoutes.route("/info").get(checkToken, getAnImageInfo); // get info's img,,, nen chuyen qua route tren
imageRoutes.route("/albumid/:id").get(getImagesByAlbumId);
imageRoutes.route("/share").post(checkToken, shareAnImage);
imageRoutes.route("/getFolderDzi/:file/:number/:name").get(getFolderDzi);
// imageRoutes.route("/getdzi").get(getDzi);

module.exports = imageRoutes;
