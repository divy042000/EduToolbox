import { Router } from "express";
import {
  SignUp,
  SignIn,
  ForgotPassword,
  AuthenticateToken,
} from "../controllers/authController.js"; // Assuming SignUp and SignIn are exported from authController
import { UrlShortner } from "../services/urlShortner.js";
import RateLimiter from "../controllers/tokenBucket.js";
import { ParaphraserService } from "../services/paraphraseIt.js";
import { RedirectService } from "../services/redirectUrl.js";
import { convertit } from "../services/pdfToJson.js";
import multer from "multer";
// import {getChatResponse} from "../services/aiChat.js"

const router = Router();

// defining multer configuration

// Define the storage strategy
// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     const dir = 'Backend/routes/uploads';
//     if (!fs.existsSync(dir)){
//         fs.mkdirSync(dir);
//     }
//     cb(null, dir);
//   },
//   filename: function(req, file, cb) {
//     cb(null, new Date().toISOString() + file.originalname);
//   }
// });
// Initialize Multer with the disk storage configuration
const upload = multer({ dest: 'uploads/' });

// Define routes
router.post("/SignUp/user", SignUp);
router.post("/SignIn/user", RateLimiter, SignIn);
router.put("/ForgetPassword/user", ForgotPassword);
router.get("/AISummarizer/user", AuthenticateToken);
router.post("/UrlShortner", AuthenticateToken, UrlShortner);
router.post("/Paraphrase/user", AuthenticateToken, ParaphraserService);
router.get("/shortUrl/:shortUrl", RedirectService);
router.post("/convert", upload.single('file'), convertit);
router.get("/chat-response", async (req, res) => {
  try {
    const response = await getChatResponse();
    res.send(response);
  } catch (error) {
    res.status(500).send("Error while fetching AI response");
  }
});
// router.get("/history/articlesApi",ArticlesApi);
// router.get("/history/paraphraserApi",ParaphraserApi);
// router.get("/history/chatGPT",ChatApi);

// Export the router
export default router;
