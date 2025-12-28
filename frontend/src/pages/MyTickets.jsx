import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import QRCodeDisplay from '../components/QRCodeDisplay';

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets/my-tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId) => {
    if (!confirm('Are you sure you want to cancel this ticket?')) return;

    try {
      await api.delete(`/tickets/${ticketId}`);
      alert('Ticket cancelled successfully');
      fetchTickets();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel ticket');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading tickets...</div>;

  return (
    <div className="my-tickets-page">
      <div className="tickets-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>My Tickets</h1>
      </div>

      {tickets.length === 0 ? (
        <div className="no-tickets">
          <p>You haven't registered for any events yet.</p>
          <button onClick={() => navigate('/events')} className="btn-primary">
            Browse Events
          </button>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map((ticket) => (
            <div key={ticket.ticket_id} className={`ticket-card status-${ticket.status}`}>
              <div className="ticket-header">
                <span className={`status-badge ${ticket.status}`}>
                  {ticket.status}
                </span>
                <div className="badges-right">
                  <span className={`type-badge ${ticket.type}`}>
                    {ticket.type}
                  </span>
                  <span className="ticket-type-badge">
                    {ticket.ticket_type}
                  </span>
                </div>
              </div>

              <h3>{ticket.title}</h3>
              <p className="ticket-description">{ticket.description?.substring(0, 100)}...</p>

              <div className="ticket-details">
                <div className="detail-row">
                  <span className="label">📅 Date:</span>
                  <span>{formatDate(ticket.start_time)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">👤 Organizer:</span>
                  <span>{ticket.organizer_name}</span>
                </div>
                {ticket.location && (
                  <div className="detail-row">
                    <span className="label">📍 Location:</span>
                    <span>{ticket.location}</span>
                  </div>
                )}
                {ticket.streaming_url && (
                  <div className="detail-row">
                    <span className="label">🌐 Online:</span>
                    <a href={ticket.streaming_url} target="_blank" rel="noopener noreferrer">
                      Join Event
                    </a>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">💰 Price:</span>
                  <span className="price">${ticket.price || '0.00'}</span>
                </div>
              </div>

              <div className="qr-code-section">
                <h4>Your Ticket QR Code</h4>
                <QRCodeDisplay value={ticket.qr_code} size={180} />
              </div>

              <div className="ticket-actions">
                <button 
                  onClick={() => navigate(`/events/${ticket.event_id}`)} 
                  className="btn-view"
                >
                  View Event
                </button>
                {ticket.status === 'active' && (
                  <button 
                    onClick={() => handleCancelTicket(ticket.ticket_id)} 
                    className="btn-cancel"
                  >
                    Cancel Ticket
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .my-tickets-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .tickets-header {
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

        .my-tickets-page h1 {
          margin: 0;
          color: #333;
        }

        .no-tickets {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .no-tickets p {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 2rem;
        }

        .tickets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .ticket-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-left: 4px solid #1976d2;
        }

        .ticket-card.status-cancelled {
          opacity: 0.6;
          border-left-color: #999;
        }

        .ticket-card.status-used {
          border-left-color: #4caf50;
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .badges-right {
          display: flex;
          gap: 0.5rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.active {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-badge.cancelled {
          background: #ffebee;
          color: #c62828;
        }

        .status-badge.used {
          background: #e3f2fd;
          color: #1976d2;
        }

        .ticket-type-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          background: #fff3e0;
          color: #f57c00;
        }

        .type-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .type-badge.online {
          background: #e3f2fd;
          color: #1976d2;
        }

        .type-badge.offline {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .type-badge.hybrid {
          background: #e8f5e9;
          color: #388e3c;
        }

        .ticket-card h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .ticket-description {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .ticket-details {
          background: #f9f9f9;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .label {
          font-weight: 500;
          color: #666;
        }

        .qr-code {
          font-family: monospace;
          font-size: 0.85rem;
          color: #1976d2;
        }

        .price {
          font-weight: 600;
          color: #4caf50;
        }

        .qr-code-section {
          background: #f9f9f9;
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .qr-code-section h4 {
          margin: 0 0 0.5rem 0;
          color: #333;
          text-align: center;
        }

        .ticket-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-view {
          flex: 1;
          background: #1976d2;
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-view:hover {
          background: #1565c0;
        }

        .btn-cancel {
          flex: 1;
          background: white;
          color: #d32f2f;
          border: 2px solid #d32f2f;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-cancel:hover {
          background: #ffebee;
        }

        .btn-primary {
          background: #1976d2;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn-primary:hover {
          background: #1565c0;
        }

        .loading {
          text-align: center;
          padding: 3rem;
        }
      `}</style>
    </div>
  );
}

export default MyTickets;
