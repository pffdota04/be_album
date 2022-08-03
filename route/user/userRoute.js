const express = require("express");
const checkToken = require("../../middlewares/check-auth");
const {
  createUser,
  getAllUser,
  login,
  postEnable2FA,
  removeAllUser,
  postVerify2FA,
  getUserByToken,
  getUserByEmail,
} = require("./userControl");

const userRoute = express.Router();

userRoute.route("/").get(getAllUser).post(createUser);
userRoute.route("/byid/:id").get(getUserByEmail);
userRoute.route("/login").post(login);
userRoute.route("/createqrcode").post(postEnable2FA);
userRoute.route("/checkcode").post(postVerify2FA);
userRoute.route("/getUserByToken").get(checkToken, getUserByToken);

// warnign!!!
userRoute.route("/rmall").get(removeAllUser);

module.exports = userRoute;
