require('dotenv').config();
const { sendRegistrationConfirmationEmail } = require('./utils/email');

// Test registration email
const testEmail = async () => {
  console.log('Testing registration confirmation email...');
  console.log('Email config:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET'
  });

  const testEventDetails = {
    title: 'Test Event - Registration Email',
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    end_time: new Date(Date.now() + 25 * 60 * 60 * 1000),
    location: 'Test Location, Kathmandu',
    event_id: 999
  };

  const testTicketDetails = {
    ticket_id: 12345,
    type_name: 'General Admission',
    price: 500
  };

  try {
    const result = await sendRegistrationConfirmationEmail(
      process.env.EMAIL_USER, // Send to yourself
      'Test User',
      testEventDetails,
      testTicketDetails
    );
    console.log('✓ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    process.exit(0);
  } catch (error) {
    console.error('✗ Test email failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

testEmail();
