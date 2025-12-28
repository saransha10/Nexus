const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { authenticate } = require('../middlewares/auth');

// eSewa Payment Gateway endpoints
const ESEWA_PAYMENT_URL = process.env.ESEWA_ENV === 'production'
  ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
  : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

const ESEWA_VERIFY_URL = process.env.ESEWA_ENV === 'production'
  ? 'https://epay.esewa.com.np/api/epay/transaction/status/'
  : 'https://rc-epay.esewa.com.np/api/epay/transaction/status/';

// Generate eSewa signature
const generateSignature = (message, secret) => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('base64');
};

// Initiate eSewa Payment
router.post('/initiate', authenticate, (req, res) => {
  try {
    const { amount, purchase_order_id, purchase_order_name } = req.body;

    // Validate required fields
    if (!amount || !purchase_order_id || !purchase_order_name) {
      return res.status(400).json({
        error: 'Missing required fields: amount, purchase_order_id, purchase_order_name'
      });
    }

    // Amount must be at least Rs. 10
    if (parseFloat(amount) < 10) {
      return res.status(400).json({
        error: 'Amount must be at least Rs. 10'
      });
    }

    const transaction_uuid = `${purchase_order_id}_${Date.now()}`;
    
    // Generate signature
    const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_MERCHANT_ID}`;
    const signature = generateSignature(message, process.env.ESEWA_SECRET_KEY);

    // Return payment form data
    res.json({
      success: true,
      payment_url: ESEWA_PAYMENT_URL,
      form_data: {
        amount: amount,
        tax_amount: 0,
        total_amount: amount,
        transaction_uuid: transaction_uuid,
        product_code: process.env.ESEWA_MERCHANT_ID,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${process.env.FRONTEND_URL}/payment/esewa/verify`,
        failure_url: `${process.env.FRONTEND_URL}/payment/esewa/verify`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: signature
      }
    });

  } catch (error) {
    console.error('eSewa initiate error:', error);
    res.status(500).json({
      error: 'Failed to initiate payment',
      details: error.message
    });
  }
});

// Verify eSewa Payment
router.get('/verify', authenticate, async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({ error: 'Payment data is required' });
    }

    // Decode base64 data
    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    
    console.log('eSewa callback data:', decodedData);

    const { transaction_uuid, total_amount, status, transaction_code } = decodedData;

    // In sandbox mode, skip signature verification (eSewa sandbox doesn't always return valid signatures)
    if (process.env.ESEWA_ENV === 'sandbox') {
      console.log('Sandbox mode - skipping signature verification');
      
      // Return verification result based on status
      res.json({
        success: status === 'COMPLETE',
        status: status,
        transaction_uuid: transaction_uuid,
        transaction_code: transaction_code,
        total_amount: total_amount,
        refId: decodedData.ref_id
      });
    } else {
      // Production mode - verify signature
      const message = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_MERCHANT_ID},signed_field_names=transaction_code,status,total_amount,transaction_uuid,product_code`;
      const expectedSignature = generateSignature(message, process.env.ESEWA_SECRET_KEY);

      if (decodedData.signature !== expectedSignature) {
        return res.status(400).json({
          success: false,
          error: 'Invalid signature'
        });
      }

      res.json({
        success: true,
        status: status,
        transaction_uuid: transaction_uuid,
        transaction_code: transaction_code,
        total_amount: total_amount,
        refId: decodedData.ref_id
      });
    }

  } catch (error) {
    console.error('eSewa verify error:', error);
    res.status(500).json({
      error: 'Failed to verify payment',
      details: error.message
    });
  }
});

module.exports = router;
