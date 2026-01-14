import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Card,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import PersonIcon from '@mui/icons-material/Person';
import api from '../services/api';

function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const handleStartScanning = () => {
    setScanning(true);
    // In a real implementation, you would initialize the camera here
    // For now, we'll just show the scanning state
  };

  const handleManualEntry = async () => {
    if (!qrCode.trim()) {
      setError('Please enter a QR code');
      return;
    }

    try {
      const response = await api.post('/tickets/validate-qr', { qr_code: qrCode });
      
      // Add to recent check-ins
      setRecentCheckIns(prev => [{
        id: response.data.ticket.ticket_id,
        name: response.data.ticket.attendee_name,
        email: response.data.ticket.attendee_email,
        ticketType: response.data.ticket.ticket_type,
        time: new Date().toLocaleTimeString()
      }, ...prev]);

      setQrCode('');
      setManualEntryOpen(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to validate QR code');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', px: 4, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
              QR Scanner
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Scan attendee tickets to check them in
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Button
              variant="outlined"
              startIcon={<KeyboardIcon />}
              onClick={() => setManualEntryOpen(true)}
              sx={{ 
                borderColor: '#e5e7eb',
                color: '#6b7280',
                textTransform: 'none'
              }}
            >
              Manual Entry
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4, py: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 400px' }, gap: 3 }}>
          {/* Left Column - Camera Scanner */}
          <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Camera Scanner
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 3 }}>
              Position the QR code within the frame
            </Typography>

            {/* Camera View */}
            <Box sx={{ 
              position: 'relative',
              bgcolor: '#1a1f2e',
              borderRadius: 2,
              overflow: 'hidden',
              aspectRatio: '16/9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {!scanning ? (
                <Button
                  variant="contained"
                  startIcon={<QrCodeScannerIcon />}
                  onClick={handleStartScanning}
                  sx={{ 
                    bgcolor: '#0891b2',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#0e7490' }
                  }}
                >
                  Start Scanning
                </Button>
              ) : (
                <Box sx={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <video 
                    ref={videoRef}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Scanning overlay */}
                  <Box sx={{
                    position: 'absolute',
                    width: 250,
                    height: 250,
                    border: '3px solid #0891b2',
                    borderRadius: 2,
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
                  }} />
                </Box>
              )}
            </Box>
          </Card>

          {/* Right Column - Recent Check-ins & Instructions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Recent Check-ins */}
            <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Recent Check-ins
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 3 }}>
                {recentCheckIns.length} attendees checked in
              </Typography>

              {recentCheckIns.length === 0 ? (
                <Box sx={{ 
                  py: 6, 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <PersonIcon sx={{ fontSize: 48, color: '#d1d5db' }} />
                  <Typography sx={{ color: '#9ca3af' }}>
                    No check-ins yet
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentCheckIns.map((checkIn) => (
                    <ListItem 
                      key={checkIn.id}
                      sx={{ 
                        px: 0,
                        py: 1.5,
                        borderBottom: '1px solid #f3f4f6',
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <Avatar sx={{ bgcolor: '#0891b2', mr: 2, width: 40, height: 40 }}>
                        {checkIn.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {checkIn.name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip 
                              label={checkIn.ticketType}
                              size="small"
                              sx={{ 
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: '#fef3c7',
                                color: '#f59e0b'
                              }}
                            />
                            <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                              {checkIn.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Card>

            {/* How to Use */}
            <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                How to Use
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ 
                    minWidth: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: '#dbeafe',
                    color: '#0891b2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}>
                    1
                  </Box>
                  <Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Click "Start Scanning" to activate the camera
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ 
                    minWidth: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: '#dbeafe',
                    color: '#0891b2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}>
                    2
                  </Box>
                  <Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Position the attendee's QR code within the frame
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ 
                    minWidth: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: '#dbeafe',
                    color: '#0891b2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}>
                    3
                  </Box>
                  <Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    The system will automatically detect and check in the attendee
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ 
                    minWidth: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: '#dbeafe',
                    color: '#0891b2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}>
                    4
                  </Box>
                  <Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Use "Manual Entry" if the QR code cannot be scanned
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Manual Entry Dialog */}
      <Dialog 
        open={manualEntryOpen} 
        onClose={() => {
          setManualEntryOpen(false);
          setQrCode('');
          setError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Manual Entry
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 3 }}>
            Enter the QR code manually if scanning is not working
          </Typography>
          <TextField
            fullWidth
            label="QR Code"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            placeholder="QR-1234567890-ABCDEF"
            error={!!error}
            helperText={error}
            autoFocus
            sx={{ fontFamily: 'monospace' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => {
              setManualEntryOpen(false);
              setQrCode('');
              setError('');
            }}
            sx={{ textTransform: 'none', color: '#6b7280' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleManualEntry}
            variant="contained"
            sx={{ 
              bgcolor: '#0891b2',
              textTransform: 'none',
              '&:hover': { bgcolor: '#0e7490' }
            }}
          >
            Check In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default QRScanner;
