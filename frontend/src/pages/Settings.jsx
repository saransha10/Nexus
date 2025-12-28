import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Button, Card, CardContent, 
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert 
} from '@mui/material';
import api from '../services/api';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    check2FAStatus();
  }, [navigate]);

  const check2FAStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/auth/2fa/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTwoFactorEnabled(response.data.enabled);
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    }
  };

  const handleGenerate2FA = async () => {
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/auth/2fa/generate', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setShowSetup(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await api.post('/auth/2fa/enable', 
        { token: verificationCode },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setSuccess('2FA enabled successfully!');
      setTwoFactorEnabled(true);
      setShowSetup(false);
      setVerificationCode('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await api.post('/auth/2fa/disable',
        { password },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setSuccess('2FA disabled successfully!');
      setTwoFactorEnabled(false);
      setShowDisable(false);
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

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
            <Typography variant="h4">Settings</Typography>
            <Box>
              <Button variant="outlined" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
                Dashboard
              </Button>
              <Button variant="outlined" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Two-Factor Authentication (2FA)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add an extra layer of security to your account by requiring a code from your authenticator app.
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Typography variant="body1">
                  Status: <strong>{twoFactorEnabled ? 'Enabled ✓' : 'Disabled'}</strong>
                </Typography>

                {!twoFactorEnabled ? (
                  <Button 
                    variant="contained" 
                    onClick={handleGenerate2FA}
                    disabled={loading}
                  >
                    Enable 2FA
                  </Button>
                ) : (
                  <Button 
                    variant="outlined" 
                    color="error"
                    onClick={() => setShowDisable(true)}
                  >
                    Disable 2FA
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Setup 2FA Dialog */}
          <Dialog open={showSetup} onClose={() => setShowSetup(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
            <DialogContent>
              <Typography variant="body2" paragraph>
                1. Install an authenticator app (Google Authenticator, Authy, etc.)
              </Typography>
              <Typography variant="body2" paragraph>
                2. Scan this QR code with your app:
              </Typography>

              {qrCode && (
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <img src={qrCode} alt="QR Code" style={{ maxWidth: '250px' }} />
                </Box>
              )}

              <Typography variant="body2" paragraph>
                Or enter this code manually: <strong>{secret}</strong>
              </Typography>

              <Typography variant="body2" paragraph>
                3. Enter the 6-digit code from your app:
              </Typography>

              <TextField
                fullWidth
                label="6-Digit Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputProps={{ maxLength: 6 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowSetup(false)}>Cancel</Button>
              <Button 
                onClick={handleEnable2FA} 
                variant="contained"
                disabled={verificationCode.length !== 6 || loading}
              >
                {loading ? 'Verifying...' : 'Enable 2FA'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Disable 2FA Dialog */}
          <Dialog open={showDisable} onClose={() => setShowDisable(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogContent>
              <Typography variant="body2" paragraph>
                Enter your password to disable 2FA:
              </Typography>

              <TextField
                fullWidth
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDisable(false)}>Cancel</Button>
              <Button 
                onClick={handleDisable2FA} 
                variant="contained"
                color="error"
                disabled={!password || loading}
              >
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings;
