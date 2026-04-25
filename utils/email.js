const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
  // 1. create transporter — service that sends email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  console.log('Email config:', {
    // ← add this
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USERNAME,
  });
  const emailOptions = {
    from: 'Harshil sharma <harshil.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  try {
    await transporter.sendMail(emailOptions);
  } catch (err) {
    console.log('EXACT EMAIL ERROR:', err); // ← add this
    throw err;
  }
};
module.exports = sendEmail;
