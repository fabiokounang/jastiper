const { body } = require("express-validator");
const { ROLES } = require("../config/constants");

const commonPasswordRules = [
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
  body("confirm_password")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Confirm password must match password.");
      }
      return true;
    }),
];

const registerRules = [
  body("full_name")
    .trim()
    .isLength({ min: 3, max: 191 })
    .withMessage("Full name must be between 3 and 191 characters."),
  body("email").trim().isEmail().withMessage("Please enter a valid email address."),
  body("phone")
    .trim()
    .isLength({ min: 8, max: 30 })
    .withMessage("Phone must be between 8 and 30 characters."),
  ...commonPasswordRules,
  body("ktp_number")
    .trim()
    .isLength({ min: 8, max: 64 })
    .withMessage("KTP number must be between 8 and 64 characters."),
  body("role")
    .trim()
    .isIn([ROLES.BUYER, ROLES.JASTIPER])
    .withMessage("Role must be buyer or jastiper."),
  body("address")
    .trim()
    .isLength({ min: 8, max: 1000 })
    .withMessage("Address must be between 8 and 1000 characters."),
  body("city")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("City must be between 2 and 120 characters."),
  body("province")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Province must be between 2 and 120 characters."),
  body("shop_name")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 191 })
    .withMessage("Shop name maximum is 191 characters."),
  body("username_slug")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Username/public slug must use lowercase letters, numbers, and hyphen only.")
    .isLength({ max: 120 })
    .withMessage("Username/public slug maximum is 120 characters."),
  body("instagram_username")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage("Instagram username maximum is 120 characters."),
  body("bio")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Bio maximum is 2000 characters."),
  body("bank_account_name")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 191 })
    .withMessage("Bank account name maximum is 191 characters."),
  body("bank_account_number")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Bank account number maximum is 100 characters."),
  body("bank_name")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage("Bank name maximum is 120 characters."),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Please enter a valid email address."),
  body("password").trim().notEmpty().withMessage("Password is required."),
];

module.exports = {
  registerRules,
  loginRules,
};
