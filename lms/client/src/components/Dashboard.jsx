import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // Decode token to get user info (simple way, in production use proper JWT decode)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch (err) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return <div className="page-container"><div style={{textAlign: 'center', fontSize: '1.5em'}}>Loading...</div></div>;

  return (
    <div className="page-container">
      <h2 className="page-title">Dashboard</h2>
      <div className="card">
        <p style={{fontSize: '1.2em'}}>Welcome, <strong>{user.email}</strong>!</p>
        <p>Role: <span style={{color: '#667eea', fontWeight: 'bold'}}>{user.role}</span></p>
        <p style={{color: '#4ecdc4'}}>🔥 Hot reload is working!</p>
      </div>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px'}}>
        <button onClick={() => navigate('/courses')} className="btn-primary">View Courses</button>
        {user.role === 'Instructor' || user.role === 'Admin' ? (
          <>
            <button onClick={() => navigate('/create-course')} className="btn-success">Create Course</button>
            <button onClick={() => navigate('/manage-courses')} className="btn-secondary">Manage My Courses</button>
          </>
        ) : null}
        <button onClick={handleLogout} className="btn-danger">Logout</button>
      </div>
    </div>
  );
}

export default Dashboard;