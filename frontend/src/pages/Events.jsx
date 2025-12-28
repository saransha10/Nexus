import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', search: '' });
  const [user, setUser] = useState(null);
  const [eventTicketTypes, setEventTicketTypes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.search) params.append('search', filter.search);

      const response = await api.get(`/events?${params}`);
      setEvents(response.data);
      
      // Fetch ticket types for each event
      response.data.forEach(event => fetchEventTicketTypes(event.event_id));
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTicketTypes = async (eventId) => {
    try {
      const response = await api.get(`/ticket-types/event/${eventId}`);
      setEventTicketTypes(prev => ({
        ...prev,
        [eventId]: response.data
      }));
    } catch (error) {
      console.error('Failed to fetch ticket types:', error);
    }
  };

  const getPriceDisplay = (eventId) => {
    const types = eventTicketTypes[eventId];
    if (!types || types.length === 0) return 'Free';
    
    const prices = types.map(t => parseFloat(t.price)).sort((a, b) => a - b);
    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];
    
    if (minPrice === 0 && maxPrice === 0) return 'Free';
    if (minPrice === maxPrice) return `$${minPrice.toFixed(2)}`;
    return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
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

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="events-page">
      <div className="events-header">
        <div className="header-left">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            ← Dashboard
          </button>
          <h1>Discover Events</h1>
        </div>
        {user && (user.role === 'organizer' || user.role === 'admin') && (
          <button onClick={() => navigate('/create-event')} className="btn-primary">
            Create Event
          </button>
        )}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search events..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="search-input"
        />
        
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="filter-select"
        >
          <option value="">All Types</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      <div className="events-grid">
        {events.length === 0 ? (
          <p className="no-events">No events found</p>
        ) : (
          events.map((event) => (
            <div key={event.event_id} className="event-card" onClick={() => navigate(`/events/${event.event_id}`)}>
              <div className="event-content">
                <div className="event-badges">
                  <span className={`badge badge-${event.type}`}>{event.type}</span>
                </div>
                <h3>{event.title}</h3>
                <p className="event-description">{event.description?.substring(0, 100)}...</p>
                <div className="event-details">
                  <p>📅 {formatDate(event.start_time)}</p>
                  <p>👤 {event.organizer_name}</p>
                  {event.location && <p>📍 {event.location}</p>}
                  {event.streaming_url && <p>🌐 Online Event</p>}
                  <p className="event-price">
                    {getPriceDisplay(event.event_id)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .events-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .events-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-btn {
          background: none;
          border: none;
          color: #1976d2;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .back-btn:hover {
          background: #f5f5f5;
        }

        .events-header h1 {
          margin: 0;
        }

        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-input, .filter-select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .search-input {
          flex: 1;
          min-width: 250px;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }

        .event-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: transform 0.2s;
        }

        .event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .event-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .event-content {
          padding: 1.5rem;
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

        .event-card h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .event-description {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .event-details {
          font-size: 0.9rem;
          color: #666;
        }

        .event-details p {
          margin: 0.25rem 0;
        }

        .event-price {
          font-weight: bold;
          color: #4caf50;
          font-size: 1.1rem !important;
          margin-top: 0.5rem !important;
        }

        .no-events {
          text-align: center;
          color: #999;
          padding: 3rem;
        }

        .loading {
          text-align: center;
          padding: 3rem;
        }

        .btn-primary {
          background: #1976d2;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn-primary:hover {
          background: #1565c0;
        }
      `}</style>
    </div>
  );
}

export default Events;
