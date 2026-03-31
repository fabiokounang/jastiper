const express = require("express");
const jastiperController = require("../controllers/jastiperController");
const authMiddleware = require("../middleware/authMiddleware");
const { allowJastiper } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, allowJastiper);

router.get("/dashboard", jastiperController.dashboard);
router.get("/profile", jastiperController.profile);
router.get("/trips", (_req, res) => res.send("Stage 3: trip list"));
router.get("/trips/create", (_req, res) => res.send("Stage 3: create trip"));
router.get("/trips/:id/edit", (_req, res) => res.send("Stage 3: edit trip"));
router.get("/trips/:id/products", (_req, res) => res.send("Stage 3: trip products"));
router.get("/products/create", (_req, res) => res.send("Stage 3: create product"));
router.get("/products/:id/edit", (_req, res) => res.send("Stage 3: edit product"));
router.get("/orders", (_req, res) => res.send("Stage 3: orders"));
router.get("/orders/:id", (_req, res) => res.send("Stage 3: order detail"));

module.exports = router;
