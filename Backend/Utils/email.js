const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  console.log(`📨 Initiating email send to: ${options.email}`);

  // 1. Create Transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use STARTTLS (standard for port 587)
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD, // Must be App Password
    },
    // ✅ CRITICAL FIX: Network & Reliability Settings
    // 1. Force IPv4 (Fixes the ETIMEDOUT on Render/Docker)
    family: 4,
    // 2. Timeout settings to fail fast if blocked
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    // 3. Relax TLS for cloud environments
    tls: {
      rejectUnauthorized: false,
      ciphers: "SSLv3",
    },
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
    // Verify connection configuration before sending (Optional debug step)
    await transporter.verify();
    console.log("✅ SMTP Server is ready to take our messages");

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email Service Failed:", error);
    // Throw error so the Controller handles the 500 response
    throw new Error(`Email failed: ${error.message}`);
  }
};

module.exports = sendEmail;
