import { config as dotenvConfig } from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/userSchema.js"; // Update the path to your User model
dotenvConfig();
import nodemailer from "nodemailer";
import { get, set } from "./redisClient.js";

const default_ttl = 10;

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
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
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

    // Set the user data in Redis cache with an expiration time of 1 hour (3600 seconds)
    await set(email, JSON.stringify(user), default_ttl);
    console.log(`User ${email} set in cache with expiration of 1 hour`);

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
      user = await User.findOne({ email }); // Fetch user from MongoDB if not found in Redis
      if (user) {
        // Validate the provided password against the user's hashed password
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
          // Set the user data in Redis with a TTL (e.g., 3600 seconds = 1 hour)
          await set(email, JSON.stringify(user), default_ttl);
          return user; // Return the user object if password is valid
        } else {
          throw new Error("Invalid password"); // Throw an error if the password is invalid
        }
      }
    } else {
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
    const user = await getUser(email, password);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    // Generate token (assuming you have a function to do so)
    // const token = generateToken(user.id); // Replace generateToken with your actual token generation logic

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

    res
     .status(200)
     .json({ message: "Please check your email for your OTP." });
  } catch (error) {
    console.error(error);
    res
     .status(500)
     .json({ message: "An error occurred. Please try again later." });
  }
};

export { SignUp, SignIn, ForgotPassword };
