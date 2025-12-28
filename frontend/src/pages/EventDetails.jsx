import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PaymentGatewaySelector from '../components/PaymentGatewaySelector';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentProductName, setPaymentProductName] = useState('');

  useEffect(() => {
    fetchEvent();
    fetchTicketTypes();
    checkRegistration();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
      
      // Check if current user is the organizer
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsOrganizer(response.data.organizer_id === user.user_id);
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketTypes = async () => {
    try {
      const response = await api.get(`/ticket-types/event/${id}`);
      setTicketTypes(response.data);
      if (response.data.length > 0) {
        setSelectedTicketType(response.data[0].ticket_type_id);
      }
    } catch (error) {
      console.error('Failed to fetch ticket types:', error);
    }
  };

  const checkRegistration = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.get(`/tickets/check/${id}`);
      setIsRegistered(response.data.isRegistered);
    } catch (error) {
      console.error('Failed to check registration:', error);
    }
  };

  const handleRegister = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to register for this event');
      navigate('/login');
      return;
    }

    if (!selectedTicketType) {
      alert('Please select a ticket type');
      return;
    }

    // Get selected ticket type details
    const selectedType = ticketTypes.find(t => t.ticket_type_id === selectedTicketType);
    
    if (!selectedType) {
      alert('Invalid ticket type selected');
      return;
    }

    console.log('Selected ticket type:', selectedType);
    console.log('Price:', selectedType.price);

    // Store selected ticket type for payment verification
    localStorage.setItem('selected_ticket_type', selectedTicketType);

    // If ticket is free, register directly
    if (parseFloat(selectedType.price) === 0) {
      await registerTicket(null);
    } else {
      // Show payment gateway selector
      setPaymentAmount(parseFloat(selectedType.price));
      setPaymentProductName(`${event.title} - Ticket`);
      setShowPaymentSelector(true);
    }
  };

  const registerTicket = async (paymentData) => {
    setRegistering(true);
    try {
      const payload = {
        ticket_type_id: selectedTicketType,
        payment_data: paymentData
      };

      await api.post(`/tickets/register/${id}`, payload);
      alert('Successfully registered for event! You can buy more tickets if needed.');
      checkRegistration();
      fetchTicketTypes();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to register for event');
    } finally {
      setRegistering(false);
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

  if (loading) return <div className="loading">Loading...</div>;
  if (!event) return <div className="error">Event not found</div>;

  return (
    <div className="event-details-page">
      <button onClick={() => navigate('/events')} className="back-btn">
        ← Back to Events
      </button>

      <div className="event-details-container">
        <div className="event-header">
          <div className="event-badges">
            <span className={`badge badge-${event.type}`}>{event.type}</span>
          </div>
          <h1>{event.title}</h1>
        </div>

        <div className="event-info-grid">
          <div className="info-card">
            <h3>📅 Date & Time</h3>
            <p><strong>Start:</strong> {formatDate(event.start_time)}</p>
            <p><strong>End:</strong> {formatDate(event.end_time)}</p>
          </div>

          <div className="info-card">
            <h3>📍 Location</h3>
            {event.type === 'online' || event.type === 'hybrid' ? (
              <p><strong>Online Link:</strong> {event.streaming_url || 'Will be shared'}</p>
            ) : null}
            {event.type === 'offline' || event.type === 'hybrid' ? (
              <p><strong>Venue:</strong> {event.location || 'TBA'}</p>
            ) : null}
          </div>

          <div className="info-card">
            <h3>👤 Organizer</h3>
            <p><strong>Name:</strong> {event.organizer_name}</p>
            <p><strong>Email:</strong> {event.organizer_email}</p>
          </div>
        </div>

        <div className="event-description">
          <h2>About This Event</h2>
          <p>{event.description}</p>
        </div>

        {ticketTypes.length > 0 && !isOrganizer && (
          <div className="ticket-types-section">
            <h2>Select Ticket Type</h2>
            <div className="ticket-types-grid">
              {ticketTypes.map((type) => (
                <div 
                  key={type.ticket_type_id}
                  className={`ticket-type-option ${selectedTicketType === type.ticket_type_id ? 'selected' : ''}`}
                  onClick={() => setSelectedTicketType(type.ticket_type_id)}
                >
                  <div className="ticket-type-header">
                    <h3>{type.type_name}</h3>
                    <span className="ticket-price">${type.price}</span>
                  </div>
                  {type.description && (
                    <p className="ticket-description">{type.description}</p>
                  )}
                  {type.quantity_available && (
                    <p className="ticket-availability">
                      Limited: {type.quantity_available} available
                    </p>
                  )}
                  {selectedTicketType === type.ticket_type_id && (
                    <div className="selected-indicator">✓ Selected</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isOrganizer && (
          <div className="organizer-notice">
            <p>📋 You are the organizer of this event</p>
            <button 
              onClick={() => navigate('/organizer-dashboard')} 
              className="btn-manage"
            >
              Manage Event & View Attendees
            </button>
          </div>
        )}

        <div className="event-actions">
          {!isOrganizer && (
            <>
              <button 
                className="btn-register" 
                onClick={handleRegister}
                disabled={registering || ticketTypes.length === 0}
              >
                {registering ? 'Processing...' : isRegistered ? 'Buy Another Ticket' : 'Register Now'}
              </button>
              <button className="btn-share">Share Event</button>
            </>
          )}
        </div>
      </div>

      {showPaymentSelector && (
        <PaymentGatewaySelector
          amount={paymentAmount}
          productName={paymentProductName}
          productId={id}
          onClose={() => setShowPaymentSelector(false)}
        />
      )}

      <style>{`
        .event-details-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .back-btn {
          background: none;
          border: none;
          color: #1976d2;
          cursor: pointer;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .event-details-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .event-hero-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
        }

        .event-header {
          padding: 2rem;
          border-bottom: 1px solid #eee;
        }

        .event-badges {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .badge-online { background: #e3f2fd; color: #1976d2; }
        .badge-offline { background: #f3e5f5; color: #7b1fa2; }
        .badge-hybrid { background: #e8f5e9; color: #388e3c; }

        .event-header h1 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .event-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          padding: 2rem;
          background: #f9f9f9;
        }

        .info-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
        }

        .info-card h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1rem;
        }

        .info-card p {
          margin: 0.5rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .event-description {
          padding: 2rem;
        }

        .event-description h2 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .event-description p {
          color: #666;
          line-height: 1.6;
        }

        .ticket-types-section {
          padding: 2rem;
          background: #f9f9f9;
        }

        .ticket-types-section h2 {
          margin: 0 0 1.5rem 0;
          color: #333;
        }

        .ticket-types-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .ticket-type-option {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          border: 2px solid #ddd;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .ticket-type-option:hover {
          border-color: #1976d2;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .ticket-type-option.selected {
          border-color: #1976d2;
          background: #e3f2fd;
        }

        .ticket-type-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .ticket-type-option h3 {
          margin: 0;
          color: #333;
          font-size: 1.1rem;
        }

        .ticket-price {
          font-size: 1.3rem;
          font-weight: bold;
          color: #4caf50;
        }

        .ticket-description {
          color: #666;
          font-size: 0.9rem;
          margin: 0.5rem 0;
        }

        .ticket-availability {
          color: #f57c00;
          font-size: 0.85rem;
          font-weight: 500;
          margin: 0.5rem 0 0 0;
        }

        .selected-indicator {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #4caf50;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .organizer-notice {
          padding: 2rem;
          background: #e3f2fd;
          border-radius: 8px;
          text-align: center;
          border: 2px solid #1976d2;
        }

        .organizer-notice p {
          margin: 0 0 1rem 0;
          color: #1976d2;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .btn-manage {
          background: #1976d2;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
        }

        .btn-manage:hover {
          background: #1565c0;
        }

        .event-actions {
          padding: 2rem;
          display: flex;
          gap: 1rem;
          border-top: 1px solid #eee;
        }

        .btn-register {
          flex: 1;
          background: #1976d2;
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
        }

        .btn-register:hover {
          background: #1565c0;
        }

        .btn-registered {
          flex: 1;
          background: #4caf50;
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 8px;
          cursor: not-allowed;
          font-size: 1rem;
          font-weight: 500;
        }

        .btn-share {
          background: white;
          color: #1976d2;
          border: 2px solid #1976d2;
          padding: 1rem 2rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn-share:hover {
          background: #f5f5f5;
        }

        .loading, .error {
          text-align: center;
          padding: 3rem;
        }
      `}</style>
    </div>
  );
}

export default EventDetails;
