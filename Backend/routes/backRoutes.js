import express from "express";
import { Router } from "express"; // Correctly importing Router from Express
import {
  SignUp,
  SignIn,
  ForgotPassword,
  AuthenticateToken,
} from "../controllers/authController.js"; // Assuming SignUp and SignIn are exported from authController
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// const app = express(); // Initialize Express app
const router = Router(); // Initialize Express Router

// Define routes
router.post("/SignUp/user", SignUp); // Use imported functions directly
router.post("/SignIn/user", SignIn);
router.put("/ForgetPassword/user", ForgotPassword);
router.get("/protected", AuthenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});
// router.get("/history/articlesApi",ArticlesApi);
// router.get("/history/paraphraserApi",ParaphraserApi);
// router.get("/history/chatGPT",ChatApi);

// Export the router
export default router;
