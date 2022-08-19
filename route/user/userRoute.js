const express = require("express");
const checkToken = require("../../middlewares/check-auth");
const {
  createUser,
  getMyAccount,
  login,
  postEnable2FA,
  removeAllUser,
  postVerify2FA,
  getUserByToken,
  logout,
  getUserById,
  listUserById,
  editUser,
} = require("./userControl");

const userRoute = express.Router();

userRoute
  .route("/")
  .get(checkToken, getMyAccount) //return all
  .post(createUser) // return qr code
  .put(checkToken, editUser); // return qr code
userRoute.route("/logout").get(logout);
userRoute.route("/byid/:id").get(getUserById);
userRoute.route("/login").post(login, postVerify2FA);
userRoute.route("/listbyid").post(listUserById);
// userRoute.route("/createqrcode").post(postEnable2FA);
userRoute.route("/checkcode").post(postVerify2FA);
userRoute.route("/getUserByToken").get(checkToken, getUserByToken);

// warnign!!!
userRoute.route("/rmall").get(removeAllUser);

module.exports = userRoute;
