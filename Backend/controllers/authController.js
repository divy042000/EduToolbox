import { config as dotenvConfig } from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/userSchema.js"; // Update the path to your User model
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { get, set, del } from "./redisClient.js";
import express from "express";
import cookieParser from "cookie-parser";
import Log from "../models/logSchema.js";
// creating middle ware
dotenvConfig();
const app = express();
app.use(cookieParser());
app.use(express.json());


const AuthenticateToken = async (req, res, next) => {
  // Check if the token is in the 'Authorization' header
  const authHeader = req.headers["authorization"];
  let token;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  console.log("Checking auth token :", token);
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Decode the token without verifying the signature
    const decoded = jwt.decode(token);

    // Check if the token is expired
    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.iat + 86400 > currentTime && decoded.iat < currentTime) {
      // Token is expired, attempt to verify and refresh
      try {
        // Verify the token with the secret
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const cachedEmail = await get(verified.email);

        if (!cachedEmail) {
          try {
            // Query MongoDB for the user document using the token
            const user = await User.findOne({ email: verified.email });

            if (!user) {
              return res
                .status(401)
                .json({ message: "Token invalid or expired" });
            }
            user.lastLogin = Date.now();
            await user.save();

            // Proceed with your logic here
            res.status(200).json({ message: "Authenticated successfully" });
            next();
          } catch (error) {
            console.error("Error querying MongoDB:", error);
            res.status(500).json({ message: "Internal server error" });
          }
        }
      } catch (error) {
        console.error("JWT verification failed:", error.message);
        res.status(401).json({ message: "Invalid token" });
      }
    } else {
      // Token is still valid, proceed with your logic
      res.status(200).json({ message: "Authenticated successfully" });
      next();
    }
  } catch (error) {
    console.error("JWT decoding failed:", error.message);
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

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    // Hash the password

    // Create a new user object (not yet saved to the database)
    const user = { email, password: password };

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

    if (!user) {
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
    // Cache the user details
    await set(email, token, process.env.AUTH_TTL);
    const newUser = new Log({ email, token });
    await newUser.save();
    res.status(200).json({ message: "Sign in successful", token: token });
  } catch (error) {
    console.error("Sign in error:", error);
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

const Logout = async (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    // Optionally, remove the user's token from Redis if you're storing it there
    const authHeader = req.headers["authorization"];
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (token) {
      const decoded = jwt.decode(token);
      if (decoded && decoded.email) {
        // Remove token from Redis
        await del(decoded.email);
      }
    }

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { SignUp, SignIn, Logout, ForgotPassword, AuthenticateToken };
