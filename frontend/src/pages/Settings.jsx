import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Switch,
  Button,
  Avatar,
  Divider,
  IconButton,
  Alert,
  TextField,
  Tabs,
  Tab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventIcon from '@mui/icons-material/Event';
import UpdateIcon from '@mui/icons-material/Update';
import CancelIcon from '@mui/icons-material/Cancel';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PollIcon from '@mui/icons-material/Poll';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import api from '../services/api';

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [preferences, setPreferences] = useState({
    email_registration: true,
    email_reminder: true,
    email_updates: true,
    email_cancellation: true,
    email_qa_answer: true,
    email_new_poll: true,
    in_app_notifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');
    try {
      await api.put('/notifications/preferences', preferences);
      setSuccessMessage('Preferences saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', px: 4, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: 1, 
              bgcolor: '#0891b2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.25rem'
            }}>
              N
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Nexus Events
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 4, py: 4 }}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label="Profile Settings" 
              icon={<PersonIcon />} 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab 
              label="Account Settings" 
              icon={<ShieldIcon />} 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        {/* Profile Settings Tab */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Profile Settings
            </Typography>
            <Typography sx={{ color: '#6b7280', mb: 4 }}>
              Manage your personal information and public profile
            </Typography>

            {/* Profile Photo */}
            <Card sx={{ p: 4, mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Profile Photo
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar sx={{ width: 100, height: 100, bgcolor: '#0891b2', fontSize: '2.5rem' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ color: '#6b7280', mb: 2 }}>
                    Upload a new profile photo. Recommended size: 400x400px
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      sx={{ 
                        bgcolor: '#0891b2', 
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#0e7490' }
                      }}
                    >
                      Upload Photo
                    </Button>
                    <Button 
                      variant="outlined" 
                      sx={{ textTransform: 'none', color: '#6b7280', borderColor: '#d1d5db' }}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Card>

            {/* Basic Information */}
            <Card sx={{ p: 4, mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Basic Information
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    First Name
                  </Typography>
                  <TextField
                    fullWidth
                    defaultValue={user?.name?.split(' ')[0] || ''}
                    placeholder="John"
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    Last Name
                  </Typography>
                  <TextField
                    fullWidth
                    defaultValue={user?.name?.split(' ').slice(1).join(' ') || ''}
                    placeholder="Doe"
                    size="small"
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    defaultValue={user?.email || ''}
                    placeholder="john.doe@email.com"
                    size="small"
                    disabled
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    Phone Number
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="+1 (555) 123-4567"
                    size="small"
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    Company
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Tech Events Inc."
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    Job Title
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Event Organizer"
                    size="small"
                  />
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                  Bio
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Passionate event organizer with 5+ years of experience in creating memorable experiences."
                  size="small"
                />
                <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mt: 1 }}>
                  Brief description for your profile. Maximum 500 characters.
                </Typography>
              </Box>
            </Card>

            {/* Social Links */}
            <Card sx={{ p: 4, mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Social Links
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    🌐 Website
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="https://johndoe.com"
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    💼 LinkedIn
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="https://linkedin.com/in/johndoe"
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    𝕏 Twitter / X
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="@johndoe"
                    size="small"
                  />
                </Box>
              </Box>
            </Card>

            {/* Save Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ textTransform: 'none', color: '#6b7280', borderColor: '#d1d5db' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{ 
                  bgcolor: '#0891b2',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#0e7490' }
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        )}

        {/* Account Settings Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Account Settings
            </Typography>
            <Typography sx={{ color: '#6b7280', mb: 4 }}>
              Manage your account security and preferences
            </Typography>

            {/* Change Password */}
            <Card sx={{ p: 4, mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  bgcolor: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LockIcon sx={{ color: '#0891b2', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Change Password
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Update your password to keep your account secure
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    Current Password
                  </Typography>
                  <TextField
                    fullWidth
                    type="password"
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    New Password
                  </Typography>
                  <TextField
                    fullWidth
                    type="password"
                    size="small"
                  />
                  <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mt: 0.5 }}>
                    Must be at least 8 characters with letters and numbers
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    Confirm New Password
                  </Typography>
                  <TextField
                    fullWidth
                    type="password"
                    size="small"
                  />
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  sx={{ 
                    bgcolor: '#0891b2',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#0e7490' }
                  }}
                >
                  Update Password
                </Button>
              </Box>
            </Card>

            {/* Change Email */}
            <Card sx={{ p: 4, mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  bgcolor: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <EmailIcon sx={{ color: '#f59e0b', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Change Email Address
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Current email: {user?.email}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    New Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    Confirm Password
                  </Typography>
                  <TextField
                    fullWidth
                    type="password"
                    size="small"
                  />
                  <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mt: 0.5 }}>
                    Enter your password to confirm this change
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  sx={{ 
                    bgcolor: '#0891b2',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#0e7490' }
                  }}
                >
                  Update Email
                </Button>
              </Box>
            </Card>

            {/* Notification Preferences */}
            <Card sx={{ p: 4, mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  bgcolor: '#f3e8ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <NotificationsIcon sx={{ color: '#a855f7', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Notification Preferences
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Choose what notifications you want to receive
                  </Typography>
                </Box>
              </Box>

              <Typography sx={{ fontWeight: 600, mb: 2 }}>
                Email Notifications
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 2 }}>
                Receive email notifications for important updates
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: '1px solid #f3f4f6' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      Registration Confirmations
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Get notified when you register for an event
                    </Typography>
                  </Box>
                  <Switch
                    checked={preferences.email_registration}
                    onChange={() => handleToggle('email_registration')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#0891b2',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#0891b2',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: '1px solid #f3f4f6' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      Event Reminders
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Get reminders about upcoming events
                    </Typography>
                  </Box>
                  <Switch
                    checked={preferences.email_reminder}
                    onChange={() => handleToggle('email_reminder')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#0891b2',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#0891b2',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: '1px solid #f3f4f6' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      Attendee Updates
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Notifications when attendees register or check-in
                    </Typography>
                  </Box>
                  <Switch
                    checked={preferences.email_updates}
                    onChange={() => handleToggle('email_updates')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#0891b2',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#0891b2',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: '1px solid #f3f4f6' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      Q&A Answers
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Get notified when your question is answered
                    </Typography>
                  </Box>
                  <Switch
                    checked={preferences.email_qa_answer}
                    onChange={() => handleToggle('email_qa_answer')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#0891b2',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#0891b2',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: '1px solid #f3f4f6' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      New Polls
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Be notified when organizers create new polls
                    </Typography>
                  </Box>
                  <Switch
                    checked={preferences.email_new_poll}
                    onChange={() => handleToggle('email_new_poll')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#0891b2',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#0891b2',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      Event Cancellations
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Be informed if an event is cancelled
                    </Typography>
                  </Box>
                  <Switch
                    checked={preferences.email_cancellation}
                    onChange={() => handleToggle('email_cancellation')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#0891b2',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#0891b2',
                      },
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography sx={{ fontWeight: 600, mb: 2 }}>
                Push Notifications
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 2 }}>
                Browser push notifications for real-time updates
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    In-App Notifications
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Show notifications in the notification bell
                  </Typography>
                </Box>
                <Switch
                  checked={preferences.in_app_notifications}
                  onChange={() => handleToggle('in_app_notifications')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#0891b2',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#0891b2',
                    },
                  }}
                />
              </Box>
            </Card>

            {/* Danger Zone */}
            <Card sx={{ p: 4, mb: 3, boxShadow: 'none', border: '1px solid #fecaca', bgcolor: '#fef2f2' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  bgcolor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldIcon sx={{ color: '#ef4444', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#991b1b' }}>
                    Danger Zone
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#7f1d1d' }}>
                    Irreversible actions for your account
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: '1px solid #fecaca' }}>
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>
                    Deactivate Account
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#7f1d1d' }}>
                    Temporarily disable your account
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  sx={{ 
                    textTransform: 'none',
                    color: '#dc2626',
                    borderColor: '#dc2626',
                    '&:hover': {
                      bgcolor: '#fef2f2',
                      borderColor: '#dc2626'
                    }
                  }}
                >
                  Deactivate
                </Button>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>
                    Delete Account
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#7f1d1d' }}>
                    Permanently delete your account and all data
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  sx={{ 
                    textTransform: 'none',
                    bgcolor: '#dc2626',
                    '&:hover': {
                      bgcolor: '#b91c1c'
                    }
                  }}
                >
                  Delete Account
                </Button>
              </Box>
            </Card>

            {/* Save Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ textTransform: 'none', color: '#6b7280', borderColor: '#d1d5db' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                sx={{ 
                  bgcolor: '#0891b2',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#0e7490' }
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Settings;
