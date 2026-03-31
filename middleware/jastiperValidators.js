const { body } = require("express-validator");

const tripRules = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 191 })
    .withMessage("Trip title must be between 3 and 191 characters."),
  body("destination_country")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Destination country must be between 2 and 120 characters."),
  body("destination_city")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Destination city must be between 2 and 120 characters."),
  body("start_date")
    .trim()
    .notEmpty()
    .withMessage("Start date is required.")
    .isISO8601()
    .withMessage("Start date must use valid date format."),
  body("end_date")
    .trim()
    .notEmpty()
    .withMessage("End date is required.")
    .isISO8601()
    .withMessage("End date must use valid date format."),
  body("currency")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 10 })
    .withMessage("Currency maximum is 10 characters."),
  body("slug")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 191 })
    .withMessage("Trip slug must be between 3 and 191 characters.")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Trip slug can only contain lowercase letters, numbers, and hyphens."),
  body("status")
    .optional({ checkFalsy: true })
    .isIn(["draft", "published", "active", "closed", "completed"])
    .withMessage("Trip status is invalid."),
];

const productRules = [
  body("trip_id")
    .trim()
    .notEmpty()
    .withMessage("Trip is required.")
    .isInt({ min: 1 })
    .withMessage("Trip must be valid."),
  body("name")
    .trim()
    .isLength({ min: 2, max: 191 })
    .withMessage("Product name must be between 2 and 191 characters."),
  body("base_price")
    .trim()
    .notEmpty()
    .withMessage("Base price is required.")
    .isFloat({ min: 0 })
    .withMessage("Base price must be a valid number."),
  body("final_price_estimate")
    .optional({ checkFalsy: true })
    .trim()
    .isFloat({ min: 0 })
    .withMessage("Final price estimate must be a valid number."),
  body("jastip_fee")
    .optional({ checkFalsy: true })
    .trim()
    .isFloat({ min: 0 })
    .withMessage("Jastip fee must be a valid number."),
  body("stock")
    .optional({ checkFalsy: true })
    .trim()
    .isInt({ min: 0 })
    .withMessage("Stock must be a valid integer."),
  body("slug")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 191 })
    .withMessage("Product slug must be between 2 and 191 characters.")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Product slug can only contain lowercase letters, numbers, and hyphens."),
  body("product_status")
    .optional({ checkFalsy: true })
    .isIn(["draft", "published", "hidden", "sold_out"])
    .withMessage("Product status is invalid."),
  body("availability_status")
    .optional({ checkFalsy: true })
    .isIn(["available", "limited", "preorder", "sold_out"])
    .withMessage("Availability status is invalid."),
];

module.exports = {
  tripRules,
  productRules,
};
