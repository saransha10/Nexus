import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  const fetchOrganizerEvents = async () => {
    try {
      const response = await api.get('/events/organizer/my-events');
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async (eventId) => {
    try {
      const response = await api.get(`/tickets/event/${eventId}/attendees`);
      setAttendees(response.data);
      setSelectedEvent(eventId);
    } catch (error) {
      console.error('Failed to fetch attendees:', error);
      alert('Failed to fetch attendees');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStats = (event) => {
    const totalRevenue = attendees
      .filter(a => a.event_id === event.event_id)
      .reduce((sum, a) => sum + parseFloat(a.price || 0), 0);
    
    return {
      totalAttendees: attendees.filter(a => a.event_id === event.event_id).length,
      totalRevenue: totalRevenue.toFixed(2)
    };
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="organizer-dashboard">
      <div className="dashboard-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Organizer Dashboard</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/qr-scanner')} className="btn-scanner">
            📱 QR Scanner
          </button>
          <button onClick={() => navigate('/create-event')} className="btn-primary">
            + Create New Event
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <p>You haven't created any events yet.</p>
          <button onClick={() => navigate('/create-event')} className="btn-primary">
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="dashboard-content">
          <div className="events-section">
            <h2>Your Events</h2>
            <div className="events-list">
              {events.map((event) => (
                <div 
                  key={event.event_id} 
                  className={`event-item ${selectedEvent === event.event_id ? 'active' : ''}`}
                  onClick={() => fetchAttendees(event.event_id)}
                >
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p className="event-date">📅 {formatDate(event.start_time)}</p>
                    <span className={`badge badge-${event.type}`}>{event.type}</span>
                  </div>
                  <div className="event-actions">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event.event_id}`);
                      }}
                      className="btn-view"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedEvent && (
            <div className="attendees-section">
              <h2>Attendees</h2>
              
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-value">{attendees.length}</div>
                  <div className="stat-label">Total Registrations</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    ${attendees.reduce((sum, a) => sum + parseFloat(a.price || 0), 0).toFixed(2)}
                  </div>
                  <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {attendees.filter(a => a.status === 'active').length}
                  </div>
                  <div className="stat-label">Active Tickets</div>
                </div>
              </div>

              {attendees.length === 0 ? (
                <p className="no-attendees">No registrations yet for this event.</p>
              ) : (
                <div className="attendees-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Ticket Type</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>QR Code</th>
                        <th>Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendees.map((attendee) => (
                        <tr key={attendee.ticket_id}>
                          <td>{attendee.name}</td>
                          <td>{attendee.email}</td>
                          <td>
                            <span className="ticket-type-badge">{attendee.ticket_type}</span>
                          </td>
                          <td>${attendee.price}</td>
                          <td>
                            <span className={`status-badge ${attendee.status}`}>
                              {attendee.status}
                            </span>
                          </td>
                          <td className="qr-code">{attendee.qr_code}</td>
                          <td>{formatDate(attendee.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        .organizer-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-scanner {
          background: #4caf50;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn-scanner:hover {
          background: #45a049;
        }

        .back-btn {
          background: none;
          border: none;
          color: #1976d2;
          cursor: pointer;
          font-size: 1rem;
        }

        .organizer-dashboard h1 {
          margin: 0;
          color: #333;
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

        .no-events {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .no-events p {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 2rem;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 2rem;
        }

        .events-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          height: fit-content;
        }

        .events-section h2 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .event-item {
          padding: 1rem;
          border: 2px solid #eee;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .event-item:hover {
          border-color: #1976d2;
          background: #f5f5f5;
        }

        .event-item.active {
          border-color: #1976d2;
          background: #e3f2fd;
        }

        .event-info h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1rem;
        }

        .event-date {
          margin: 0.5rem 0;
          color: #666;
          font-size: 0.9rem;
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

        .event-actions {
          margin-top: 0.5rem;
        }

        .btn-view {
          background: white;
          color: #1976d2;
          border: 1px solid #1976d2;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-view:hover {
          background: #f5f5f5;
        }

        .attendees-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .attendees-section h2 {
          margin: 0 0 1.5rem 0;
          color: #333;
        }

        .stats-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #1976d2;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }

        .no-attendees {
          text-align: center;
          color: #999;
          padding: 2rem;
        }

        .attendees-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: #f5f5f5;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #ddd;
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid #eee;
          color: #666;
        }

        tr:hover {
          background: #f9f9f9;
        }

        .ticket-type-badge {
          background: #fff3e0;
          color: #f57c00;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
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

        .qr-code {
          font-family: monospace;
          font-size: 0.85rem;
          color: #1976d2;
        }

        .loading {
          text-align: center;
          padding: 3rem;
        }

        @media (max-width: 1024px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default OrganizerDashboard;
