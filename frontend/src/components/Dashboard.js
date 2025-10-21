import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Dashboard({ user, onLogout }) {
  const [currentOnCall, setCurrentOnCall] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch current on-call
      try {
        const currentResponse = await axios.get(`${API_URL}/oncall/current`, { headers });
        setCurrentOnCall(currentResponse.data);
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error('Error fetching current on-call:', err);
        }
        setCurrentOnCall(null);
      }

      // Fetch all schedules
      const schedulesResponse = await axios.get(`${API_URL}/oncall`, { headers });
      setSchedules(schedulesResponse.data);

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🔔 DevOps On-Call Dashboard</h1>
        <div className="header-right">
          <div className="user-info">
            <div className="user-name">{user.full_name || user.username}</div>
            <div className="user-role">
              {user.is_admin ? <span className="admin-badge">ADMIN</span> : 'User'}
            </div>
          </div>
          {user.is_admin && (
            <button className="btn btn-primary" onClick={() => navigate('/admin')}>
              Admin Panel
            </button>
          )}
          <button className="btn btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="current-oncall-banner">
        {currentOnCall ? (
          <>
            <div className="banner-icon">👨‍💻</div>
            <div className="banner-content">
              <h2>Currently On-Call</h2>
              <div className="oncall-name">{currentOnCall.user.full_name || currentOnCall.user.username}</div>
              <div className="oncall-period">
                {format(new Date(currentOnCall.schedule.start_date), 'PPP p')} - {format(new Date(currentOnCall.schedule.end_date), 'PPP p')}
              </div>
              {currentOnCall.schedule.notes && (
                <div className="oncall-notes">📝 {currentOnCall.schedule.notes}</div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="banner-icon">⚠️</div>
            <div className="banner-content">
              <h2>No Active On-Call</h2>
              <p>No one is currently scheduled for on-call duty</p>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2>📅 On-Call Schedule</h2>
        {schedules.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Engineer</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => {
                const now = new Date();
                const start = new Date(schedule.start_date);
                const end = new Date(schedule.end_date);
                const isActive = now >= start && now <= end;
                const isPast = now > end;
                const isFuture = now < start;

                return (
                  <tr key={schedule.id} className={isActive ? 'active-row' : ''}>
                    <td>
                      <strong>{schedule.user.full_name || schedule.user.username}</strong>
                      {schedule.user.is_admin && <span className="admin-badge ml-2">ADMIN</span>}
                    </td>
                    <td>{format(start, 'PPP p')}</td>
                    <td>{format(end, 'PPP p')}</td>
                    <td>{schedule.notes || '-'}</td>
                    <td>
                      {isActive && <span className="status-badge status-active">Active</span>}
                      {isFuture && <span className="status-badge status-upcoming">Upcoming</span>}
                      {isPast && <span className="status-badge status-past">Past</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No schedules found. Contact an administrator to set up on-call schedules.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

