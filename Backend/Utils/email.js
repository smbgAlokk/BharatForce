const { Resend } = require("resend");

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  console.log(`📨 Initiating email via Resend API to: ${options.email}`);

  try {
    const data = await resend.emails.send({
      // IMPORTANT: Until you verify your domain, you MUST use this email:
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
    });

    if (data.error) {
      console.error("❌ Resend API Error:", data.error);
      throw new Error(data.error.message);
    }

    console.log(`✅ Email sent successfully! ID: ${data.data.id}`);
  } catch (error) {
    console.error("❌ Email System Failure:", error.message);
    throw new Error("Could not send email. Please try again later.");
  }
};

module.exports = sendEmail;
