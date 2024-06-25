import express from "express";
import { Router } from "express"; // Correctly importing Router from Express
import {
  SignUp,
  SignIn,
  ForgotPassword,
  AuthenticateToken,
} from "../controllers/authController.js"; // Assuming SignUp and SignIn are exported from authController
import {UrlShortner} from "../services/urlShortner.js";
import RateLimiter from "../controllers/tokenBucket.js";
import {ParaphraserService} from "../services/paraphraseIt.js";
// import { config as dotenvConfig } from "dotenv";


const router = Router(); // Initialize Express Router

// Define routes
router.post("/SignUp/user", SignUp); // Use imported functions directly
router.post("/SignIn/user",SignIn);
router.put("/ForgetPassword/user", ForgotPassword);
router.post("/UrlShortner", AuthenticateToken,RateLimiter,UrlShortner)
router.post("/Paraphrase/user",AuthenticateToken,RateLimiter,ParaphraserService);
// router.get("/history/articlesApi",ArticlesApi);
// router.get("/history/paraphraserApi",ParaphraserApi);
// router.get("/history/chatGPT",ChatApi);

// Export the router
export default router;
