// src/utils/sendEmail.js
import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  // 1. BREVO HTTP REST API (Port 443 HTTPS - Free 300 emails/day to ANY recipient, no domain required)
  if (process.env.BREVO_API_KEY) {
    const brevoSender = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_MAIL || 'teckstackpixel@gmail.com';
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'PIXEL • Team Techstack', email: brevoSender },
        to: [{ email: email }],
        subject,
        htmlContent: message,
      }),
    });

    if (brevoRes.ok) {
      console.log(`✅ Email successfully sent via Brevo HTTP API to ${email}`);
      return;
    } else {
      const errText = await brevoRes.text();
      console.error('❌ Brevo API Error:', errText);
      throw new Error(`Brevo delivery failed: ${errText}`);
    }
  }

  // 2. RESEND HTTPS REST API (Port 443 HTTPS)
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

    if (resendRes.ok) {
      console.log(`✅ Email successfully sent via Resend API to ${email}`);
      return;
    } else {
      const errText = await resendRes.text();
      console.error('❌ Resend API Error:', errText);
      throw new Error(`Resend delivery failed: ${errText}`);
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