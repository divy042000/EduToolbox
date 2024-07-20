import { Router } from "express";
import {
  SignUp,
  SignIn,
  ForgotPassword,
  AuthenticateToken,
} from "../controllers/authController.js"; // Assuming SignUp and SignIn are exported from authController
import {UrlShortner} from "../services/urlShortner.js"
import RateLimiter from "../controllers/tokenBucket.js"
import {ParaphraserService} from "../services/paraphraseIt.js"
// import { config as dotenvConfig } from "dotenv";


const router = Router();

// Define routes
router.post("/SignUp/user", SignUp);
router.post("/SignIn/user", RateLimiter, SignIn);
router.post("/ForgetPassword/user",ForgotPassword);
// router.post("/UrlShortner", AuthenticateToken,UrlShortner);
// router.post("/Paraphrase/user",AuthenticateToken,ParaphraserService);
// router.get("/AISummarizer/user",AuthenticateToken,getArticleSummary);
// router.post("/UrlShortner", AuthenticateToken,RateLimiter,UrlShortner)
// router.post("/Paraphrase/user",AuthenticateToken,RateLimiter,ParaphraserService)
router.post("/UrlShortner", AuthenticateToken,RateLimiter,UrlShortner)
router.post("/Paraphrase/user",AuthenticateToken,RateLimiter,ParaphraserService)
// router.get("/history/articlesApi",ArticlesApi);
// router.get("/history/paraphraserApi",ParaphraserApi);
// router.get("/history/chatGPT",ChatApi);

// Export the router
export default router;
