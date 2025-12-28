import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'online',
    start_time: '',
    end_time: '',
    location: '',
    streaming_url: '',
    max_attendees: ''
  });
  const [ticketTypes, setTicketTypes] = useState([
    { type_name: 'Regular', price: '0', quantity_available: '', description: '' }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check user role on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'organizer' && user.role !== 'admin') {
      alert('Access denied. Only organizers and admins can create events.');
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Create event first
      const eventResponse = await api.post('/events', formData);
      const eventId = eventResponse.data.event.event_id;

      // Then create ticket types
      await api.post(`/ticket-types/event/${eventId}`, { ticketTypes });

      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { type_name: '', price: '0', quantity_available: '', description: '' }]);
  };

  const removeTicketType = (index) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index));
    }
  };

  const handleTicketTypeChange = (index, field, value) => {
    const updated = [...ticketTypes];
    updated[index][field] = value;
    setTicketTypes(updated);
  };

  return (
    <div className="create-event-page">
      <div className="create-event-container">
        <button onClick={() => navigate('/events')} className="back-btn">
          ← Back
        </button>

        <h1>Create New Event</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter event title"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Describe your event"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Event Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date & Time *</label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date & Time *</label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {(formData.type === 'offline' || formData.type === 'hybrid') && (
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter venue address"
              />
            </div>
          )}

          {(formData.type === 'online' || formData.type === 'hybrid') && (
            <div className="form-group">
              <label>Streaming URL</label>
              <input
                type="url"
                name="streaming_url"
                value={formData.streaming_url}
                onChange={handleChange}
                placeholder="https://zoom.us/..."
              />
            </div>
          )}

          <div className="form-group">
            <label>Max Attendees</label>
            <input
              type="number"
              name="max_attendees"
              value={formData.max_attendees}
              onChange={handleChange}
              min="1"
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div className="ticket-types-section">
            <h3>Ticket Types & Pricing</h3>
            <p className="section-description">Define different ticket types with their own prices</p>
            
            {ticketTypes.map((ticketType, index) => (
              <div key={index} className="ticket-type-card">
                <div className="ticket-type-header">
                  <h4>Ticket Type {index + 1}</h4>
                  {ticketTypes.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeTicketType(index)}
                      className="btn-remove"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type Name *</label>
                    <input
                      type="text"
                      value={ticketType.type_name}
                      onChange={(e) => handleTicketTypeChange(index, 'type_name', e.target.value)}
                      required
                      placeholder="e.g., VIP, Regular, Student"
                    />
                  </div>

                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input
                      type="number"
                      value={ticketType.price}
                      onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity Available</label>
                    <input
                      type="number"
                      value={ticketType.quantity_available}
                      onChange={(e) => handleTicketTypeChange(index, 'quantity_available', e.target.value)}
                      min="1"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={ticketType.description}
                    onChange={(e) => handleTicketTypeChange(index, 'description', e.target.value)}
                    rows="2"
                    placeholder="Describe what's included with this ticket type"
                  />
                </div>
              </div>
            ))}

            <button type="button" onClick={addTicketType} className="btn-add-ticket">
              + Add Another Ticket Type
            </button>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>

      <style>{`
        .create-event-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .create-event-container {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .back-btn {
          background: none;
          border: none;
          color: #1976d2;
          cursor: pointer;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .create-event-page h1 {
          margin: 0 0 2rem 0;
          color: #333;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }

        .form-group input, 
        .form-group select, 
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
        }

        .form-group input:focus, 
        .form-group select:focus, 
        .form-group textarea:focus {
          outline: none;
          border-color: #1976d2;
        }

        .btn-submit {
          width: 100%;
          background: #1976d2;
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
        }

        .btn-submit:hover:not(:disabled) {
          background: #1565c0;
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ticket-types-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #eee;
        }

        .ticket-types-section h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .section-description {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .ticket-type-card {
          background: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border-left: 4px solid #1976d2;
        }

        .ticket-type-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .ticket-type-header h4 {
          margin: 0;
          color: #333;
        }

        .btn-remove {
          background: #f44336;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-remove:hover {
          background: #d32f2f;
        }

        .btn-add-ticket {
          width: 100%;
          background: white;
          color: #1976d2;
          border: 2px dashed #1976d2;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          margin-bottom: 1.5rem;
        }

        .btn-add-ticket:hover {
          background: #f5f5f5;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default CreateEvent;
