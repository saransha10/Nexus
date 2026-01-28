require('dotenv').config();
const nodemailer = require('nodemailer');

// Test email configuration
async function testEmail() {
  console.log('Testing email configuration...\n');
  
  console.log('Environment variables:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET');
  console.log('');

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    debug: true, // Enable debug output
    logger: true  // Log to console
  });

  try {
    // Verify connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    // Send test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"Nexus Events Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email from Nexus Events',
      html: `
        <h1>Test Email</h1>
        <p>If you receive this email, your email configuration is working correctly!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\nCheck your inbox:', process.env.EMAIL_USER);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔴 Authentication failed!');
      console.error('Solutions:');
      console.error('1. Make sure 2-Step Verification is enabled on your Google account');
      console.error('2. Generate a new App Password at: https://myaccount.google.com/apppasswords');
      console.error('3. Copy the 16-character password (remove spaces)');
      console.error('4. Update EMAIL_PASSWORD in .env file');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🔴 Connection failed!');
      console.error('Solutions:');
      console.error('1. Check your internet connection');
      console.error('2. Make sure port 587 is not blocked by firewall');
      console.error('3. Try using port 465 with secure: true');
    }
  }
}

testEmail();
