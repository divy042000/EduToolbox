import mongoose from "mongoose";
import mailSender from "../services/mailSender";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expiresAt: Date.now() + 60000
    }
});

async function sendMail (email, otp) {
    try {
        await mailSender(email, "OTP", `Your OTP is ${otp}`);
        console.log("OTP email sent successfully");
    }
    catch (error) {
        console.error("Failed to send OTP email:", error);
        throw error;
    }
};

otpSchema.pre("save", async function(next) {
    try {
        await sendMail(this.email, this.otp);
        next();
    }
    catch (error) {
        next(error);
    }
})

