const express = require("express");
const publicController = require("../controllers/publicController");
const validationMiddleware = require("../middleware/validationMiddleware");
const {
  addToCartRules,
  updateCartItemRules,
  checkoutRules,
} = require("../middleware/publicValidators");

const router = express.Router();

router.get("/", publicController.home);
router.get("/trip/:slug", publicController.publicTripDetail);
router.get(
  "/trip/:slug/product/:productSlug",
  publicController.publicProductDetail,
);
router.get("/cart", publicController.cart);
router.post("/cart/add", addToCartRules, validationMiddleware, publicController.addToCart);
router.put("/cart/items/:itemId", updateCartItemRules, validationMiddleware, publicController.updateCartItem);
router.delete("/cart/items/:itemId", publicController.removeCartItem);
router.get("/checkout", publicController.checkout);
router.post("/checkout", checkoutRules, validationMiddleware, publicController.placeOrder);
router.get("/checkout/success", publicController.checkoutSuccess);

module.exports = router;
