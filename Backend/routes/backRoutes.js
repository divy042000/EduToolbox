import express from "express";
import { Router } from "express"; // Correctly importing Router from Express
import { SignUp, SignIn, ForgotPassword, ArticlesApi} from "../controllers/authController.js"; // Assuming SignUp and SignIn are exported from authController
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// const app = express(); // Initialize Express app
const router = Router(); // Initialize Express Router

// Define routes
router.post("/SignUp/user", SignUp); // Use imported functions directly
router.post("/SignIn/user", SignIn);
router.put("/ForgetPassword/user", ForgotPassword);
router.get("/history/articlesApi",ArticlesApi);
router.get("/history/paraphraserApi",ParaphraserApi);
router.get("/history/chatGPT",ChatApi);


// Export the router
export default router;
