import nodemailer from 'nodemailer';

const sendEmail = async ({ sendTo, subject, html, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to your SMTP provider
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Dageshwar Store" <${process.env.SMTP_USER}>`,
      to: sendTo,
      subject,
      html,
      text, // Optional plain text fallback
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', sendTo);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Failed to send email');
  }
};

export { sendEmail };
