import express from "express";
import { Router } from "express";
import {
  SignUp,
  SignIn,
  ForgotPassword,
  AuthenticateToken,
} from "../controllers/authController.js"; // Assuming SignUp and SignIn are exported from authController
import {UrlShortner} from "../services/urlShortner.js"
import RateLimiter from "../controllers/tokenBucket.js"
// import { config as dotenvConfig } from "dotenv";


const router = Router();

// Define routes
router.post("/SignUp/user", SignUp);
router.post("/SignIn/user", SignIn);
router.put("/ForgetPassword/user", ForgotPassword);
router.post("/UrlShortner", AuthenticateToken,RateLimiter,UrlShortner)
// router.get("/history/articlesApi",ArticlesApi);
// router.get("/history/paraphraserApi",ParaphraserApi);
// router.get("/history/chatGPT",ChatApi);

// Export the router
export default router;
