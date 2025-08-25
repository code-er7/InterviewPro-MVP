import { Router } from "express";
import { login, signup } from "../controllers/authController.js";

const router = Router();

// POST /api/auth/signup
router.post("/signup", signup);

// POST /api/auth/login
router.post("/login", login);

export default router ;
