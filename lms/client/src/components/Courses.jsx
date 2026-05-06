import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../api';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE}/courses`);
        setCourses(response.data);
      } catch (err) {
        setError('Failed to load courses');
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="page-container">
      <h2 className="page-title">Available Courses</h2>
      <p style={{textAlign: 'center', fontSize: '1.2em', color: '#4ecdc4'}}>All courses are completely FREE! 🎉</p>
      {error && <p className="error">{error}</p>}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
        {courses.length === 0 ? (
          <div className="card" style={{gridColumn: '1 / -1', textAlign: 'center'}}>
            <p>No courses available yet.</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="card">
              <h3 style={{color: '#667eea'}}>{course.title}</h3>
              <p>{course.description}</p>
              <p><strong style={{color: '#4ecdc4'}}>Price: FREE</strong></p>
              <p><em>Instructor: {course.instructor_email}</em></p>
              <button onClick={() => navigate(`/courses/${course.id}`)} className="btn-primary">View Course</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Courses;