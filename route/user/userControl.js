const User = require("./../../models/Users/User");
const qrcode = require("qrcode");
const bcrypt = require("bcrypt");
const otplib = require("otplib");
var jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
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
    const { otpToken, email } = req.body;
    const user = await User.findOne({ email: email });
    console.log("secret: " + user.secret);
    console.log("otpToken: " + otpToken);
    // Kiểm tra mã token người dùng truyền lên có hợp lệ hay không?
    const isValid = verifyOTPToken(otpToken, user.secret);
    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      "lolwtf420and69",
      { expiresIn: "10h" }
    );
    if (isValid) {
      user.scaned = true;
      user.save();
      res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 2,
        httpOnly: true,
      });

      res.cookie("isLogin", true, {
        maxAge: 1000 * 60 * 60 * 2,
      });

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
    return res.status(500).json(error);
  }
};

/* controller xử lý tạo mã otp và gửi về client ảnh QR Code */
const postEnable2FA = async (req, res) => {
  try {
    let { email } = req.body;
    // đây là tên ứng dụng của các bạn, nó sẽ được hiển thị trên app Google Authenticator hoặc Authy sau khi bạn quét mã QR
    const serviceName = "kietttt";
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
        res.send({ email: user.email });
      })
      .catch((e) => {
        console.log(e);
        res.status(500).send({
          message: "Something was wrong!",
        });
      });
  }
};

// just check password and email (not real login)
const login = async (req, res) => {
  const body = req.body;
  const user = await User.findOne({ email: body.email });
  if (user) {
    const validPassword = await bcrypt.compare(body.password, user.password);
    if (validPassword) {
      const copy = {
        email: user.email,
        scaned: user.scaned,
      };
      res.send(copy);
    } else {
      res.status(401).json({ error: "Wrong password" });
    }
  } else {
    res.status(401).json({ error: "User does not exist" });
  }
};

const getAllUser = async (req, res) => {
  const user = await User.find();
  res.send(user);
  const salt = await bcrypt.genSalt(10);
  console.log(salt);
};

const removeAllUser = async (req, res) => {
  const user = await User.remove();
  res.send("remove all");
};

const getUserByToken = async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  res.send({
    _id: user._id,
    name: user.name,
    address: user.address,
    sharedAlbum: user.sharedAlbums,
    sharedImages: user.sharedImages,
    // token: req.user.token,
  });
};

const getUserByEmail = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  res.send({
    name: user.name,
    address: user.address,
    email: user.email,
  });
};

const logout = () => {
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
  getAllUser,
  createUser,
  login,
  postEnable2FA,
  removeAllUser,
  postVerify2FA,
  getUserByToken,
  getUserByEmail,
  logout,
  listUserById,
  removeImageSharedInUser,
  oneUser,
  oneUserByMail,
};
