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
  const [courseProgress, setCourseProgress] = useState({ completed_lessons: 0, total_lessons: 0, progress_percent: 0 });
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

    const fetchProgress = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get(`${API_BASE}/courses/${id}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourseProgress(response.data);
      } catch (err) {
        console.warn('Unable to load course progress:', err.response?.data?.error || err.message);
      }
    };

    fetchCourse();
    fetchProgress();
  }, [id]);

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
  };

  const handleLessonComplete = async (lessonId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCompletedLessons(prev => new Set([...prev, lessonId]));
      alert('Lesson completed! (Note: Progress is not saved without an account)');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/lessons/${lessonId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompletedLessons(prev => new Set([...prev, lessonId]));
      setCourseProgress(prev => ({
        ...prev,
        completed_lessons: response.data.completedLessons,
        total_lessons: response.data.totalLessons,
        progress_percent: response.data.progressPercent
      }));
      alert('Lesson marked as complete!');
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to mark lesson as complete';
      setError(message);
      alert(message);
    }
  };

  if (!course) {
    return (
      <div className="page-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '3em', marginBottom: '20px'}}>⏳</div>
          <p style={{fontSize: '1.3em', color: '#667eea'}}>Loading course...</p>
        </div>
      </div>
    );
  }

  // Calculate course stats
  const computedTotalLessons = contents.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
  const totalLessons = courseProgress.total_lessons > 0 ? courseProgress.total_lessons : computedTotalLessons;
  const completedLessonsCount = courseProgress.total_lessons > 0 ? courseProgress.completed_lessons : completedLessons.size;
  const completionPercentage = courseProgress.total_lessons > 0
    ? courseProgress.progress_percent
    : totalLessons > 0
      ? Math.round((completedLessons.size / totalLessons) * 100)
      : 0;

  return (
    <div className="page-container" style={{padding: '0'}}>
      {/* Course Header Banner */}
      <div style={{
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        padding: '50px 40px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{position: 'absolute', top: '20px', right: '30px', fontSize: '4em', opacity: 0.2}}>📚</div>
        
        <button 
          onClick={() => navigate('/courses')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '0.95em',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
            e.target.style.transform = 'translateX(-5px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
            e.target.style.transform = 'translateX(0)';
          }}
        >
          ← Back to Courses
        </button>

        <h1 style={{fontSize: '2.5em', margin: '20px 0 10px 0', fontWeight: 'bold'}}>{course.title}</h1>
        <p style={{fontSize: '1.1em', margin: '0 0 20px 0', opacity: 0.95}}>{course.description}</p>

        {/* Course Meta Info */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginTop: '30px'}}>
          <div style={{background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px', backdropFilter: 'blur(10px)'}}>
            <div style={{fontSize: '1.5em', fontWeight: 'bold', marginBottom: '5px'}}>{totalLessons}</div>
            <div style={{fontSize: '0.9em', opacity: 0.9}}>Total Lessons</div>
          </div>
          <div style={{background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px', backdropFilter: 'blur(10px)'}}>
            <div style={{fontSize: '1.5em', fontWeight: 'bold', marginBottom: '5px'}}>{contents.length}</div>
            <div style={{fontSize: '0.9em', opacity: 0.9}}>Modules</div>
          </div>
          <div style={{background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px', backdropFilter: 'blur(10px)'}}>
            <div style={{fontSize: '1.5em', fontWeight: 'bold', marginBottom: '5px'}}>FREE</div>
            <div style={{fontSize: '0.9em', opacity: 0.9}}>Price</div>
          </div>
          <div style={{background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px', backdropFilter: 'blur(10px)'}}>
            <div style={{fontSize: '1.5em', fontWeight: 'bold', marginBottom: '5px'}}>{course.published ? '✓ Live' : 'Draft'}</div>
            <div style={{fontSize: '0.9em', opacity: 0.9}}>Status</div>
          </div>
        </div>

        {/* Progress Section */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'center', marginTop: '30px'}}>
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '10px', flexWrap: 'wrap'}}>
              <div>
                <div style={{fontSize: '0.95em', opacity: 0.9, marginBottom: '5px'}}>Your Progress</div>
                <div style={{fontSize: '2.8em', fontWeight: '800'}}>{completionPercentage}%</div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '0.95em', opacity: 0.9}}>Completed</div>
                <div style={{fontSize: '1.2em', fontWeight: '700'}}>{completedLessonsCount} / {totalLessons}</div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.18)',
              borderRadius: '999px',
              height: '12px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #4ecdc4, #45b7d1)',
                height: '100%',
                width: `${completionPercentage}%`,
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          <div style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.12)'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `conic-gradient(rgba(78, 205, 196, 0.95) 0% ${completionPercentage}%, rgba(255,255,255,0.15) ${completionPercentage}% 100%)`
            }} />
            <div style={{
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              zIndex: 1,
              padding: '10px'
            }}>
              <div style={{fontSize: '1.85em', fontWeight: '800', color: '#333'}}>{completionPercentage}%</div>
              <div style={{fontSize: '0.95em', color: '#667eea', marginTop: '4px'}}>Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructor Info */}
      <div style={{padding: '25px 40px', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(78, 205, 196, 0.05))', borderBottom: '1px solid rgba(0,0,0,0.05)'}}>
        <p style={{margin: 0, color: '#666'}}>
          <strong style={{color: '#667eea'}}>👨‍🏫 Instructor: </strong>
          <span style={{color: '#667eea'}}>{course.instructor_email}</span>
        </p>
      </div>

      {/* Main Content Area */}
      <div style={{padding: '40px', display: 'flex', gap: '30px', minHeight: 'calc(100vh - 450px)'}}>
        {/* Sidebar - Course Contents */}
        <div style={{flex: '0 0 350px', maxHeight: 'calc(100vh - 500px)', overflowY: 'auto'}}>
          <h3 style={{color: '#667eea', marginBottom: '25px', fontSize: '1.3em', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span>📖</span> Course Modules
          </h3>

          {contents.length === 0 ? (
            <div style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(78, 205, 196, 0.1))',
              padding: '30px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '2px dashed #4ecdc4'
            }}>
              <p style={{color: '#666', margin: 0}}>This course has no content yet.</p>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              {contents.map((module, moduleIndex) => (
                <div 
                  key={module.id}
                  style={{
                    border: '2px solid #e5e4e7',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e4e7';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    background: `linear-gradient(135deg, ${moduleIndex % 2 === 0 ? '#667eea' : '#764ba2'} 0%, ${moduleIndex % 2 === 0 ? '#764ba2' : '#f093fb'} 100%)`,
                    padding: '15px',
                    color: 'white'
                  }}>
                    <h4 style={{margin: '0', fontSize: '1.05em'}}>{module.title}</h4>
                    <p style={{margin: '5px 0 0 0', fontSize: '0.85em', opacity: 0.9}}>
                      {module.lessons?.length || 0} lesson{(module.lessons?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div style={{padding: '12px'}}>
                    {module.description && (
                      <p style={{fontSize: '0.85em', color: '#666', margin: '0 0 10px 0', fontStyle: 'italic'}}>
                        {module.description}
                      </p>
                    )}
                    {module.lessons && module.lessons.length > 0 ? (
                      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {module.lessons.map(lesson => (
                          <div
                            key={lesson.id}
                            onClick={() => handleLessonClick(lesson)}
                            style={{
                              padding: '10px 12px',
                              backgroundColor: selectedLesson?.id === lesson.id 
                                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(78, 205, 196, 0.15))'
                                : 'rgba(245, 245, 245, 1)',
                              borderLeft: selectedLesson?.id === lesson.id ? '4px solid #667eea' : '4px solid transparent',
                              border: selectedLesson?.id === lesson.id ? '1px solid #667eea' : '1px solid #e5e4e7',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.2s ease',
                              fontSize: '0.9em'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedLesson?.id !== lesson.id) {
                                e.currentTarget.style.background = 'rgba(245, 245, 245, 0.8)';
                                e.currentTarget.style.borderColor = '#ddd';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedLesson?.id !== lesson.id) {
                                e.currentTarget.style.background = 'rgba(245, 245, 245, 1)';
                                e.currentTarget.style.borderColor = '#e5e4e7';
                              }
                            }}
                          >
                            <span style={{color: '#333', fontWeight: selectedLesson?.id === lesson.id ? '600' : '500'}}>
                              {completedLessons.has(lesson.id) ? '✓ ' : ''}
                              {lesson.title}
                            </span>
                            {completedLessons.has(lesson.id) && (
                              <span style={{color: '#4ecdc4', fontSize: '1.1em', fontWeight: 'bold'}}>●</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{margin: 0, fontStyle: 'italic', color: '#999', fontSize: '0.9em'}}>No lessons in this module yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content - Lesson Viewer */}
        <div style={{flex: 1, minWidth: 0}}>
          {selectedLesson ? (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              height: 'fit-content'
            }}>
              <h2 style={{color: '#667eea', marginTop: 0, marginBottom: '10px', fontSize: '1.8em'}}>
                {selectedLesson.title}
              </h2>
              <p style={{color: '#666', fontSize: '0.95em', marginBottom: '25px'}}>
                {selectedLesson.description || 'Start learning this lesson'}
              </p>
              <LessonViewer
                lesson={selectedLesson}
                onComplete={handleLessonComplete}
              />
              <div style={{marginTop: '25px', padding: '20px', background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(102, 126, 234, 0.1))', borderRadius: '10px', border: '1px solid rgba(78, 205, 196, 0.3)'}}>
                <button 
                  onClick={() => handleLessonComplete(selectedLesson.id)}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: `linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%)`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1em',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {completedLessons.has(selectedLesson.id) ? '✓ Completed' : 'Mark as Complete'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '80px 40px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(78, 205, 196, 0.05))',
              border: '2px dashed #667eea',
              borderRadius: '16px',
              height: 'fit-content'
            }}>
              <div style={{fontSize: '5em', marginBottom: '20px'}}>👈</div>
              <h3 style={{color: '#667eea', fontSize: '1.5em', margin: '0 0 10px 0'}}>Select a Lesson to Start</h3>
              <p style={{color: '#666', margin: 0, fontSize: '1.05em'}}>Choose any lesson from the course modules on the left to begin learning</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          padding: '15px 40px',
          background: '#ff6b6b',
          color: 'white',
          textAlign: 'center',
          borderRadius: '10px',
          marginTop: '20px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default CourseDetail;