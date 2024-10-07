const express = require("express");
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  userDetail,
} = require("../controllers/userController.js");
const { authenticationMid } = require("../middleware/authMiddleware.js");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.post("/reset/:token", resetPassword);
router.get("/me", authenticationMid, userDetail);

module.exports = router;
