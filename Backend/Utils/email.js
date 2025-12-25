const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  console.log(`📨 Initiating email send to: ${options.email}`);

  // 1. Create Transporter
  // ✅ FIX: Use Port 587 (STARTTLS) instead of 465.
  // This is the standard for cloud servers like Render/AWS/Heroku.
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Must be FALSE for port 587. (It upgrades to secure later)
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD, // Must be App Password
    },
    // Reliability Settings
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false, // Helps avoid certificate handshake failures in some cloud envs
    },
    connectionTimeout: 10000,
  });

  // 2. Define Email Options
  const mailOptions = {
    from: '"BharatForce Security" <no-reply@bharatforce.com>',
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">BharatForce</h1>
        </div>
        <div style="padding: 30px; color: #374151;">
          <h2 style="margin-top: 0;">Reset Your Password</h2>
          ${options.message}
          <p style="margin-top: 25px; font-size: 12px; color: #6b7280;">If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `,
  };

  // 3. Send and verify
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email Service Failed:", error);
    // Throw error so the Controller knows to send a 500 response
    throw new Error(error.message);
  }
};

module.exports = sendEmail;
