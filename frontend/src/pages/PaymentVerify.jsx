import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [message, setMessage] = useState('Verifying your payment...');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get pidx from URL parameters
      const pidx = searchParams.get('pidx');
      const urlStatus = searchParams.get('status');
      const transaction_id = searchParams.get('transaction_id');
      const purchase_order_id = searchParams.get('purchase_order_id');

      console.log('Payment callback params:', { pidx, urlStatus, transaction_id, purchase_order_id });

      if (!pidx) {
        setStatus('failed');
        setMessage('Invalid payment reference');
        return;
      }

      // Check if payment was canceled
      if (urlStatus === 'User canceled') {
        setStatus('failed');
        setMessage('Payment was canceled');
        setTimeout(() => navigate('/events'), 3000);
        return;
      }

      console.log('Verifying payment with pidx:', pidx);

      // Verify payment with backend
      const response = await api.post('/khalti/verify', { pidx });

      console.log('Verification response:', response.data);

      if (response.data.status === 'Completed') {
        // Payment successful - now create the ticket
        const productId = localStorage.getItem('khalti_product_id');
        
        console.log('Creating ticket for product:', productId);

        if (productId) {
          // Register for event with payment data
          await api.post(`/tickets/register/${productId}`, {
            ticket_type_id: localStorage.getItem('selected_ticket_type'),
            payment_data: {
              pidx: pidx,
              transaction_id: response.data.transaction_id,
              amount: response.data.total_amount,
              status: response.data.status
            }
          });

          setStatus('success');
          setMessage('Payment successful! Your ticket has been created.');
          setDetails(response.data);

          // Clear stored data
          localStorage.removeItem('khalti_pidx');
          localStorage.removeItem('khalti_purchase_order_id');
          localStorage.removeItem('khalti_product_id');
          localStorage.removeItem('selected_ticket_type');

          // Redirect to My Tickets after 3 seconds
          setTimeout(() => navigate('/my-tickets'), 3000);
        } else {
          setStatus('failed');
          setMessage('Payment verified but ticket creation failed - missing product ID');
        }
      } else if (response.data.status === 'Pending') {
        setStatus('failed');
        setMessage('Payment is pending. Please contact support.');
      } else {
        setStatus('failed');
        setMessage(`Payment ${response.data.status.toLowerCase()}`);
      }

    } catch (error) {
      console.error('Payment verification error:', error);
      console.error('Error details:', error.response?.data);
      setStatus('failed');
      setMessage(error.response?.data?.error || error.response?.data?.details || 'Failed to verify payment. Please contact support.');
    }
  };

  return (
    <div className="payment-verify-page">
      <div className="verify-container">
        {status === 'verifying' && (
          <div className="verify-status verifying">
            <div className="spinner"></div>
            <h2>Verifying Payment</h2>
            <p>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="verify-status success">
            <div className="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p>{message}</p>
            {details && (
              <div className="payment-details">
                <p><strong>Transaction ID:</strong> {details.transaction_id}</p>
                <p><strong>Amount:</strong> Rs. {details.total_amount / 100}</p>
              </div>
            )}
            <p className="redirect-message">Redirecting to My Tickets...</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="verify-status failed">
            <div className="error-icon">✕</div>
            <h2>Payment Failed</h2>
            <p>{message}</p>
            <button onClick={() => navigate('/events')} className="btn-back">
              Back to Events
            </button>
          </div>
        )}
      </div>

      <style>{`
        .payment-verify-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .verify-container {
          background: white;
          border-radius: 16px;
          padding: 3rem;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .verify-status {
          text-align: center;
        }

        .spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1.5rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: #4caf50;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          margin: 0 auto 1.5rem;
          animation: scaleIn 0.5s ease-out;
        }

        .error-icon {
          width: 80px;
          height: 80px;
          background: #f44336;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          margin: 0 auto 1.5rem;
          animation: scaleIn 0.5s ease-out;
        }

        @keyframes scaleIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .verify-status h2 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.8rem;
        }

        .verify-status p {
          color: #666;
          margin: 0.5rem 0;
          font-size: 1.1rem;
        }

        .payment-details {
          background: #f5f5f5;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 1.5rem 0;
          text-align: left;
        }

        .payment-details p {
          margin: 0.5rem 0;
          color: #333;
          font-size: 0.95rem;
        }

        .redirect-message {
          color: #667eea;
          font-weight: 500;
          margin-top: 1.5rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .btn-back {
          margin-top: 1.5rem;
          padding: 0.75rem 2rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s;
        }

        .btn-back:hover {
          background: #5568d3;
        }
      `}</style>
    </div>
  );
}

export default PaymentVerify;
