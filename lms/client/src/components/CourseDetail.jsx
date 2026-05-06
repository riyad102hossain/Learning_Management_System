import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../api';
import LessonViewer from './LessonViewer';

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const [courseRes, contentsRes] = await Promise.all([
          axios.get(`${API_BASE}/courses/${id}`),
          axios.get(`${API_BASE}/courses/${id}/contents`)
        ]);
        setCourse(courseRes.data);
        setContents(contentsRes.data.modules || []);
      } catch (err) {
        setError('Failed to load course details');
      }
    };

    fetchCourse();
  }, [id]);

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
  };

  const handleLessonComplete = async (lessonId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      // For free courses, allow marking as complete without login
      // Just show a visual indication
      setCompletedLessons(prev => new Set([...prev, lessonId]));
      alert('Lesson completed! (Note: Progress is not saved without an account)');
      return;
    }

    try {
      await axios.post(`${API_BASE}/lessons/${lessonId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompletedLessons(prev => new Set([...prev, lessonId]));
      alert('Lesson marked as complete!');
    } catch (err) {
      alert('Failed to mark lesson as complete');
    }
  };

  if (!course) return <div className="page-container"><div style={{textAlign: 'center', fontSize: '1.5em'}}>Loading...</div></div>;

  return (
    <div className="page-container" style={{maxWidth: '1400px'}}>
      <div className="card" style={{marginBottom: '30px'}}>
        <h2 className="page-title" style={{marginBottom: '10px'}}>{course.title}</h2>
        <p style={{fontSize: '1.1em'}}>{course.description}</p>
        <p><strong style={{color: '#4ecdc4'}}>Price: FREE</strong></p>
        <p><strong>Instructor:</strong> <span style={{color: '#667eea'}}>{course.instructor_email}</span></p>
        <p><strong>Status:</strong> <span style={{color: course.published ? '#4ecdc4' : '#ff6b6b'}}>{course.published ? 'Published' : 'Draft'}</span></p>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Course Content Sidebar */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{color: '#667eea', marginBottom: '20px'}}>Course Contents</h3>
          {contents.length === 0 ? (
            <div className="card">
              <p>This course has no content yet.</p>
            </div>
          ) : (
            contents.map(module => (
              <div key={module.id} className="card" style={{marginBottom: '20px'}}>
                <h4 style={{marginTop: 0, color: '#ff6b6b'}}>{module.title}</h4>
                {module.description && <p style={{ fontSize: '14px', color: '#666' }}>{module.description}</p>}
                <div>
                  {module.lessons && module.lessons.length > 0 ? (
                    module.lessons.map(lesson => (
                      <div
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        style={{
                          marginLeft: '10px',
                          marginBottom: '8px',
                          padding: '10px',
                          backgroundColor: selectedLesson?.id === lesson.id ? '#e3f2fd' : 'rgba(255, 255, 255, 0.8)',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <span>{lesson.title}</span>
                        {completedLessons.has(lesson.id) && (
                          <span style={{ color: '#4ecdc4', fontWeight: 'bold', fontSize: '1.2em' }}>✓</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ marginLeft: '10px', fontStyle: 'italic', color: '#999' }}>No lessons in this module yet.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Lesson Viewer */}
        <div style={{ flex: '2', minWidth: '400px' }}>
          {selectedLesson ? (
            <div className="card">
              <h3 style={{color: '#667eea'}}>Lesson Content</h3>
              <LessonViewer
                lesson={selectedLesson}
                onComplete={handleLessonComplete}
              />
            </div>
          ) : (
            <div className="card" style={{
              padding: '60px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(78, 205, 196, 0.1))',
              border: '2px dashed #4ecdc4',
            }}>
              <h3 style={{color: '#667eea'}}>Select a lesson to start learning</h3>
              <p>Click on any lesson from the course contents to view its content.</p>
            </div>
          )}
        </div>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default CourseDetail;