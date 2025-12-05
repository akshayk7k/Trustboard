const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: String(process.env.EMAIL_SECURE).toLowerCase() === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add timeouts to prevent hanging
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000,    // 5 seconds
  socketTimeout: 10000,     // 10 seconds
});

// Verify connection configuration
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP Connection Verified: Ready to send emails");
  } catch (error) {
    console.error("❌ SMTP Connection Failed:", error.message);
  }
};

const sendEmail = async ({ to, subject, text, html }) => {
  console.log("Attempting to send email...");
  console.log("Transporter Config:", {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    user: process.env.EMAIL_USER ? "***" : "MISSING",
    pass: process.env.EMAIL_PASS ? "***" : "MISSING",
  });

  try {
    const info = await transporter.sendMail({
      from: `"Trustboard" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail, verifyConnection };
