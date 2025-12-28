import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Button, Card, CardContent } from '@mui/material';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4">
              Dashboard
            </Typography>
            <Box>
              <Button variant="outlined" onClick={() => navigate('/settings')} sx={{ mr: 1 }}>
                Settings
              </Button>
              <Button variant="outlined" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Box>

          <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Welcome, {user.name}! 👋
              </Typography>
              <Typography variant="body1">
                Email: {user.email}
              </Typography>
              <Typography variant="body1">
                Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/events')}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎉 Browse Events
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Discover and register for upcoming events
                </Typography>
              </CardContent>
            </Card>

            {(user.role === 'organizer' || user.role === 'admin') && (
              <>
                <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/create-event')}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      ➕ Create Event
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Organize your own event
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/organizer-dashboard')}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📊 Organizer Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage events and view attendees
                    </Typography>
                  </CardContent>
                </Card>
              </>
            )}

            <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/my-tickets')}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎫 My Tickets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View your registered events
                </Typography>
              </CardContent>
            </Card>
          </Box>

        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
