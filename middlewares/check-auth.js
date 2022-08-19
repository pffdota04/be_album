const jwt = require("jsonwebtoken");
const User = require("../models/Users/User");

const checkToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    console.log(token);
    console.log("token");
    // const token = req.headers.authorization;
    if (!token) throw new Error("Wrong token");
    const decodedToken = jwt.verify(token, "lolwtf420and69");
    console.log(decodedToken);
    req.user = {
      // _id: decodedToken._id,
      // email: decodedToken.email,
      ...decodedToken,
      token: token,
    };
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).send({
      message: error.message,
    });
  }
};

module.exports = checkToken;

// module.exports = (req, res, next) => {
//   try {
//     const token = req.headers.authorization;
//     if (!token) throw new Error("Wrong token");
//     const decodedToken = jwt.verify(token, "lolwtf420and69");
//     console.log(decodedToken);
//     next();
//   } catch (error) {}
// };
