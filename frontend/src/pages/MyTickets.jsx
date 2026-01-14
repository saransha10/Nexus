import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  Chip,
  Avatar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import api from '../services/api';
import QRCodeDisplay from '../components/QRCodeDisplay';

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
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
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventPast = (ticket) => {
    return new Date(ticket.end_time) < new Date();
  };

  const getFilteredTickets = () => {
    if (activeTab === 0) return tickets;
    if (activeTab === 1) return tickets.filter(t => t.status === 'active' && !isEventPast(t));
    if (activeTab === 2) return tickets.filter(t => t.status === 'used');
    if (activeTab === 3) return tickets.filter(t => isEventPast(t) || t.status === 'cancelled');
    return tickets;
  };

  const getStats = () => {
    return {
      total: tickets.length,
      active: tickets.filter(t => t.status === 'active' && !isEventPast(t)).length,
      used: tickets.filter(t => t.status === 'used').length,
      expired: tickets.filter(t => isEventPast(t) || t.status === 'cancelled').length
    };
  };

  const handleViewQR = (ticket) => {
    setSelectedTicket(ticket);
    setQrDialogOpen(true);
  };

  const handleDownloadTicket = (ticket) => {
    // Create a simple ticket download
    const ticketData = `
EVENT TICKET
============
Event: ${ticket.title}
Order: #${ticket.ticket_id?.toString().padStart(10, '0')}
Ticket Type: ${ticket.ticket_type}
Date: ${formatDate(ticket.start_time)}
Time: ${formatTime(ticket.start_time)}
Location: ${ticket.location || 'Online Event'}
Price: NPR ${parseFloat(ticket.price || 0).toFixed(0)}
Status: ${ticket.status.toUpperCase()}

QR Code: ${ticket.qr_code}

Please present this ticket at the event entrance.
    `;

    const blob = new Blob([ticketData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket.ticket_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const stats = getStats();
  const filteredTickets = getFilteredTickets();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading tickets...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', px: 4, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Box sx={{ 
                width: 24, 
                height: 24, 
                borderRadius: '50%',
                border: '2px solid white',
                borderTopColor: 'transparent',
                transform: 'rotate(-45deg)'
              }} />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Button 
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  color: '#6b7280', 
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#f9fafb', color: '#0891b2' }
                }}
              >
                Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/events')}
                sx={{ 
                  color: '#6b7280', 
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#f9fafb', color: '#0891b2' }
                }}
              >
                Events
              </Button>
              <Button 
                sx={{ 
                  color: '#0891b2', 
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#f0fdfa' }
                }}
              >
                My Tickets
              </Button>
              {user && (user.role === 'organizer' || user.role === 'admin') && (
                <Button 
                  onClick={() => navigate('/my-events')}
                  sx={{ 
                    color: '#6b7280', 
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#f9fafb', color: '#0891b2' }
                  }}
                >
                  My Events
                </Button>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#0891b2' }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937' }}>
                {user?.name || 'User'}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4, py: 4 }}>
        {/* Page Title */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            My Tickets
          </Typography>
          <Typography sx={{ color: '#6b7280' }}>
            View and manage all your event tickets
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 3,
          mb: 4
        }}>
          <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 1 }}>
                  Total Tickets
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  {stats.total}
                </Typography>
              </Box>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: 2, 
                bgcolor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ConfirmationNumberIcon sx={{ color: '#0891b2', fontSize: 28 }} />
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 1 }}>
                  Active
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  {stats.active}
                </Typography>
              </Box>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: 2, 
                bgcolor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircleIcon sx={{ color: '#10b981', fontSize: 28 }} />
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 1 }}>
                  Used
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  {stats.used}
                </Typography>
              </Box>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: 2, 
                bgcolor: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircleIcon sx={{ color: '#6366f1', fontSize: 28 }} />
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 1 }}>
                  Past Events
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  {stats.expired}
                </Typography>
              </Box>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: 2, 
                bgcolor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CancelIcon sx={{ color: '#ef4444', fontSize: 28 }} />
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: '#e5e7eb', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                color: '#6b7280',
                '&.Mui-selected': {
                  color: '#0891b2'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#0891b2'
              }
            }}
          >
            <Tab label="All Tickets" />
            <Tab label="Active" />
            <Tab label="Used" />
            <Tab label="Past Events" />
          </Tabs>
        </Box>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <Typography sx={{ color: '#9ca3af', mb: 3 }}>
              {activeTab === 1 && 'No active tickets'}
              {activeTab === 2 && 'No used tickets'}
              {activeTab === 3 && 'No past event tickets'}
              {activeTab === 0 && 'No tickets found'}
            </Typography>
            <Button 
              variant="contained"
              onClick={() => navigate('/events')}
              sx={{ 
                bgcolor: '#0891b2',
                textTransform: 'none',
                '&:hover': { bgcolor: '#0e7490' }
              }}
            >
              Browse Events
            </Button>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {filteredTickets.map((ticket) => (
              <Card 
                key={ticket.ticket_id}
                sx={{ 
                  p: 0,
                  boxShadow: 'none',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' }
                }}
              >
                {/* Event Image */}
                <Box sx={{ 
                  width: { xs: '100%', md: 260 },
                  height: { xs: 180, md: 'auto' },
                  minHeight: { md: 200 },
                  backgroundImage: 'url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />

                {/* Ticket Details */}
                <Box sx={{ flex: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                          {ticket.title}
                        </Typography>
                        <Chip 
                          label={ticket.status}
                          size="small"
                          sx={{ 
                            bgcolor: ticket.status === 'active' ? '#d1fae5' : ticket.status === 'used' ? '#e0e7ff' : '#fee2e2',
                            color: ticket.status === 'active' ? '#10b981' : ticket.status === 'used' ? '#6366f1' : '#ef4444',
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}
                        />
                        {isEventPast(ticket) && ticket.status !== 'cancelled' && (
                          <Chip 
                            label="Past Event"
                            size="small"
                            sx={{ 
                              bgcolor: '#fef3c7',
                              color: '#f59e0b',
                              fontWeight: 600
                            }}
                          />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 2 }}>
                        Order #{ticket.ticket_id?.toString().padStart(10, '0')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ConfirmationNumberIcon sx={{ fontSize: 18, color: '#0891b2' }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>Ticket Type:</Typography>
                        <Typography sx={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: 500 }}>
                          {ticket.ticket_type}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonthIcon sx={{ fontSize: 18, color: '#0891b2' }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>Date:</Typography>
                        <Typography sx={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: 500 }}>
                          {formatDate(ticket.start_time)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 18, color: '#0891b2' }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>Time:</Typography>
                        <Typography sx={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: 500 }}>
                          {formatTime(ticket.start_time)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 18, color: '#0891b2' }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>Location:</Typography>
                        <Typography sx={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: 500 }}>
                          {ticket.location || 'Online Event'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ShoppingCartIcon sx={{ fontSize: 18, color: '#0891b2' }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>Purchased:</Typography>
                        <Typography sx={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: 500 }}>
                          {formatDate(ticket.registration_date)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: 700 }}>
                        NPR {parseFloat(ticket.price || 0).toFixed(0)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      startIcon={<QrCodeIcon />}
                      size="small"
                      onClick={() => handleViewQR(ticket)}
                      disabled={ticket.status === 'cancelled' || isEventPast(ticket)}
                      sx={{ 
                        bgcolor: '#0891b2',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#0e7490' }
                      }}
                    >
                      View QR Code
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      size="small"
                      onClick={() => handleDownloadTicket(ticket)}
                      sx={{ 
                        borderColor: '#e5e7eb',
                        color: '#6b7280',
                        textTransform: 'none',
                        '&:hover': { borderColor: '#d1d5db', bgcolor: '#f9fafb' }
                      }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<InfoIcon />}
                      size="small"
                      onClick={() => navigate(`/events/${ticket.event_id}`)}
                      sx={{ 
                        borderColor: '#e5e7eb',
                        color: '#6b7280',
                        textTransform: 'none',
                        '&:hover': { borderColor: '#d1d5db', bgcolor: '#f9fafb' }
                      }}
                    >
                      Event Details
                    </Button>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* QR Code Dialog */}
      <Dialog 
        open={qrDialogOpen} 
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
          Your Ticket QR Code
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {selectedTicket && (
            <>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                {selectedTicket.title}
              </Typography>
              <Typography sx={{ color: '#6b7280', mb: 3 }}>
                Order #{selectedTicket.ticket_id?.toString().padStart(10, '0')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <QRCodeDisplay value={selectedTicket.qr_code} size={250} />
              </Box>
              <Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Present this QR code at the event entrance
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => setQrDialogOpen(false)}
            variant="outlined"
            sx={{ 
              textTransform: 'none',
              borderColor: '#e5e7eb',
              color: '#6b7280',
              '&:hover': { borderColor: '#d1d5db', bgcolor: '#f9fafb' }
            }}
          >
            Close
          </Button>
          <Button 
            onClick={() => handleDownloadTicket(selectedTicket)}
            variant="contained"
            sx={{ 
              textTransform: 'none',
              bgcolor: '#0891b2',
              '&:hover': { bgcolor: '#0e7490' }
            }}
          >
            Download Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyTickets;
