const express = require("express");
const checkToken = require("../../middlewares/check-auth");
const {
  postAnAlbum,
  getMyAlbum,
  getAlbum,
  renameAlbum,
  removeAlbum,
  unShareAlbum,
  shareAlbum,
  sharedToMeAlbum,
} = require("./albumControl");
const alBumRoutes = express.Router();

alBumRoutes
  .route("/")
  .post(checkToken, postAnAlbum)
  .put(checkToken, renameAlbum)
  .get(checkToken, getMyAlbum)
  .delete(checkToken, removeAlbum);
alBumRoutes.route("/share").post(checkToken, shareAlbum);
alBumRoutes.route("/unshare").post(checkToken, unShareAlbum);
alBumRoutes.route("/shared").get(checkToken, sharedToMeAlbum);
alBumRoutes.route("/:id").get(checkToken, getAlbum);

module.exports = alBumRoutes;
