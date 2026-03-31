const express = require("express");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const { allowAdmin } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, allowAdmin);

router.get("/dashboard", adminController.dashboard);
router.get("/users", adminController.users);
router.get("/users/:id", (_req, res) => res.send("Stage 6: User detail"));
router.get("/verifications", (_req, res) => res.send("Stage 6: Verifications"));
router.get("/jastipers", (_req, res) => res.send("Stage 6: Jastipers monitoring"));
router.get("/trips", (_req, res) => res.send("Stage 6: Trips monitoring"));
router.get("/products", (_req, res) => res.send("Stage 6: Products monitoring"));
router.get("/orders", (_req, res) => res.send("Stage 6: Orders monitoring"));
router.get("/payments", (_req, res) => res.send("Stage 6: Payments monitoring"));
router.get("/reports", (_req, res) => res.send("Stage 6: Reports"));

module.exports = router;
