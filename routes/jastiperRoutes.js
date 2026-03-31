const express = require("express");
const jastiperController = require("../controllers/jastiperController");
const authMiddleware = require("../middleware/authMiddleware");
const { allowJastiper } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");
const { tripRules, productRules } = require("../middleware/jastiperValidators");

const router = express.Router();

router.use(authMiddleware, allowJastiper);

router.get("/dashboard", jastiperController.dashboard);
router.get("/profile", jastiperController.profile);
router.get("/trips", jastiperController.listTrips);
router.get("/trips/create", jastiperController.showCreateTrip);
router.post(
  "/trips",
  upload.single("cover_image"),
  tripRules,
  validationMiddleware,
  jastiperController.createTrip,
);
router.get("/trips/:id/edit", jastiperController.showEditTrip);
router.put(
  "/trips/:id",
  upload.single("cover_image"),
  tripRules,
  validationMiddleware,
  jastiperController.updateTrip,
);
router.delete("/trips/:id", jastiperController.deleteTrip);
router.post("/trips/:id/publish", jastiperController.publishTrip);
router.post("/trips/:id/unpublish", jastiperController.unpublishTrip);
router.post("/trips/:id/close", jastiperController.closeTrip);
router.post("/trips/:id/duplicate", jastiperController.duplicateTrip);

router.get("/trips/:id/products", jastiperController.tripProducts);
router.get("/products/create", jastiperController.showCreateProduct);
router.post(
  "/products",
  upload.single("product_image"),
  productRules,
  validationMiddleware,
  jastiperController.createProduct,
);
router.get("/products/:id/edit", jastiperController.showEditProduct);
router.put(
  "/products/:id",
  upload.single("product_image"),
  productRules,
  validationMiddleware,
  jastiperController.updateProduct,
);
router.delete("/products/:id", jastiperController.deleteProduct);
router.post("/products/:id/hide", jastiperController.hideProduct);
router.post("/products/:id/show", jastiperController.showProduct);
router.post("/products/:id/sold-out", jastiperController.soldOutProduct);
router.post("/products/:id/duplicate", jastiperController.duplicateProduct);

router.get("/orders", jastiperController.orders);
router.get("/orders/:id", jastiperController.orderDetail);

module.exports = router;
