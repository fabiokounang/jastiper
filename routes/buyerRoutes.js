const express = require("express");
const buyerController = require("../controllers/buyerController");
const authMiddleware = require("../middleware/authMiddleware");
const { allowBuyer } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, allowBuyer);

router.get("/dashboard", buyerController.dashboard);
router.get("/profile", buyerController.profile);
router.get("/orders", (_req, res) => res.send("Stage 4: Buyer orders list"));
router.get("/orders/:id", (_req, res) => res.send("Stage 4: Buyer order detail"));
router.get("/payments", (_req, res) => res.send("Stage 5: Buyer payments"));

module.exports = router;
