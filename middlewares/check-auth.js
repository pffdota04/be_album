const jwt = require("jsonwebtoken");
const User = require("../models/Users/User");

const checkToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    const tokenrf = req.cookies?.tokenrf;
    if (!token) throw new Error("Wrong token");
    const decodedToken = jwt.verify(token, "lolwtf420and69");

    // REFRESH
    // chưa refresh exp = 20h, check truoc khi het 6h (21600s)
    // đã refresh exp = 7d, check truoc khi het 2d (172800s)
    if (
      (decodedToken.exp - Date.now() / 1000 < 21600 &&
        !decodedToken.refreshed) ||
      (decodedToken.exp - Date.now() / 1000 < 172800 && decodedToken.refreshed)
    ) {
      const decodedTokenrf = jwt.verify(tokenrf, "wtfman");

      const newtoken = jwt.sign(
        {
          _id: decodedTokenrf._id,
          name: decodedTokenrf.name,
          email: decodedTokenrf.email,
          refreshed: true,
        },
        "lolwtf420and69",
        { expiresIn: "7d" }
      ); //7d
      const newtoken2 = jwt.sign(
        {
          _id: decodedTokenrf._id,
          name: decodedTokenrf.name,
          email: decodedTokenrf.email,
        },
        "wtfman",
        { expiresIn: "10d" }
      ); //10d

      res.cookie("token", newtoken, {
        httpOnly: true,
      });
      res.cookie("tokenrf", newtoken2, {
        httpOnly: true,
      });
    }

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
