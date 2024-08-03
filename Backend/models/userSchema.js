import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    lowercase: true, 
    unique: true, 
    required: [true, "Email can't be blank"], 
    match: [/\S+@\S+\.\S+/, 'Email is invalid'],
    index: true 
  },
  password: { 
    type: String, 
    required: [true, "Password can't be blank"] 
  },
  resetOTP: {
    type: Number
  },
  resetOTPExpires: {
    type: Date
  }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
