import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendTransactionNotification = async (
  email: string,
  transactionId: string,
  status: string,
  eventTitle: string
): Promise<void> => {
  const subject = `Transaction Update - ${eventTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Transaction Status Update</h2>
      <p>Your transaction for event <strong>${eventTitle}</strong> has been updated to: <strong>${status}</strong></p>
      <p>Transaction ID: ${transactionId}</p>
      <p>If you have any questions, please contact our support team.</p>
      <br>
      <p>Best regards,<br>Event Management Team</p>
    </div>
  `;

  await sendEmail(email, subject, html);
};