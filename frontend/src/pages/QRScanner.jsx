import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function QRScanner() {
  const [qrCode, setQrCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleScan = async (e) => {
    e.preventDefault();
    if (!qrCode.trim()) {
      setError('Please enter a QR code');
      return;
    }

    setScanning(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/tickets/validate-qr', { qr_code: qrCode });
      setResult({
        valid: true,
        ...response.data
      });
      setQrCode(''); // Clear input for next scan
    } catch (err) {
      setResult({
        valid: false,
        error: err.response?.data?.error || 'Failed to validate QR code',
        ticket: err.response?.data?.ticket
      });
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setQrCode('');
    setResult(null);
    setError('');
  };

  return (
    <div className="qr-scanner-page">
      <div className="scanner-container">
        <div className="scanner-header">
          <button onClick={() => navigate('/organizer-dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>QR Code Scanner</h1>
        </div>

        <div className="scanner-card">
          <div className="scanner-icon">📱</div>
          <h2>Scan Ticket QR Code</h2>
          <p className="scanner-description">
            Enter the QR code from attendee's ticket to validate entry
          </p>

          <form onSubmit={handleScan}>
            <div className="input-group">
              <input
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="QR-1234567890-ABCDEF..."
                className="qr-input"
                autoFocus
              />
              <button 
                type="submit" 
                className="btn-scan"
                disabled={scanning || !qrCode.trim()}
              >
                {scanning ? 'Validating...' : '🔍 Validate'}
              </button>
            </div>
          </form>

          {error && (
            <div className="alert alert-error">
              ❌ {error}
            </div>
          )}

          {result && (
            <div className={`result-card ${result.valid ? 'valid' : 'invalid'}`}>
              {result.valid ? (
                <>
                  <div className="result-icon">✅</div>
                  <h3>Entry Granted</h3>
                  <div className="result-details">
                    <div className="detail-row">
                      <span className="label">Attendee:</span>
                      <span className="value">{result.ticket.attendee_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span className="value">{result.ticket.attendee_email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Event:</span>
                      <span className="value">{result.ticket.event_title}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Ticket Type:</span>
                      <span className="value ticket-type">{result.ticket.ticket_type}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Price:</span>
                      <span className="value">${result.ticket.price}</span>
                    </div>
                  </div>
                  <button onClick={handleReset} className="btn-next">
                    ✓ Next Attendee
                  </button>
                </>
              ) : (
                <>
                  <div className="result-icon">❌</div>
                  <h3>Entry Denied</h3>
                  <p className="error-message">{result.error}</p>
                  {result.ticket && (
                    <div className="result-details">
                      <div className="detail-row">
                        <span className="label">Ticket ID:</span>
                        <span className="value">{result.ticket.ticket_id}</span>
                      </div>
                      {result.ticket.attendee_name && (
                        <div className="detail-row">
                          <span className="label">Attendee:</span>
                          <span className="value">{result.ticket.attendee_name}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="label">Status:</span>
                        <span className="value status-badge">{result.ticket.status}</span>
                      </div>
                    </div>
                  )}
                  <button onClick={handleReset} className="btn-retry">
                    Try Again
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="scanner-tips">
          <h3>💡 Tips</h3>
          <ul>
            <li>Ask attendees to show their ticket QR code</li>
            <li>Copy and paste the code from the ticket</li>
            <li>Each QR code can only be used once</li>
            <li>Cancelled tickets will be rejected</li>
          </ul>
        </div>
      </div>

      <style>{`
        .qr-scanner-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          min-height: 100vh;
          background: #f5f5f5;
        }

        .scanner-container {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .scanner-header {
          margin-bottom: 2rem;
        }

        .back-btn {
          background: none;
          border: none;
          color: #1976d2;
          cursor: pointer;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .qr-scanner-page h1 {
          margin: 0;
          color: #333;
        }

        .scanner-card {
          background: #f9f9f9;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
        }

        .scanner-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .scanner-card h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .scanner-description {
          color: #666;
          margin-bottom: 2rem;
        }

        .input-group {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .qr-input {
          flex: 1;
          padding: 1rem;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          font-family: monospace;
        }

        .qr-input:focus {
          outline: none;
          border-color: #1976d2;
        }

        .btn-scan {
          background: #1976d2;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .btn-scan:hover:not(:disabled) {
          background: #1565c0;
        }

        .btn-scan:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .alert-error {
          background: #ffebee;
          color: #c62828;
        }

        .result-card {
          margin-top: 2rem;
          padding: 2rem;
          border-radius: 12px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .result-card.valid {
          background: #e8f5e9;
          border: 2px solid #4caf50;
        }

        .result-card.invalid {
          background: #ffebee;
          border: 2px solid #f44336;
        }

        .result-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .result-card h3 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .error-message {
          color: #c62828;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .result-details {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 1rem 0;
          text-align: left;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: 500;
          color: #666;
        }

        .value {
          color: #333;
        }

        .ticket-type {
          background: #fff3e0;
          color: #f57c00;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .status-badge {
          background: #f5f5f5;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .btn-next, .btn-retry {
          margin-top: 1rem;
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
        }

        .btn-next {
          background: #4caf50;
          color: white;
        }

        .btn-next:hover {
          background: #45a049;
        }

        .btn-retry {
          background: #f44336;
          color: white;
        }

        .btn-retry:hover {
          background: #d32f2f;
        }

        .scanner-tips {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #e3f2fd;
          border-radius: 8px;
        }

        .scanner-tips h3 {
          margin: 0 0 1rem 0;
          color: #1976d2;
        }

        .scanner-tips ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #666;
        }

        .scanner-tips li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}

export default QRScanner;
