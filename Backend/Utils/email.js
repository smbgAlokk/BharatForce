const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  console.log(`📨 Initiating email send to: ${options.email}`);

  // 1. Create Transporter
  // We add 'connectionTimeout' to stop the infinite loading if Gmail blocks us
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME, // Your Render Env Var
      pass: process.env.EMAIL_PASSWORD, // Your Render Env Var (MUST be App Password)
    },
    // TIMEOUT SETTINGS (Fixes the infinite load bug)
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  // 2. Define Email Options
  const mailOptions = {
    from: '"BharatForce Security" <no-reply@bharatforce.com>',
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">BharatForce</h1>
        </div>

        <div style="padding: 30px; color: #374151; line-height: 1.6;">
          <h2 style="color: #111827; margin-top: 0;">Reset Your Password</h2>
          <p>Hello,</p>
          ${options.message}
          <p style="margin-top: 25px;">If you didn't request this, you can safely ignore this email.</p>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
          &copy; 2025 BharatForce Inc. All rights reserved.
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
    throw new Error("Email could not be sent. Please check server logs.");
  }
};

module.exports = sendEmail;
