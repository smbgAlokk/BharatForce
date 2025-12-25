const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  console.log(`📨 Initiating email send to: ${options.email}`);

  // 1. Create Transporter (Using Resend SMTP)
  // This bypasses the Google/Render firewall block completely.
  const transporter = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 465,
    secure: true, // Uses SSL
    auth: {
      user: "resend", // This is ALWAYS the username for Resend
      pass: process.env.RESEND_API_KEY, // We will add this to Render next
    },
  });

  // 2. Define Email Options
  const mailOptions = {
    // IMPORTANT: If you haven't verified a domain on Resend yet,
    // you MUST use 'onboarding@resend.dev' as the FROM address.
    from: "BharatForce Security <onboarding@resend.dev>",
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

  // 3. Send
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully via Resend: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email Service Failed:", error);
    throw new Error(error.message);
  }
};

module.exports = sendEmail;
