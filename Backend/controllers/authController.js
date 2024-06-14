import { config as dotenvConfig } from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/userSchema.js"; // Update the path to your User model
dotenvConfig();
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getAsync, setAsync } from "../server.js";


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

    // Create a new user
    const user = new User({
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function getUser(cacheKey) {
  try {
    let user = await getAsync(cacheKey);
    console.log(user);
    if (!user) {
      user = await User.findOne({ email: cacheKey }); // Assuming the cache key is the email
      if (user) {
        await setAsync(cacheKey, JSON.stringify(user)); // Update cache with user data
      }
    }
    return user;
  } catch (error) {
    console.error('Failed to retrieve user:', error.message);
    throw error; // Rethrow or handle as needed
  }
}

const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!(email && password)) {
      return res
      .status(400)
      .json({ message: "Email and password are required" });
    }  
    console.log(email);

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Retrieve user from cache or database
    const user = await getUser(email);
    console.log(user);
    if (!user) {
      return res
      .status(404)
      .json({ message: "User with this email does not exist" });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate token (assuming you have a function to do so)
    // const token = generateToken(user.id); // Replace generateToken with your actual token generation logic

    res.status(200).stringify("hello user");
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
   console.log(email);
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account with that email found." });
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set the reset token and expiry on the user object
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 30000; // Expires in 1 hour

    // Save the user object
    await user.save();

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Reset your password',
      text: `You requested a password reset. Click this link to set a new password: http://example.com/reset/${resetToken}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Please check your email for further instructions." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};



export { SignUp, SignIn,ForgotPassword };
