const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Gmail transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,       // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (NOT your regular password)
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { fullName, email, projectType, projectDetails } = req.body;

  // Basic validation
  if (!fullName || !email || !projectType || !projectDetails) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.'
    });
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.'
    });
  }

  try {
    // Email to YOUR company (notification)
    const companyMailOptions = {
      from: `"Contact Form" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,                        // Receives to your Gmail
      replyTo: email,                                     // Reply goes to the customer
      subject: `New Inquiry: ${projectType} — ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #000; padding-bottom: 10px;">New Contact Form Submission</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; background: #fff; border: 1px solid #e0e0e0; font-weight: bold; width: 35%;">Full Name</td>
              <td style="padding: 10px; background: #fff; border: 1px solid #e0e0e0;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f5f5f5; border: 1px solid #e0e0e0; font-weight: bold;">Email</td>
              <td style="padding: 10px; background: #f5f5f5; border: 1px solid #e0e0e0;">
                <a href="mailto:${email}" style="color: #1a1a1a;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #fff; border: 1px solid #e0e0e0; font-weight: bold;">Project Type</td>
              <td style="padding: 10px; background: #fff; border: 1px solid #e0e0e0;">${projectType}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f5f5f5; border: 1px solid #e0e0e0; font-weight: bold; vertical-align: top;">Project Details</td>
              <td style="padding: 10px; background: #f5f5f5; border: 1px solid #e0e0e0; white-space: pre-wrap;">${projectDetails}</td>
            </tr>
          </table>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Received: ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC<br>
            Reply directly to this email to respond to ${fullName}.
          </p>
        </div>
      `
    };

    // Auto-reply to the CUSTOMER
    const customerMailOptions = {
      from: `"Your Company" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `We received your message, ${fullName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #1a1a1a;">Thanks for reaching out!</h2>
          
          <p style="color: #333; line-height: 1.6;">Hi ${fullName},</p>
          
          <p style="color: #333; line-height: 1.6;">
            We've received your message about <strong>${projectType}</strong> and will get back to you within one business day.
          </p>
          
          <div style="background: #fff; border-left: 4px solid #000; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;"><strong>Your message:</strong></p>
            <p style="margin: 10px 0 0; color: #333; white-space: pre-wrap;">${projectDetails}</p>
          </div>
          
          <p style="color: #333; line-height: 1.6;">
            Best regards,<br>
            <strong>The Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #999; font-size: 11px;">
            This is an automated confirmation. Please do not reply to this email directly.
          </p>
        </div>
      `
    };

    // Send both emails
    await transporter.sendMail(companyMailOptions);
    await transporter.sendMail(customerMailOptions);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully!'
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
