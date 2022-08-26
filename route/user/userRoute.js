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

// const multer = require("multer");
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "Images");
//   },
//   filename: (req, file, cb) => {
//     req.filename = "avc";
//     cb(null, Date.now() + file.originalname);
//   },
// });
// const upload = multer({ storage: storage });

// userRoute.post("/cc", upload.array("DocumentFile", 10), (req, res) => {
//   req.files.map((e) => console.log(e.filename));
// });


module.exports = userRoute;
