const express = require("express");
const checkToken = require("../../middlewares/check-auth");
const { postAnAlbum, getMyAlbum, getAlbumById } = require("./albumControl");
const alBumRoutes = express.Router();

alBumRoutes
  .route("/")
  .post(checkToken, postAnAlbum)
  .get(checkToken, getMyAlbum);
alBumRoutes.route("/:id").get(checkToken, getAlbumById);
// alBumRoutes.route("/my");

module.exports = alBumRoutes;
