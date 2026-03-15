import nodemailer from "nodemailer";

/**
 * Mail Utility for Cinta Dhuafa Web
 * 
 * To use this in production, set the following environment variables:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "test@example.com",
    pass: process.env.SMTP_PASS || "password",
  },
});

export async function sendResetPasswordEmail(to: string, resetLink: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Cinta Dhuafa" <no-reply@cintadhuafa.org>',
    to,
    subject: "Reset Password - Cinta Dhuafa",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 10px;">
        <h2 style="color: #0d9488; text-align: center;">Reset Password Anda</h2>
        <p>Halo,</p>
        <p>Anda menerima email ini karena kami menerima permintaan untuk mereset password akun Anda di <strong>Cinta Dhuafa</strong>.</p>
        <p>Silakan klik tombol di bawah ini untuk mereset password Anda:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>
        <p>Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.messageId);
    if (process.env.NODE_ENV !== "production") {
      console.log("Preview URL: " + nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Gagal mengirim email reset password");
  }
}
