import express from "express";
import { registerUser, loginUser, googleAuth, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/google", googleAuth);
router.get("/test", (req, res) => {
  res.send("Auth route working");
});

export default router;