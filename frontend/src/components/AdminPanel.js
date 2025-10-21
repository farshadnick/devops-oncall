import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import './AdminPanel.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function AdminPanel({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('schedules');
  const [users, setUsers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // New user form
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    is_admin: false
  });

  // New schedule form
  const [newSchedule, setNewSchedule] = useState({
    user_id: '',
    start_date: '',
    end_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersResponse, schedulesResponse] = await Promise.all([
        axios.get(`${API_URL}/users`, { headers }),
        axios.get(`${API_URL}/oncall`, { headers })
      ]);

      setUsers(usersResponse.data);
      setSchedules(schedulesResponse.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('User created successfully!');
      setNewUser({ username: '', email: '', full_name: '', password: '', is_admin: false });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const scheduleData = {
        user_id: parseInt(newSchedule.user_id),
        start_date: new Date(newSchedule.start_date).toISOString(),
        end_date: new Date(newSchedule.end_date).toISOString(),
        notes: newSchedule.notes
      };

      await axios.post(`${API_URL}/oncall`, scheduleData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Schedule created successfully!');
      setNewSchedule({ user_id: '', start_date: '', end_date: '', notes: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/oncall/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Schedule deleted successfully!');
      fetchData();
    } catch (err) {
      setError('Failed to delete schedule');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>⚙️ Admin Panel</h1>
        <div className="header-right">
          <div className="user-info">
            <div className="user-name">{user.full_name || user.username}</div>
            <div className="user-role">
              <span className="admin-badge">ADMIN</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Dashboard
          </button>
          <button className="btn btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="nav-tabs">
        <button 
          className={activeTab === 'schedules' ? 'active' : ''}
          onClick={() => setActiveTab('schedules')}
        >
          📅 Manage Schedules
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 Manage Users
        </button>
      </div>

      {activeTab === 'schedules' && (
        <>
          <div className="card">
            <h2>Create New Schedule</h2>
            <form onSubmit={handleCreateSchedule}>
              <div className="form-group">
                <label>Select Engineer</label>
                <select
                  value={newSchedule.user_id}
                  onChange={(e) => setNewSchedule({ ...newSchedule, user_id: e.target.value })}
                  required
                >
                  <option value="">-- Select User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.username} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newSchedule.start_date}
                    onChange={(e) => setNewSchedule({ ...newSchedule, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newSchedule.end_date}
                    onChange={(e) => setNewSchedule({ ...newSchedule, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <input
                  type="text"
                  value={newSchedule.notes}
                  onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                  placeholder="e.g., Primary on-call for production incidents"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Create Schedule
              </button>
            </form>
          </div>

          <div className="card">
            <h2>All Schedules</h2>
            {schedules.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Engineer</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td>
                        <strong>{schedule.user.full_name || schedule.user.username}</strong>
                      </td>
                      <td>{format(new Date(schedule.start_date), 'PPP p')}</td>
                      <td>{format(new Date(schedule.end_date), 'PPP p')}</td>
                      <td>{schedule.notes || '-'}</td>
                      <td>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No schedules found.</p>
            )}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <>
          <div className="card">
            <h2>Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newUser.is_admin}
                    onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
                  />
                  <span>Admin User</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary">
                Create User
              </button>
            </form>
          </div>

          <div className="card">
            <h2>All Users</h2>
            {users.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.username}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.full_name || '-'}</td>
                      <td>
                        {u.is_admin ? (
                          <span className="admin-badge">ADMIN</span>
                        ) : (
                          <span className="user-badge">USER</span>
                        )}
                      </td>
                      <td>{format(new Date(u.created_at), 'PPP')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No users found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminPanel;

