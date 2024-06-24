import express from "express";
import { Router } from "express";
import {
  SignUp,
  SignIn,
  ForgotPassword,
  AuthenticateToken,
} from "../controllers/authController.js"; // Assuming these functions are correctly exported
import { UrlShortner } from "../services/urlShortner.js";
import RateLimiter from "../controllers/tokenBucket.js";

const router = Router();

// Define routes
router.post("/SignUp/user", SignUp);
router.post("/SignIn/user", SignIn);
router.put("/ForgetPassword/user", ForgotPassword);
router.post("/UrlShortner", AuthenticateToken, RateLimiter, UrlShortner);

// Export the router
export default router;
