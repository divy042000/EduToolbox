import { config as dotenvConfig } from "dotenv";
import bcrypt from "bcrypt";
import { User } from "../models/userSchema.js"; // Update the path to your User model
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { get, set, del } from "./redisClient.js";

// creating middle ware
dotenvConfig();


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

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object
    await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
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

    const user = await User.findOne({ email });
    // Authenticate user
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    //Check password 
    const isPassword = await bcrypt.compare(user.password, password);

    if (!isPassword) {
      return res
        .status(401)
        .json({ message: "Incorrect password" });
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

    res.status(200).json({ message: "Sign in successful" });
  }
  catch (error) {
    console.error("Sign in error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const ForgotPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!(oldPassword && newPassword && confirmPassword)) {
      return res
        .status(400)
        .json({ message: "All fields are required" });
    }

    const user = await User.findById(req.user.id);

    if(newPassword !== confirmPassword) {
      return res
       .status(400)
       .json({ message: "New password and confirmation password do not match" });
    }

    const isPassword = await bcrypt.compare(user.password, oldPassword);

    if(!isPassword) {
      return res
        .status(401)
        .json({ message: "Incorrect password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findByIdAndUpdate(req.user.id, {password: hashedPassword}, {new: true});

    res.status(200).json({ message: "Password updated successfully" });
  }
  catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
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
      if (typeof decoded === "string" || !decoded.email) {
        return res.status(401).json({ message: "Invalid token" });
      }

      if (decoded && typeof decoded !== "string" && decoded.email) {
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

export { SignUp, SignIn, Logout, ForgotPassword };
