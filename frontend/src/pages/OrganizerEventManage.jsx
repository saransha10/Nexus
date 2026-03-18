import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Avatar,
  IconButton,
  Switch,
  LinearProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ShareIcon from '@mui/icons-material/Share';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import api from '../services/api';

function OrganizerEventManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTicketType, setFilterTicketType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    try {
      const [eventRes, attendeesRes, ticketTypesRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/tickets/event/${id}/attendees`),
        api.get(`/ticket-types/event/${id}`)
      ]);
      
      setEvent(eventRes.data);
      setAttendees(attendeesRes.data);
      setTicketTypes(ticketTypesRes.data);
    } catch (error) {
      console.error('Failed to fetch event data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalRevenue = () => {
    return attendees.reduce((sum, a) => sum + parseFloat(a.price || 0), 0);
  };

  const getActiveTickets = () => {
    return attendees.filter(a => a.status === 'active').length;
  };

  const getCheckedIn = () => {
    return attendees.filter(a => a.status === 'used').length;
  };

  const isEventPast = () => {
    if (!event) return false;
    return new Date(event.end_time) < new Date();
  };

  const isEventLive = () => {
    if (!event) return false;
    const now = new Date();
    return new Date(event.start_time) <= now && new Date(event.end_time) >= now;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredAttendees = () => {
    let filtered = attendees;

    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterTicketType !== 'all') {
      filtered = filtered.filter(a => a.ticket_type === filterTicketType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    return filtered;
  };

  const handleExportCSV = () => {
    const csv = [
      ['Name', 'Email', 'Ticket Type', 'Price', 'Status', 'QR Code', 'Registration Date'],
      ...attendees.map(a => [
        a.name,
        a.email,
        a.ticket_type,
        a.price,
        a.status,
        a.qr_code,
        new Date(a.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.title}-attendees.csv`;
    a.click();
  };

  const handleDeleteEvent = async () => {
    if (!confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/events/${id}`);
      alert('Event deleted successfully');
      navigate('/my-events');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete event');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Event not found</Typography>
      </Box>
    );
  }

  const filteredAttendees = getFilteredAttendees();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', px: 4, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/my-events')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {event.title}
            </Typography>
            <Chip 
              label={isEventPast() ? 'Past Event' : isEventLive() ? 'Live Now' : 'Published'}
              size="small"
              sx={{ 
                bgcolor: isEventPast() ? '#fee2e2' : isEventLive() ? '#fef3c7' : '#d1fae5',
                color: isEventPast() ? '#ef4444' : isEventLive() ? '#f59e0b' : '#10b981',
                fontWeight: 600 
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<BarChartIcon />}
              onClick={() => navigate(`/events/${id}/analytics`)}
              sx={{ 
                textTransform: 'none',
                bgcolor: '#10b981',
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              View Analytics
            </Button>
            {!isEventPast() && (
              <Button
                variant="contained"
                startIcon={<QrCodeScannerIcon />}
                onClick={() => navigate(`/events/${id}/live`)}
                sx={{ 
                  textTransform: 'none',
                  bgcolor: '#0891b2',
                  '&:hover': { bgcolor: '#0e7490' }
                }}
              >
                Manage Live Event
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => navigate(`/events/${id}`)}
              sx={{ 
                textTransform: 'none',
                borderColor: '#e5e7eb',
                color: '#6b7280'
              }}
            >
              View Public Page
            </Button>
            {!isEventPast() && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#e5e7eb',
                  color: '#6b7280'
                }}
              >
                Edit Event
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteEvent}
              sx={{ 
                textTransform: 'none',
                borderColor: '#fee2e2',
                color: '#ef4444',
                '&:hover': { borderColor: '#fecaca', bgcolor: '#fef2f2' }
              }}
            >
              {isEventPast() ? 'Archive Event' : 'Delete Event'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', px: 4, py: 3 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: 3,
          maxWidth: 1400,
          mx: 'auto'
        }}>
          <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 1 }}>
                  Total Registrations
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  {attendees.length}
                </Typography>
              </Box>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2, 
                bgcolor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PeopleIcon sx={{ color: '#0891b2', fontSize: 24 }} />
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 1 }}>
                  Total Revenue
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  NPR {getTotalRevenue().toFixed(0)}
                </Typography>
              </Box>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2, 
                bgcolor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AttachMoneyIcon sx={{ color: '#10b981', fontSize: 24 }} />
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 1 }}>
                  Active Tickets
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  {getActiveTickets()}
                </Typography>
              </Box>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2, 
                bgcolor: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ConfirmationNumberIcon sx={{ color: '#6366f1', fontSize: 24 }} />
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 1 }}>
                  Checked-in Attendees
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  {getCheckedIn()}
                </Typography>
              </Box>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2, 
                bgcolor: '#fed7aa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircleIcon sx={{ color: '#f97316', fontSize: 24 }} />
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', px: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
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
            <Tab icon={<CategoryIcon />} iconPosition="start" label="Overview" />
            <Tab icon={<PeopleIcon />} iconPosition="start" label="Attendees" />
            <Tab icon={<ConfirmationNumberIcon />} iconPosition="start" label="Ticket Types" />
            <Tab label="Settings" />
          </Tabs>
        </Box>
      </Box>

      {/* Tab Content */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 4, py: 4 }}>
        {/* Past Event Warning */}
        {isEventPast() && (
          <Box sx={{ 
            bgcolor: '#fef3c7', 
            border: '1px solid #fde68a',
            borderRadius: 2,
            p: 3, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%',
              bgcolor: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Typography sx={{ fontSize: '1.5rem' }}>⏰</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, color: '#92400e', mb: 0.5 }}>
                This event has ended
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#92400e' }}>
                You can still view analytics, attendee data, and export reports. Ticket sales and event editing are disabled.
              </Typography>
            </Box>
          </Box>
        )}

        {/* Live Event Banner */}
        {isEventLive() && (
          <Box sx={{ 
            bgcolor: '#fef3c7', 
            border: '1px solid #fde68a',
            borderRadius: 2,
            p: 3, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%',
                bgcolor: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Typography sx={{ fontSize: '1.5rem' }}>🔴</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, color: '#92400e', mb: 0.5 }}>
                  Your event is live now!
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#92400e' }}>
                  Manage live interactions, check-in attendees, and monitor engagement in real-time.
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<QrCodeScannerIcon />}
              onClick={() => navigate(`/events/${id}/live`)}
              sx={{ 
                textTransform: 'none',
                bgcolor: '#f59e0b',
                '&:hover': { bgcolor: '#d97706' },
                flexShrink: 0
              }}
            >
              Go Live
            </Button>
          </Box>
        )}

        {/* Overview Tab */}
        {activeTab === 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3 }}>
            <Box>
              {/* Event Image */}
              <Card sx={{ mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <Box sx={{ 
                  height: 300,
                  backgroundImage: 'url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
              </Card>

              {/* Event Details */}
              <Card sx={{ p: 4, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Event Details
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <CalendarMonthIcon sx={{ color: '#0891b2', mt: 0.5 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 0.5 }}>
                      Date & Time
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {formatDate(event.start_time)}
                    </Typography>
                    <Typography sx={{ color: '#6b7280' }}>
                      {formatTime(event.start_time)} - {formatTime(event.end_time)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <LocationOnIcon sx={{ color: '#0891b2', mt: 0.5 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 0.5 }}>
                      Location
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {event.location || 'Virtual Event'}
                    </Typography>
                    {event.streaming_url && (
                      <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        {event.streaming_url}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <CategoryIcon sx={{ color: '#0891b2', mt: 0.5 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 0.5 }}>
                      Category
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      Technology
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 1 }}>
                    Description
                  </Typography>
                  <Typography sx={{ color: '#1f2937', lineHeight: 1.7 }}>
                    {event.description}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 1 }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label="Technology" size="small" />
                    <Chip label="Innovation" size="small" />
                    <Chip label="Networking" size="small" />
                    <Chip label="Conference" size="small" />
                  </Box>
                </Box>
              </Card>

              {/* Quick Actions */}
              <Card sx={{ p: 3, mt: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<ShareIcon />}
                    fullWidth
                    sx={{ 
                      textTransform: 'none',
                      bgcolor: '#0891b2',
                      '&:hover': { bgcolor: '#0e7490' }
                    }}
                  >
                    Share Event
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    fullWidth
                    sx={{ 
                      textTransform: 'none',
                      borderColor: '#e5e7eb',
                      color: '#6b7280'
                    }}
                  >
                    Download Report
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<QrCodeScannerIcon />}
                    fullWidth
                    onClick={() => navigate('/qr-scanner')}
                    sx={{ 
                      textTransform: 'none',
                      borderColor: '#e5e7eb',
                      color: '#6b7280'
                    }}
                  >
                    QR Scanner
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EmailIcon />}
                    fullWidth
                    sx={{ 
                      textTransform: 'none',
                      borderColor: '#e5e7eb',
                      color: '#6b7280'
                    }}
                  >
                    Email Attendees
                  </Button>
                </Box>
              </Card>
            </Box>

            {/* Right Column - Ticket Types */}
            <Box>
              <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Ticket Types
                </Typography>

                {ticketTypes.map((type) => {
                  const sold = (type.quantity_available || 0) - (type.remaining || 0);
                  const percentage = type.quantity_available ? (sold / type.quantity_available) * 100 : 0;
                  
                  return (
                    <Box key={type.ticket_type_id} sx={{ mb: 3, pb: 3, borderBottom: '1px solid #e5e7eb', '&:last-child': { borderBottom: 'none', mb: 0, pb: 0 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {type.type_name}
                        </Typography>
                        <Chip 
                          label={type.remaining > 0 ? 'Active' : 'Sold Out'}
                          size="small"
                          sx={{ 
                            bgcolor: type.remaining > 0 ? '#d1fae5' : '#fee2e2',
                            color: type.remaining > 0 ? '#10b981' : '#ef4444',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      <Typography sx={{ color: '#0891b2', fontWeight: 700, fontSize: '1.125rem', mb: 1 }}>
                        NPR {parseFloat(type.price).toFixed(0)}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 1 }}>
                        Sold: {sold}/{type.quantity_available || 0}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 1 }}>
                        Remaining: {type.remaining || 0}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 1,
                            bgcolor: '#e5e7eb',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#0891b2'
                            }
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'right' }}>
                        {percentage.toFixed(0)}%
                      </Typography>
                    </Box>
                  );
                })}
              </Card>
            </Box>
          </Box>
        )}

        {/* Attendees Tab */}
        {activeTab === 1 && (
          <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Attendees List
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<EmailIcon />}
                    sx={{ 
                      textTransform: 'none',
                      bgcolor: '#0891b2',
                      '&:hover': { bgcolor: '#0e7490' }
                    }}
                  >
                    Email All
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportCSV}
                    sx={{ 
                      textTransform: 'none',
                      borderColor: '#e5e7eb',
                      color: '#6b7280'
                    }}
                  >
                    Export CSV
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1, bgcolor: 'white' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#9ca3af' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={filterTicketType}
                    onChange={(e) => setFilterTicketType(e.target.value)}
                  >
                    <MenuItem value="all">All Ticket Types</MenuItem>
                    {ticketTypes.map(type => (
                      <MenuItem key={type.ticket_type_id} value={type.type_name}>
                        {type.type_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="used">Used</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>NAME</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>EMAIL</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>TICKET TYPE</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>PRICE</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>QR CODE</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>REGISTRATION DATE</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAttendees.map((attendee) => (
                    <TableRow 
                      key={attendee.ticket_id}
                      sx={{ '&:hover': { bgcolor: '#f9fafb' } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#0891b2', fontSize: '0.875rem' }}>
                            {attendee.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            {attendee.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {attendee.email}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={attendee.ticket_type}
                          size="small"
                          sx={{ 
                            bgcolor: '#e0e7ff',
                            color: '#6366f1',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        NPR {parseFloat(attendee.price || 0).toFixed(0)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={attendee.status}
                          size="small"
                          sx={{ 
                            bgcolor: attendee.status === 'active' ? '#d1fae5' : attendee.status === 'used' ? '#dbeafe' : '#fee2e2',
                            color: attendee.status === 'active' ? '#10b981' : attendee.status === 'used' ? '#0891b2' : '#ef4444',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#0891b2' }}>
                        {attendee.qr_code}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {new Date(attendee.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small">
                            <QrCodeScannerIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton size="small">
                            <EmailIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredAttendees.length === 0 && (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Typography sx={{ color: '#9ca3af' }}>
                  No attendees found
                </Typography>
              </Box>
            )}
          </Card>
        )}

        {/* Ticket Types Tab */}
        {activeTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Ticket Types
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={isEventPast()}
                sx={{ 
                  textTransform: 'none',
                  bgcolor: '#0891b2',
                  '&:hover': { bgcolor: '#0e7490' }
                }}
              >
                Add Ticket Type
              </Button>
            </Box>

            {ticketTypes.map((type) => {
              const sold = (type.quantity_available || 0) - (type.remaining || 0);
              const percentage = type.quantity_available ? (sold / type.quantity_available) * 100 : 0;
              
              return (
                <Card key={type.ticket_type_id} sx={{ mb: 3, p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {type.type_name}
                        </Typography>
                        <Chip 
                          label={type.remaining > 0 ? 'Active' : 'Sold Out'}
                          size="small"
                          sx={{ 
                            bgcolor: type.remaining > 0 ? '#d1fae5' : '#fee2e2',
                            color: type.remaining > 0 ? '#10b981' : '#ef4444',
                            fontWeight: 600
                          }}
                        />
                        <Chip 
                          label="Price Locked"
                          size="small"
                          sx={{ bgcolor: '#f3f4f6', color: '#6b7280' }}
                        />
                      </Box>
                      <Typography sx={{ color: '#0891b2', fontWeight: 700, fontSize: '1.5rem' }}>
                        NPR {parseFloat(type.price).toFixed(0)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, mb: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 0.5 }}>
                        Total Quantity
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                        {type.quantity_available || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 0.5 }}>
                        Sold
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                        {sold}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 0.5 }}>
                        Remaining
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                        {type.remaining || 0}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Sales Progress
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {percentage.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentage} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 1,
                        bgcolor: '#e5e7eb',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#0891b2'
                        }
                      }}
                    />
                  </Box>

                  {sold > 0 && (
                    <Box sx={{ bgcolor: '#fef3c7', p: 2, borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography sx={{ fontSize: '0.875rem', color: '#92400e' }}>
                        ⚠️ Price cannot be changed because tickets have already been sold. You can only adjust quantity or disable this ticket type.
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={sold > 0 || isEventPast()}
                      sx={{ 
                        textTransform: 'none',
                        borderColor: '#e5e7eb',
                        color: '#6b7280'
                      }}
                    >
                      {isEventPast() ? 'Event Ended' : 'Price Locked'}
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={isEventPast()}
                      sx={{ 
                        textTransform: 'none',
                        borderColor: '#e5e7eb',
                        color: '#6b7280'
                      }}
                    >
                      {type.remaining > 0 ? 'Disable' : 'Enable'}
                    </Button>
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}

        {/* Settings Tab */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Settings (Coming Soon)
            </Typography>
            <Card sx={{ p: 6, textAlign: 'center', boxShadow: 'none', border: '1px solid #e5e7eb' }}>
              <Typography sx={{ color: '#9ca3af' }}>
                Settings features will be available soon
              </Typography>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default OrganizerEventManage;
