// utils/sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  const mailOptions = {
    from: `"NativeNest" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;