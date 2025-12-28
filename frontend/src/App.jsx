import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import RoleSelection from './pages/RoleSelection';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import MyTickets from './pages/MyTickets';
import OrganizerDashboard from './pages/OrganizerDashboard';
import QRScanner from './pages/QRScanner';
import PaymentVerify from './pages/PaymentVerify';
import EsewaVerify from './pages/EsewaVerify';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
        <Route path="/qr-scanner" element={<QRScanner />} />
        <Route path="/payment/verify" element={<PaymentVerify />} />
        <Route path="/payment/esewa/verify" element={<EsewaVerify />} />
      </Routes>
    </Router>
  );
}

export default App;
