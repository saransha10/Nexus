import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  Tabs,
  Tab,
  IconButton,
  Button,
  Grid,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatIcon from '@mui/icons-material/Chat';
import PollIcon from '@mui/icons-material/Poll';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import api from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function EventAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      const [overview, revenue, attendance, engagement] = await Promise.all([
        api.get(`/analytics/event/${id}`),
        api.get(`/analytics/event/${id}/revenue`),
        api.get(`/analytics/event/${id}/attendance`),
        api.get(`/analytics/event/${id}/engagement`)
      ]);

      setAnalytics(overview.data);
      setRevenueData(revenue.data);
      setAttendanceData(attendance.data);
      setEngagementData(engagement.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!analytics) return;

    const csv = [
      ['Metric', 'Value'],
      ['Total Tickets', analytics.tickets.total_tickets],
      ['Active Tickets', analytics.tickets.active_tickets],
      ['Checked In', analytics.tickets.checked_in],
      ['Total Revenue', `NPR ${analytics.tickets.total_revenue}`],
      ['Total Messages', analytics.engagement.total_messages],
      ['Total Polls', analytics.engagement.total_polls],
      ['Total Questions', analytics.engagement.total_questions]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-analytics-${id}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading analytics...</Typography>
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>No analytics data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', px: 4, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Event Analytics
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Comprehensive insights and reports
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
            sx={{ textTransform: 'none' }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Overview Stats */}
      <Box sx={{ px: 4, py: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 1 }}>
                    Total Tickets
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {analytics.tickets.total_tickets}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#10b981' }}>
                    {analytics.tickets.active_tickets} active
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
                  <PeopleIcon sx={{ color: '#3b82f6' }} />
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 1 }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    NPR {parseFloat(analytics.tickets.total_revenue).toFixed(0)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    From ticket sales
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
                  <AttachMoneyIcon sx={{ color: '#10b981' }} />
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 1 }}>
                    Checked In
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {analytics.tickets.checked_in}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {analytics.tickets.total_tickets > 0 
                      ? Math.round((analytics.tickets.checked_in / analytics.tickets.total_tickets) * 100)
                      : 0}% attendance rate
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  bgcolor: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircleIcon sx={{ color: '#f59e0b' }} />
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ color: '#6b7280', fontSize: '0.875rem', mb: 1 }}>
                    Engagement
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {analytics.engagement.total_messages + analytics.engagement.total_votes}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Messages & votes
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
                  <TrendingUpIcon sx={{ color: '#6366f1' }} />
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Box sx={{ px: 4 }}>
        <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: '1px solid #e5e7eb' }}
          >
            <Tab label="Overview" sx={{ textTransform: 'none' }} />
            <Tab label="Revenue" sx={{ textTransform: 'none' }} />
            <Tab label="Attendance" sx={{ textTransform: 'none' }} />
            <Tab label="Engagement" sx={{ textTransform: 'none' }} />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && <OverviewTab analytics={analytics} />}
            {activeTab === 1 && <RevenueTab data={revenueData} />}
            {activeTab === 2 && <AttendanceTab data={attendanceData} />}
            {activeTab === 3 && <EngagementTab data={engagementData} />}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

// Overview Tab Component
function OverviewTab({ analytics }) {
  const ticketTypeData = {
    labels: analytics.ticketsByType.map(t => t.ticket_type),
    datasets: [{
      label: 'Tickets Sold',
      data: analytics.ticketsByType.map(t => t.count),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    }]
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Tickets by Type
        </Typography>
        <Box sx={{ height: 300 }}>
          <Doughnut 
            data={ticketTypeData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom' }
              }
            }}
          />
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Engagement Summary
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon sx={{ color: '#6b7280' }} />
              <Typography>Chat Messages</Typography>
            </Box>
            <Typography sx={{ fontWeight: 600 }}>
              {analytics.engagement.total_messages}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PollIcon sx={{ color: '#6b7280' }} />
              <Typography>Poll Votes</Typography>
            </Box>
            <Typography sx={{ fontWeight: 600 }}>
              {analytics.engagement.total_votes}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QuestionAnswerIcon sx={{ color: '#6b7280' }} />
              <Typography>Questions Asked</Typography>
            </Box>
            <Typography sx={{ fontWeight: 600 }}>
              {analytics.engagement.total_questions}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ color: '#6b7280' }} />
              <Typography>Questions Answered</Typography>
            </Box>
            <Typography sx={{ fontWeight: 600 }}>
              {analytics.engagement.answered_questions}
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

// Revenue Tab Component
function RevenueTab({ data }) {
  if (!data) return <Typography>Loading...</Typography>;

  const revenueChartData = {
    labels: data.revenueTimeline.map(r => new Date(r.date).toLocaleDateString()),
    datasets: [{
      label: 'Revenue (NPR)',
      data: data.revenueTimeline.map(r => parseFloat(r.revenue)),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Revenue Over Time
        </Typography>
        <Box sx={{ height: 300 }}>
          <Line 
            data={revenueChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Revenue by Ticket Type
        </Typography>
        {data.revenueByType.map((type) => (
          <Box key={type.ticket_type} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>{type.ticket_type}</Typography>
              <Typography sx={{ fontWeight: 600 }}>
                NPR {parseFloat(type.revenue).toFixed(0)}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(parseFloat(type.revenue) / data.revenueByType.reduce((sum, t) => sum + parseFloat(t.revenue), 0)) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        ))}
      </Grid>
    </Grid>
  );
}

// Attendance Tab Component
function AttendanceTab({ data }) {
  if (!data) return <Typography>Loading...</Typography>;

  const attendanceData = {
    labels: ['Checked In', 'Not Checked In', 'Cancelled'],
    datasets: [{
      data: [
        data.summary.checked_in,
        data.summary.not_checked_in,
        data.summary.cancelled
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
    }]
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Attendance Status
        </Typography>
        <Box sx={{ height: 300 }}>
          <Doughnut 
            data={attendanceData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom' }
              }
            }}
          />
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Attendance by Ticket Type
        </Typography>
        {data.byType.map((type) => (
          <Box key={type.ticket_type} sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>{type.ticket_type}</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <Chip 
                label={`${type.checked_in} checked in`}
                size="small"
                sx={{ bgcolor: '#d1fae5', color: '#10b981' }}
              />
              <Chip 
                label={`${type.not_checked_in} pending`}
                size="small"
                sx={{ bgcolor: '#fef3c7', color: '#f59e0b' }}
              />
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(type.checked_in / type.total) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        ))}
      </Grid>
    </Grid>
  );
}

// Engagement Tab Component
function EngagementTab({ data }) {
  if (!data) return <Typography>Loading...</Typography>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Q&A Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box>
            <Typography sx={{ fontSize: '2rem', fontWeight: 700 }}>
              {data.qaStats.total_questions}
            </Typography>
            <Typography sx={{ color: '#6b7280' }}>Total Questions</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
              {data.qaStats.answered}
            </Typography>
            <Typography sx={{ color: '#6b7280' }}>Answered</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
              {data.qaStats.answer_rate}%
            </Typography>
            <Typography sx={{ color: '#6b7280' }}>Answer Rate</Typography>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Poll Participation
        </Typography>
        {data.pollParticipation.map((poll) => (
          <Box key={poll.poll_id} sx={{ mb: 2, p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>{poll.question}</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {poll.participants} participants • {poll.total_votes} total votes
            </Typography>
          </Box>
        ))}
      </Grid>
    </Grid>
  );
}

export default EventAnalytics;