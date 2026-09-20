// src/utils/sendEmail.js
import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  const sanitizedPassword = (process.env.SMTP_PASSWORD || '').replace(/\s+/g, '').trim();
  const smtpUser = (process.env.SMTP_MAIL || '').trim();
  const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const rawPort = Number(process.env.SMTP_PORT) || 587;
  // Port 465 is blocked on cloud hosting like Render/AWS. Force Port 587 with STARTTLS.
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
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 15000,
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