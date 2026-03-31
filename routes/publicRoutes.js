const express = require("express");
const publicController = require("../controllers/publicController");

const router = express.Router();

router.get("/", publicController.home);
router.get("/trip/:slug", publicController.publicTripDetail);
router.get(
  "/trip/:slug/product/:productSlug",
  publicController.publicProductDetail,
);
router.get("/cart", publicController.cart);
router.get("/checkout", publicController.checkout);

module.exports = router;
