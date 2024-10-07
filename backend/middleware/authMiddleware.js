const User = require("../models/userRoutes.js");
const jwt = require("jsonwebtoken");

const authenticationMid = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(500).json({
      message: "Erişim için lütfen giriş yapınız !!",
    });
  }

  const decodedData = jwt.verify(token, "SECRETTOKEN");

  if (!decodedData) {
    return res.status(500).json({
      message: "Erişim token'ınız geçersizdir!",
    });
  }

  req.user = await User.findById(decodedData.id);

  next();
};

const roleChecked = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(500).json({
        message: "Giriş için izniniz bulunMAmaktadır!!",
      });
    }
    next();
  };
};

module.exports = { authenticationMid, roleChecked };
