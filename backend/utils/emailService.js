const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Email service configuration error:', error);
    } else {
        console.log('Email server is ready to take messages');
    }
});

/**
 * Reusable function to send emails
 * @param {string} to - Recipient email address
 * @param {string} subject - Subject line of the email
 * @param {string} text - Plain text body
 * @param {string} html - HTML body (optional markup)
 */
const sendEmail = async (to, subject, text, html = '') => {
    try {
        const mailOptions = {
            from: `"MovBooking" <${process.env.EMAIL_USER}>`, // Sender address name
            to: to,                                          // List of receivers
            subject: subject,                                // Subject line
            text: text,                                      // Plain text body
            html: html                                       // HTML body string
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};

module.exports = sendEmail;
