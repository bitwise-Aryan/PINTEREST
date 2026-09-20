// src/utils/sendEmail.js
import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  const isGmail = process.env.SMTP_SERVICE?.toLowerCase() === 'gmail' || process.env.SMTP_HOST?.includes('gmail');
  const sanitizedPassword = (process.env.SMTP_PASSWORD || '').replace(/\s+/g, '').trim();
  const smtpUser = (process.env.SMTP_MAIL || '').trim();

  let transportConfig;

  if (isGmail) {
    transportConfig = {
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: sanitizedPassword,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    };
  } else {
    transportConfig = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: smtpUser,
        pass: sanitizedPassword,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    };
  }

  const transporter = nodeMailer.createTransport(transportConfig);

  const options = {
    from: `"Pinterest" <${smtpUser}>`,
    to: email,
    subject,
    html: message,
  };

  await transporter.sendMail(options);
};