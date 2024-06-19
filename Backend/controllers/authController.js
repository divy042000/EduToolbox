import { config as dotenvConfig } from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/userSchema.js"; // Update the path to your User model
dotenvConfig();
import jwt, { decode } from "jsonwebtoken";
import nodemailer from "nodemailer";
import { get, set } from "./redisClient.js";
import express from "express";
import cookieParser from "cookie-parser";
import RateLimiter from "./tokenBucket.js";
// creating middle ware
const app = express();
app.use(cookieParser());

const AuthenticateToken = async (req, res, next) => {
  // Check if the token is in the 'Authorization' header
  const authHeader = req.headers["authorization"];
  let token;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  console.log("Token: " + token);

  try {
    // Decode the token without verifying the signature
    const decoded = jwt.decode(token);
    
    // Check if the token is expired
    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.iat + 86400 > currentTime && decoded.iat < currentTime) {
      console.log("Token is within the valid range.");

      // Verify the token with the secret
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      
      const cachedEmail = await get(verified.email);
      
      if (!cachedEmail) {
        return res.status(401).json({ message: "Token invalid or expired" });
      }
      req.user = { id: decoded.roles, email: decoded.email };
      next();
    } else {
      console.log("Token is expired or not within the valid range.");
      return res
        .status(401)
        .json({ message: "Token expired or not issued recently enough" });
    }
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

const SignUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!(email && password)) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Check password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$%*?&])[A-Za-z\d@$%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user object (not yet saved to the database)
    const user = { email, password: hashedPassword };

    // Save the user to the database
    const newUser = new User(user);
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUser = async (email, password) => {
  try {
    let user = await get(email); // Retrieve the user from Redis
    console.log(user);
    if (!user) {
      console.log("Reaching MongoDB");
      user = await User.findOne({ email }); // Fetch user from MongoDB if not found in Redis
      if (user) {
        // Validate the provided password against the user's hashed password
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
          // No explicit return needed here, just continue execution
          return user; // Return the user object if password is valid
        } else {
          throw new Error("Invalid password"); // Throw an error if the password is invalid
        }
      }
    } else {
      // No need to parse user here if get(email) returns a stringified JSON
      user = JSON.parse(user);
    }
    return user;
  } catch (error) {
    console.error("Failed to retrieve user:", error.message);
    throw error;
  }
};

const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!(email && password)) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Authenticate user
    const user = await getUser(email, password);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    // Generate JWT
    const payload = {
      iss: "edutoolbox.com", // Issuer
      sub: "1234567890", // Subject - could be a unique identifier for the user
      aud: "client-id", // Audience - intended recipient of the token
      iat: Math.floor(Date.now() / 1000), // Issued At - current Unix timestamp
      email: email, // Custom claim - user's email
      roles: "user", // Custom claim - user roles
    };

    const token = jwt.sign(
      payload, // Updated payload with standard and custom claims
      process.env.JWT_SECRET, // Secret key
      { expiresIn: "24h" } // Token expiration time
    );

    // Cache user details in Redis
    await set(email, token, process.env.AUTH_TTL);
    console.log(
      `User ${email} set in cache with expiration of ${process.env.AUTH_TTL} seconds`
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: process.env.TOKEN_TTL, // 1 hour
    });

    res.status(200).json({ message: "Sign in successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account with that email found." });
    }

    // Generate a four-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Set the OTP and expiry on the user object
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 60000; // Expires in 1 minute

    // Save the user object
    await user.save();

    // Send email with OTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Your OTP for password reset",
      text: `Your OTP is: ${otp}. Please enter this OTP to reset your password.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Please check your email for your OTP." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred. Please try again later." });
  }
};

export { SignUp, SignIn, ForgotPassword, AuthenticateToken };
