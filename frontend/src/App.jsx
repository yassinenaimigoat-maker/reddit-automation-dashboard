import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Configuration from './pages/Configuration';
import Subreddits from './pages/Subreddits';
import Queue from './pages/Queue';
import Comments from './pages/Comments';
import Accounts from './pages/Accounts';
import Analytics from './pages/Analytics';
import Logs from './pages/Logs';
import Layout from './components/Layout';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/config" element={<Configuration />} />
                  <Route path="/subreddits" element={<Subreddits />} />
                  <Route path="/queue" element={<Queue />} />
                  <Route path="/comments" element={<Comments />} />
                  <Route path="/accounts" element={<Accounts />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/logs" element={<Logs />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
