const nodemailer = require('nodemailer');

const sendEmail = (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define a list of options
  const mailoptions = {
    from: 'Nathan Ohere <nathanohere@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Send email
  transporter.sendMail(mailoptions);
};

module.exports = sendEmail;
