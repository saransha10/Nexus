import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert, Paper, Checkbox, FormControlLabel } from '@mui/material';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { 
        email, 
        password,
        twoFactorCode: showTwoFactor ? twoFactorCode : undefined,
        rememberMe 
      });
      
      // Check if 2FA is required
      if (response.data.requires2FA) {
        setShowTwoFactor(true);
        setError('');
        setLoading(false);
        return;
      }
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
            Nexus Events
          </Typography>
          
          <Typography variant="h5" gutterBottom align="center" color="text.secondary" sx={{ mb: 3 }}>
            {showTwoFactor ? 'Two-Factor Authentication' : 'Login'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {showTwoFactor && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please enter the 6-digit code from your authenticator app
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {!showTwoFactor ? (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Remember me"
                  />
                  
                  <Button 
                    onClick={handleForgotPassword}
                    sx={{ textTransform: 'none', color: '#1976d2' }}
                  >
                    Forgot Password?
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="6-Digit Code"
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoComplete="off"
                  autoFocus
                  inputProps={{ 
                    maxLength: 6,
                    style: { textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }
                  }}
                />
                
                <Button
                  onClick={() => setShowTwoFactor(false)}
                  sx={{ mt: 1, textTransform: 'none' }}
                >
                  ← Back to login
                </Button>
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || (showTwoFactor && twoFactorCode.length !== 6)}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Logging in...' : showTwoFactor ? 'Verify Code' : 'Login'}
            </Button>

            {!showTwoFactor && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                  <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'grey.300' }} />
                  <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
                    OR
                  </Typography>
                  <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'grey.300' }} />
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => window.location.href = 'http://localhost:5001/api/auth/google'}
                  sx={{ 
                    py: 1.5, 
                    mb: 2,
                    textTransform: 'none',
                    borderColor: 'grey.300',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'grey.400',
                      bgcolor: 'grey.50',
                    }
                  }}
                  startIcon={
                    <img 
                      src="https://www.google.com/favicon.ico" 
                      alt="Google" 
                      style={{ width: 20, height: 20 }}
                    />
                  }
                >
                  Continue with Google
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2">
                    Don't have an account?{' '}
                    <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
                      Register here
                    </Link>
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
