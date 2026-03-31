const express = require("express");
const authController = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");
const {
  loginRules,
  registerRules,
} = require("../middleware/authValidators");

const router = express.Router();

router.get("/login", authController.showLogin);
router.post("/login", loginRules, validationMiddleware, authController.login);
router.get("/register", authController.showRegister);
router.post(
  "/register",
  upload.fields([
    { name: "ktp_photo", maxCount: 1 },
    { name: "selfie_with_ktp", maxCount: 1 },
  ]),
  registerRules,
  validationMiddleware,
  authController.register,
);
router.post("/logout", authController.logout);

module.exports = router;
