const { body } = require("express-validator");

const addToCartRules = [
  body("trip_id")
    .trim()
    .notEmpty()
    .withMessage("Trip is required.")
    .isInt({ min: 1 })
    .withMessage("Trip must be valid."),
  body("product_id")
    .trim()
    .notEmpty()
    .withMessage("Product is required.")
    .isInt({ min: 1 })
    .withMessage("Product must be valid."),
  body("quantity")
    .trim()
    .notEmpty()
    .withMessage("Quantity is required.")
    .isInt({ min: 1, max: 999 })
    .withMessage("Quantity must be between 1 and 999."),
  body("note")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Note maximum is 255 characters."),
];

const updateCartItemRules = [
  body("quantity")
    .trim()
    .notEmpty()
    .withMessage("Quantity is required.")
    .isInt({ min: 1, max: 999 })
    .withMessage("Quantity must be between 1 and 999."),
  body("note")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Note maximum is 255 characters."),
];

const removeCartItemRules = [];

const checkoutRules = [
  body("receiver_name")
    .trim()
    .isLength({ min: 2, max: 191 })
    .withMessage("Receiver name must be between 2 and 191 characters."),
  body("receiver_phone")
    .trim()
    .isLength({ min: 8, max: 30 })
    .withMessage("Receiver phone must be between 8 and 30 characters."),
  body("shipping_address")
    .trim()
    .isLength({ min: 8, max: 2000 })
    .withMessage("Shipping address must be at least 8 characters."),
  body("province")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Province must be between 2 and 120 characters."),
  body("city")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("City must be between 2 and 120 characters."),
  body("postal_code")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Postal code must be between 3 and 20 characters."),
  body("payment_method")
    .trim()
    .isIn(["qris_mnc"])
    .withMessage("Payment method is invalid."),
  body("guest_email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Guest email must be valid.")
    .isLength({ max: 191 })
    .withMessage("Guest email maximum is 191 characters."),
  body("guest_phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 8, max: 30 })
    .withMessage("Guest phone must be between 8 and 30 characters."),
  body("checkout_notes")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Checkout notes maximum is 2000 characters."),
];

module.exports = {
  addToCartRules,
  updateCartItemRules,
  removeCartItemRules,
  checkoutRules,
};
