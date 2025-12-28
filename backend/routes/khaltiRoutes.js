const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticate } = require('../middlewares/auth');

// Khalti ePayment API endpoints
// Sandbox: https://dev.khalti.com/api/v2/ (for testing)
// Production: https://khalti.com/api/v2/ (for live)
const KHALTI_API_URL = process.env.KHALTI_ENV === 'production' 
  ? 'https://khalti.com/api/v2' 
  : 'https://dev.khalti.com/api/v2';

// Initiate Khalti Payment
router.post('/initiate', authenticate, async (req, res) => {
  try {
    const { amount, purchase_order_id, purchase_order_name, customer_info } = req.body;

    console.log('Received payment request:', { amount, purchase_order_id, purchase_order_name });
    console.log('Amount type:', typeof amount, 'Value:', amount);

    // Validate required fields
    if (!amount || !purchase_order_id || !purchase_order_name) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, purchase_order_id, purchase_order_name' 
      });
    }

    // Amount must be in paisa (1 Rs = 100 paisa) and >= 1000 paisa (Rs. 10)
    const amountInPaisa = Math.round(amount * 100);
    console.log('Amount in paisa:', amountInPaisa);
    
    if (amountInPaisa < 1000) {
      return res.status(400).json({ 
        error: 'Amount must be at least Rs. 10' 
      });
    }

    // Prepare payload for Khalti
    const payload = {
      return_url: `${process.env.FRONTEND_URL}/payment/verify`,
      website_url: process.env.FRONTEND_URL || 'http://localhost:5173',
      amount: amountInPaisa,
      purchase_order_id: purchase_order_id,
      purchase_order_name: purchase_order_name,
      customer_info: customer_info || {
        name: req.user.full_name || 'Customer',
        email: req.user.email,
        phone: req.user.phone || '9800000000'
      }
    };

    console.log('Sending to Khalti:', JSON.stringify(payload, null, 2));

    // Make request to Khalti
    const response = await axios.post(
      `${KHALTI_API_URL}/epayment/initiate/`,
      payload,
      {
        headers: {
          'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Return payment URL and pidx to frontend
    res.json({
      success: true,
      pidx: response.data.pidx,
      payment_url: response.data.payment_url,
      expires_at: response.data.expires_at,
      expires_in: response.data.expires_in
    });

  } catch (error) {
    console.error('Khalti initiate error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to initiate payment',
      details: error.response?.data || error.message
    });
  }
});

// Verify/Lookup Khalti Payment
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ error: 'pidx is required' });
    }

    // Lookup payment status from Khalti
    const response = await axios.post(
      `${KHALTI_API_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Return verification result
    res.json({
      success: true,
      ...response.data
    });

  } catch (error) {
    console.error('Khalti verify error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to verify payment',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
