const User = require("./../../models/Users/User");
const qrcode = require("qrcode");
const bcrypt = require("bcrypt");
const otplib = require("otplib");
var jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const { findById } = require("./../../models/Users/User");
const generateQRCode = async (otpAuth) => {
  try {
    const QRCodeImageUrl = await qrcode.toDataURL(otpAuth);
    return `<img src='${QRCodeImageUrl}' alt='qr-code-img-kiet' />`;
  } catch (error) {
    console.log("Could not generate QR code", error);
    return;
  }
};

const { authenticator } = otplib;
const generateUniqueSecret = () => {
  return authenticator.generateSecret();
};
/** Tạo mã OTP  */
const generateOTPToken = (username, serviceName, secret) => {
  return authenticator.keyuri(username, serviceName, secret);
};

const verifyOTPToken = (token, secret) => {
  return authenticator.verify({ token, secret });
};

// sinh tokenLogin, end login
const postVerify2FA = async (req, res) => {
  try {
    const { otpToken } = req.body;
    const user = req.user;
    // const { otpToken, email } = req.body;
    // const user = await User.findOne({ email: email });
    console.log("otpToken: " + otpToken);
    console.log("user: " + user);
    // Kiểm tra mã token người dùng truyền lên có hợp lệ hay không?
    const isValid = verifyOTPToken(otpToken, user.secret);
    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        refreshed: false,
      },
      "lolwtf420and69",
      { expiresIn: "20h" }
    );

    const token2 = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      "wtfman",
      { expiresIn: "1d" }
    );

    if (isValid) {
      user.scaned = true;
      user.save();
      res.cookie("tokenrf", token2, {
        httpOnly: true,
      });
      res.cookie("token", token, {
        httpOnly: true,
      });

      res.cookie("isLogin", true, {});

      return res.status(200).json({
        _id: user._id,
        email: user.email,
        name: user.name,
        sharedAlbums: user.sharedAlbums,
        sharedImages: user.sharedImages,
        check: true,
        // token: token,
      });
    } else return res.status(200).json({ check: false });
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
};

/* controller xử lý tạo mã otp và gửi về client ảnh QR Code */
const postEnable2FA = async (req, res) => {
  try {
    let { email } = req.body;
    const serviceName = "K-Album"; // teen app
    // Thực hiện tạo mã OTP
    const user = await User.findOne({ email: email });
    console.log(user);
    const otpAuth = generateOTPToken(user.name, serviceName, user.secret);
    // Tạo ảnh QR Code để gửi về client
    const QRCodeImage = await generateQRCode(otpAuth);
    return res.status(200).json({ QRCodeImage });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const createQrAfterSignUp = async (user) => {
  try {
    const serviceName = "K-Album"; // teen app

    const otpAuth = generateOTPToken(user.email, serviceName, user.secret);
    // Tạo ảnh QR Code để gửi về client
    const QRCodeImage = await generateQRCode(otpAuth);
    return QRCodeImage;
  } catch (error) {
    return false;
  }
};

const createUser = async (req, res) => {
  const { info } = req.body;
  const user = new User(info);
  console.log(user);
  const check = await User.findOne({ email: info.email });
  if (check)
    return res.status(500).send({
      message: "User exist!",
    });
  else {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.secret = generateUniqueSecret();
    user
      .save()
      .then((w) => {
        createQrAfterSignUp(user).then((qr) => {
          return res.status(200).json({ qr });
        });
      })
      .catch((e) => {
        console.log(e);
        res.status(200).send({
          message: "Something was wrong!",
        });
      });
  }
};

// just check password and email (not real login)
const login = async (req, res, next) => {
  const body = req.body;
  const user = await User.findOne({ email: body.email });
  if (user) {
    const validPassword = await bcrypt.compare(body.password, user.password);
    if (validPassword) {
      req.user = user;
      next();
    } else {
      res.status(401).json({ error: "Wrong password" });
    }
  } else {
    res.status(401).json({ error: "User does not exist" });
  }
};

const getMyAccount = async (req, res) => {
  let user = { ...(await User.findById(req.user._id))._doc };
  delete user.secret;
  delete user.password;
  console.log(user);
  res.send(user);
};

const removeAllUser = async (req, res) => {
  const user = await User.remove();
  res.send("remove all");
};

const getUserByToken = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.send({
    _id: user._id,
    name: user.name,
    address: user.address,
    sharedAlbum: user.sharedAlbums,
    sharedImages: user.sharedImages,
    // token: req.user.token,
  });
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send({
    name: user.name,
    address: user.address,
    email: user.email,
  });
};

const editUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, address, password } = req.body;
    if (password == "") {
      user.name = name;
      user.address = address;
      user.save();
      res.send("ok");
    } else {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.name = name;
      user.address = address;
      user.save();
      res.send("ok");
    }
  } catch (error) {
    console.log(error);
    res.send("error");
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.cookie("isLogin", false);
  res.send("logout!");
};

const listUserById = async (req, res) => {
  const records = await listUser(req.body.list);
  // const records = await User.find({ _id: { $in: listid } });
  res.send(records);
};

const removeImageSharedInUser = async (uid, imgid) => {
  const user = await oneUser(uid);
  return user;
};

//
const listUser = async (listid) => {
  return await User.find({ _id: { $in: listid } });
};

const oneUser = async (id) => {
  return await User.findById(id);
};

const oneUserByMail = async (email) => {
  return await User.findOne({ email: email });
};

module.exports = {
  getMyAccount,
  createUser,
  login,
  postEnable2FA,
  removeAllUser,
  postVerify2FA,
  getUserByToken,
  getUserById,
  logout,
  listUserById,
  removeImageSharedInUser,
  oneUser,
  oneUserByMail,
  editUser,
};
