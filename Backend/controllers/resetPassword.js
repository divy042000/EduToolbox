import bcrypt from 'bcrypt';
import { User } from '../models/userSchema';
import mailSender from '../services/mailSender';
import { randomBytes } from 'crypto';

// Reset Password Token
export const resetPasswordToken = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = randomBytes(20).toString('hex');

        const upDatedDetails = await User.findOneAndUpdate(
            { email: email }, 
            { token: token, resetPasswordExpires: Date.now() + 5*60000 }
        );

        const url = `http://localhost:3000/update-password/${token}`;

        await mailSender(email, "Password Reset", `Click <a href="${url}">here</a> to reset your password`);

        return res.status(200).json({ 
            message: 'Password reset link sent to email',
            success: true
        });
    } 
    catch (error) {
        console.error('Error sending password reset link:', error);
        res.status(500).json({ 
            message: 'Failed to send password reset link',
            success: false
        });
    }
};

// Update Password
export const resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                message: 'Passwords do not match',
                success: false 
            });
        }

        const userDetails = await User.findOne({ token: token });

        if (!userDetails) {
            return res.status(404).json({
                message: 'Invalid token',
                success: false
            });
        }

        if(userDetails.resetPasswordExpires.getTime() < Date.now()) {
            return res.status(400).json({
                message: 'Token expired',
                success: false
            });
        }

        await User.findOneAndUpdate(
            { token: token },
            { password: bcrypt.hash(password, 10) },
            { new: true }
        );

        return res.status(200).json({
            message: 'Password updated successfully',
            success: true
        });

    } 
    catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({
            message: 'Failed to update password',
            success: false
        });
    }
};