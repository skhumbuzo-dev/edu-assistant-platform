import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import JobsPage from './pages/JobsPage.jsx';
import JobDetailPage from './pages/JobDetailPage.jsx';
import PostJobPage from './pages/PostJobPage.jsx';
import MyJobsPage from './pages/MyJobsPage.jsx';
import MyProposalsPage from './pages/MyProposalsPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import NavBar from './components/NavBar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', background: '#f8faf9' }}>
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/post-job" element={<ProtectedRoute requiredRole="teacher"><PostJobPage /></ProtectedRoute>} />
            <Route path="/my-jobs" element={<ProtectedRoute requiredRole="teacher"><MyJobsPage /></ProtectedRoute>} />
            <Route path="/my-proposals" element={<ProtectedRoute requiredRole="freelancer"><MyProposalsPage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;