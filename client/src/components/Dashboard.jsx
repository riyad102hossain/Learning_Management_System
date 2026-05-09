import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  if (!user) return <div className="page-container"><div style={{textAlign: 'center', fontSize: '1.5em'}}>Loading...</div></div>;

  const roleSubtitle = user.role === 'Instructor'
    ? 'Create and guide courses with confidence.'
    : 'Keep learning and stay on track.';

  return (
    <div className="page-container dashboard-page">
      <div className="dashboard-hero">
        <div>
          <h2 className="page-title">Your Learning Hub</h2>
          <p className="hero-subtitle">Fast access to courses, progress, and instructor tools all in one place.</p>
        </div>
        <div className="hero-badge">{user.role}</div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>📚 Get Started</h3>
          <p>Browse our course catalog, track your learning progress, and stay up to date with new content.</p>
          <button onClick={() => navigate('/courses')} className="card-btn btn-primary">Go to My Courses →</button>
        </div>
        <div className="dashboard-card">
          <h3>⚡ Quick Tips</h3>
          <ul>
            <li>✓ Complete lessons at your own pace</li>
            <li>✓ Download course materials</li>
            <li>✓ Track your progress</li>
          </ul>
        </div>
        <div className="dashboard-card dashboard-card-highlight">
          <h3>🎯 Your Path</h3>
          <p>{roleSubtitle}</p>
          {user.role === 'Instructor' || user.role === 'Admin' ? (
            <button onClick={() => navigate('/create-course')} className="card-btn" style={{background: '#fff', color: '#45b7d1', marginTop: '12px'}}>+ Create New Course</button>
          ) : null}
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-box">
          <div className="stat-number">0</div>
          <div className="stat-label">Courses</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">0</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">0</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;