const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const userProfileModel = require("../models/userProfileModel");
const userVerificationModel = require("../models/userVerificationModel");
const { ROLES, USER_STATUS } = require("../config/constants");

const loginRedirectByRole = (role) => {
  if (role === ROLES.ADMIN) return "/admin/dashboard";
  if (role === ROLES.JASTIPER) return "/jastiper/dashboard";
  return "/buyer/dashboard";
};

const buildRegisterOldData = (data = {}) => ({
  full_name: data.full_name || "",
  email: data.email || "",
  phone: data.phone || "",
  role: data.role || ROLES.BUYER,
  ktp_number: data.ktp_number || "",
  address: data.address || "",
  city: data.city || "",
  province: data.province || "",
  shop_name: data.shop_name || "",
  username_slug: data.username_slug || "",
  instagram_username: data.instagram_username || "",
  bio: data.bio || "",
  bank_account_name: data.bank_account_name || "",
  bank_account_number: data.bank_account_number || "",
  bank_name: data.bank_name || "",
});

exports.showLogin = (req, res) => {
  if (req.session.user) {
    return res.redirect(loginRedirectByRole(req.session.user.role));
  }

  return res.render("auth/login", {
    title: "Login",
    formData: {
      email: "",
    },
    loginError: "",
  });
};

exports.showRegister = (req, res) => {
  if (req.session.user) {
    return res.redirect(loginRedirectByRole(req.session.user.role));
  }

  return res.render("auth/register", {
    title: "Register",
    old: buildRegisterOldData(),
    registerError: "",
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(401).render("auth/login", {
        title: "Login",
        formData: { email },
        loginError: "Invalid email or password.",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).render("auth/login", {
        title: "Login",
        formData: { email },
        loginError: "Invalid email or password.",
      });
    }

    if (user.status === USER_STATUS.SUSPENDED) {
      return res.status(403).render("auth/login", {
        title: "Login",
        formData: { email },
        loginError: "Your account is suspended. Please contact support.",
      });
    }

    req.session.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      status: user.status,
      verification_status: user.verification_status,
    };

    await userModel.updateLastLoginAt(user.id);
    req.flash("success", "Welcome back!");
    return res.redirect(loginRedirectByRole(user.role));
  } catch (error) {
    if (error.code === "ECONNREFUSED" || error.code === "PROTOCOL_CONNECTION_LOST") {
      return res.status(503).render("auth/login", {
        title: "Login",
        formData: { email: req.body.email || "" },
        loginError: "Login service is temporarily unavailable. Please try again shortly.",
      });
    }

    return next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const {
      full_name,
      email,
      phone,
      password,
      role,
      ktp_number,
      address,
      city,
      province,
      shop_name,
      username_slug,
      instagram_username,
      bio,
      bank_account_name,
      bank_account_number,
      bank_name,
    } = req.body;

    const existingUserByEmail = await userModel.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).render("auth/register", {
        title: "Register",
        old: buildRegisterOldData(req.body),
        registerError: "Email is already registered.",
      });
    }

    const existingUserByPhone = await userModel.findByPhone(phone);
    if (existingUserByPhone) {
      return res.status(409).render("auth/register", {
        title: "Register",
        old: buildRegisterOldData(req.body),
        registerError: "Phone number is already registered.",
      });
    }

    if (!req.files || !req.files.ktp_photo || req.files.ktp_photo.length === 0) {
      return res.status(422).render("auth/register", {
        title: "Register",
        old: buildRegisterOldData(req.body),
        registerError: "KTP photo is required.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = await userModel.createUser({
      role,
      email,
      phone,
      passwordHash,
      status: USER_STATUS.PENDING,
      verificationStatus: "pending",
    });

    await userProfileModel.createProfile({
      user_id: userId,
      full_name,
      username_slug: username_slug || null,
      shop_name: role === ROLES.JASTIPER ? shop_name || null : null,
      instagram_username: role === ROLES.JASTIPER ? instagram_username || null : null,
      bio: role === ROLES.JASTIPER ? bio || null : null,
      address,
      city,
      province,
      bank_account_name: role === ROLES.JASTIPER ? bank_account_name || null : null,
      bank_account_number: role === ROLES.JASTIPER ? bank_account_number || null : null,
      bank_name: role === ROLES.JASTIPER ? bank_name || null : null,
    });

    const ktpPhoto = req.files.ktp_photo[0];
    const selfieFile =
      req.files.selfie_with_ktp && req.files.selfie_with_ktp.length > 0
        ? req.files.selfie_with_ktp[0]
        : null;

    await userVerificationModel.createVerification({
      userId,
      ktpNumber: ktp_number,
      ktpPhotoPath: `/uploads/${ktpPhoto.filename}`,
      selfieWithKtpPath: selfieFile ? `/uploads/${selfieFile.filename}` : null,
      status: "pending",
    });

    req.flash(
      "success",
      "Registration success. Your account is pending verification, please login."
    );
    return res.redirect("/login");
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).render("auth/register", {
        title: "Register",
        old: buildRegisterOldData(req.body),
        registerError: "Email/phone/slug already exists. Please use different values.",
      });
    }

    if (error.code === "ECONNREFUSED" || error.code === "PROTOCOL_CONNECTION_LOST") {
      return res.status(503).render("auth/register", {
        title: "Register",
        old: buildRegisterOldData(req.body),
        registerError: "Registration service is temporarily unavailable. Please try again shortly.",
      });
    }

    return next(error);
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("jastip.sid");
    res.redirect("/login");
  });
};
