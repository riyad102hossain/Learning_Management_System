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

  const courseIcons = ['📚', '💻', '🎨', '🚀', '🔬', '📊', '🎓', '💡'];
  
  const getRandomIcon = (courseId) => {
    return courseIcons[courseId % courseIcons.length];
  };

  return (
    <div className="page-container">
      <div style={{marginBottom: '40px', textAlign: 'center'}}>
        <h1 style={{fontSize: '3em', margin: '0 0 15px 0', color: '#333'}}>📚 My Courses</h1>
        <p style={{fontSize: '1.3em', color: '#4ecdc4', margin: '10px 0', fontWeight: '600'}}>All courses are completely FREE! 🎉</p>
        <p style={{color: '#666', fontSize: '1em'}}>Explore and learn from our collection of high-quality courses</p>
      </div>

      {error && <div style={{padding: '15px', background: '#ff6b6b', color: 'white', borderRadius: '10px', marginBottom: '20px'}}>{error}</div>}

      {courses.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(69, 183, 209, 0.1))',
          borderRadius: '20px',
          border: '2px dashed #4ecdc4'
        }}>
          <div style={{fontSize: '4em', marginBottom: '20px'}}>📭</div>
          <p style={{fontSize: '1.3em', color: '#666'}}>No courses available yet.</p>
          <p style={{color: '#999'}}>Check back soon for exciting new courses!</p>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px'}}>
          {courses.map((course, index) => (
            <div 
              key={course.id}
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'white',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                transition: 'all 0.3s ease',
                transform: 'translateY(0)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.12)';
              }}
            >
              {/* Course Header */}
              <div style={{
                background: `linear-gradient(135deg, ${index % 2 === 0 ? '#667eea' : '#764ba2'} 0%, ${index % 2 === 0 ? '#764ba2' : '#f093fb'} 100%)`,
                padding: '30px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{color: 'white', margin: '0', fontSize: '1.4em', lineHeight: '1.3'}}>{course.title}</h3>
                </div>
                <div style={{fontSize: '3em'}}>{getRandomIcon(course.id)}</div>
              </div>

              {/* Course Content */}
              <div style={{padding: '25px'}}>
                <p style={{color: '#666', lineHeight: '1.6', marginTop: 0, marginBottom: '15px', minHeight: '50px'}}>
                  {course.description}
                </p>

                {/* Course Stats */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                  <div style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    padding: '12px',
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{fontSize: '1.5em', color: '#667eea', fontWeight: 'bold'}}>FREE</div>
                    <div style={{fontSize: '0.85em', color: '#666'}}>Price</div>
                  </div>
                  <div style={{
                    background: 'rgba(78, 205, 196, 0.1)',
                    padding: '12px',
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{fontSize: '1.5em', color: '#4ecdc4', fontWeight: 'bold'}}>✓</div>
                    <div style={{fontSize: '0.85em', color: '#666'}}>Published</div>
                  </div>
                </div>

                {/* Instructor */}
                <div style={{
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  borderLeft: '4px solid #667eea'
                }}>
                  <div style={{fontSize: '0.85em', color: '#999', marginBottom: '4px'}}>Instructor</div>
                  <div style={{color: '#667eea', fontWeight: '600'}}>{course.instructor_email}</div>
                </div>

                {/* View Button */}
                <button 
                  onClick={() => navigate(`/courses/${course.id}`)}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1em',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.02)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  Explore Course →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;