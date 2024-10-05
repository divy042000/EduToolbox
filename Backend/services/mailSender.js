import { createTransport } from "nodemailer";

const mailSender = async(email, subject, message) => {
    try {
        const transporter = createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_ADDRESS,
            to: email,
            subject,
            text: message,
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error(error);
        throw new Error('Failed to send email');
    }
};

export default mailSender;