// src/utils/sendEmail.js
import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  // 1. If RESEND_API_KEY is provided, use Resend HTTPS REST API (Port 443 - NEVER blocked on Render Free Tier)
  if (process.env.RESEND_API_KEY) {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PIXEL <onboarding@resend.dev>',
        to: [email],
        subject,
        html: message,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.warn('Resend API failed, falling back to SMTP:', errText);
    } else {
      console.log(`Email successfully sent via Resend API to ${email}`);
      return;
    }
  }

  // 2. Standard SMTP Fallback
  const sanitizedPassword = (process.env.SMTP_PASSWORD || '').replace(/\s+/g, '').trim();
  const smtpUser = (process.env.SMTP_MAIL || '').trim();
  const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const rawPort = Number(process.env.SMTP_PORT) || 587;
  const port = rawPort === 465 ? 587 : rawPort;

  const transporter = nodeMailer.createTransport({
    host: smtpHost,
    port: port,
    secure: false, // Port 587 uses STARTTLS
    requireTLS: true,
    auth: {
      user: smtpUser,
      pass: sanitizedPassword,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });

  const senderEmail = smtpUser || 'teckstackpixel@gmail.com';

  const options = {
    from: `"PIXEL • Team Techstack" <${senderEmail}>`,
    replyTo: 'teckstackpixel@gmail.com',
    to: email,
    subject,
    html: message,
  };

  await transporter.sendMail(options);
};