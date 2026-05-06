import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../api';

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE}/my-courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } catch (err) {
        setError('Failed to load courses');
      }
    };

    fetchCourses();
  }, [navigate]);

  const handleManageCourse = (courseId) => {
    navigate(`/manage-course/${courseId}`);
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Manage My Courses</h2>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '30px'}}>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">Back to Dashboard</button>
        <button onClick={() => navigate('/create-course')} className="btn-success">Create New Course</button>
      </div>

      {error && <p className="error">{error}</p>}

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
        {courses.length === 0 ? (
          <div className="card" style={{gridColumn: '1 / -1', textAlign: 'center'}}>
            <p>You haven't created any courses yet.</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="card">
              <h3 style={{color: '#667eea'}}>{course.title}</h3>
              <p>{course.description}</p>
              <p>Price: <span style={{color: '#4ecdc4', fontWeight: 'bold'}}>${course.price}</span></p>
              <p>Status: <span style={{color: course.published ? '#4ecdc4' : '#ff6b6b', fontWeight: 'bold'}}>{course.published ? 'Published' : 'Draft'}</span></p>
              <button onClick={() => handleManageCourse(course.id)} className="btn-primary">Manage Course</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ManageCourses;