const User = require("../models/userRoutes.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const register = async (req, res) => {
  const avatar = await cloudinary.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 130,
    crop: "scale",
  });

  const { name, email, password, image } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    return res.status(500).json({
      message: "Bu email zaten kullanılıyor!!",
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (password.length < 6) {
    return res.status(500).json({
      message: "Şifre 6 karakterden küçük olamaz",
    });
  }

  const newUser = await User.create({
    name,
    email,
    password: passwordHash,
    avatar: {
      public_id: avatar.public_id,
      url: avatar.secure_url,
    },
  });

  const token = await jwt.sign({ id: newUser._id }, "SECRETTOKEN", {
    expiresIn: "1h",
  });

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  };

  res.status(201).cookie("token", token, cookieOptions).json({
    newUser,
    token,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(500).json({
      message: "Böyle bir kullanıcı bulunamadı!!!",
    });
  }

  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    return status(500).json({
      message: "Yanlış Şifre Girdiniz!!",
    });
  }

  const token = await jwt.sign({ id: user._id }, "SECRETTOKEN", {
    expiresIn: "1h",
  });

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  };

  res.status(200).cookie("token", token, cookieOptions).json({
    user,
    token,
  });
};

const logout = async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now()),
  };

  res.status(200).cookie("token", null, cookieOptions).json({
    message: "Çıkış İşlemi Başarılı!",
  });
};

const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(500).json({
      message: "Kayıtlı bir kullanıcı bulunamadı!!",
    });
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const passwordUrl = `${req.protocol}://${req.get(
    "host"
  )}/reset/${resetToken}`;

  const message = `Şifreni sıfırlama için kullanacağın token: ${passwordUrl}`;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.your_email_provider.com", // Replace with your provider's SMTP server
      port: 587, // Port may vary depending on your provider
      service: "gmail",
      secure: false, // Use true for TLS, false for non-TLS (consult your provider)
      auth: {
        user: "your_email@provider.com", // Replace with your email address
        pass: "your_password", // Replace with your email password
      },
    });

    const mailOptions = {
      from: "your_email@provider.com", // Replace with your email address
      to: req.body.email, // Replace with the recipient's email address
      subject: "Şifre sıfırlama", // Replace with your desired subject
      text: message, // Plain text content
      // or
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: "Mailinizi kontrol ediniz!",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(500).json({
      message: "Geçersiz Token",
    });
  }

  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();

  const token = jwt.sign({ id: user._id }, "SECRETTOKEN", { expiresIn: "1h" });

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  };

  res.status(200).cookie("token", token, cookieOptions).json({
    user,
    token,
  });
};

const userDetail = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    user,
  });
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  userDetail,
};
