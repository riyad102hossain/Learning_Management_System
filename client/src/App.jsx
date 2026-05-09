import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Courses from './components/Courses'
import CourseDetail from './components/CourseDetail'
import CreateCourse from './components/CreateCourse'
import CourseManagement from './components/CourseManagement'
import ManageCourses from './components/ManageCourses'
import './App.css'

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      }
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const primaryNavItems = [
    { path: '/dashboard', label: '📊 Dashboard' },
    { path: '/courses', label: '📚 My Courses' },
  ];

  const instructorNavItems = isAuthenticated && user?.role === 'Instructor' 
    ? [{ path: '/manage-courses', label: '🛠️ Instructor Tools' }]
    : [];

  const settingsNavItems = [
    { path: '/settings', label: '⚙️ Settings' },
  ];

  if (!isAuthenticated) {
    return (
      <>
        <div className="main-content full-screen">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="header">
        <div className="header-logo">LMS</div>
        <div className="header-right">
          <div className="profile-section">
            <span className="user-role-badge">{user?.role}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="sidebar">
          <div className="sidebar-content">
            <div className="sidebar-nav">
              {primaryNavItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={location.pathname === item.path ? 'nav-link active' : 'nav-link'}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {instructorNavItems.length > 0 && (
              <>
                <div className="sidebar-divider"></div>
                <div className="sidebar-section-title">Instructor</div>
                <div className="sidebar-nav">
                  {instructorNavItems.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={location.pathname === item.path ? 'nav-link active' : 'nav-link'}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </>
            )}

            <div className="sidebar-divider"></div>
            <div className="sidebar-nav">
              {settingsNavItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={location.pathname === item.path ? 'nav-link active' : 'nav-link'}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
          </div>
        </div>

        <div className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/create-course" element={<CreateCourse />} />
            <Route path="/manage-courses" element={<ManageCourses />} />
            <Route path="/manage-course/:courseId" element={<CourseManagement />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Router>
        <AppContent />
      </Router>
    </div>
  )
}

export default App
