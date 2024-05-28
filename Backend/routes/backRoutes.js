import express from "express";
import { Router } from "express"; // Correctly importing Router from Express
import { SignUp, SignIn, ForgotPassword } from "../controllers/authController.js"; // Assuming SignUp and SignIn are exported from authController
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// const app = express(); // Initialize Express app
const router = Router(); // Initialize Express Router

// Define routes
router.post("/SignUp/user", SignUp); // Use imported functions directly
router.post("/SignIn/user", SignIn);
router.put("/ForgetPassword/user", ForgotPassword);

// Export the router
export default router;
