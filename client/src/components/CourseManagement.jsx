import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../api';

function CourseManagement() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [newModule, setNewModule] = useState({ title: '', description: '', position: 0 });
  const [newLesson, setNewLesson] = useState({
    moduleId: '',
    title: '',
    content: '',
    mediaType: '',
    mediaUrl: '',
    durationSeconds: 0,
    position: 0,
    required: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchCourse = async () => {
      try {
        const [courseRes, modulesRes] = await Promise.all([
          axios.get(`${API_BASE}/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/courses/${courseId}/contents`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCourse(courseRes.data);
        setModules(modulesRes.data.modules || []);
      } catch (err) {
        setError('Failed to load course');
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

  const handleCreateModule = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${API_BASE}/courses/${courseId}/modules`, newModule, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModules([...modules, response.data]);
      setNewModule({ title: '', description: '', position: 0 });
      setSuccess('Module created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create module');
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${API_BASE}/modules/${newLesson.moduleId}/lessons`, {
        title: newLesson.title,
        content: newLesson.content,
        mediaType: newLesson.mediaType,
        mediaUrl: newLesson.mediaUrl,
        durationSeconds: newLesson.durationSeconds,
        position: newLesson.position,
        required: newLesson.required
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update the modules state to include the new lesson
      setModules(modules.map(module =>
        module.id === parseInt(newLesson.moduleId)
          ? { ...module, lessons: [...(module.lessons || []), response.data] }
          : module
      ));
      setNewLesson({
        moduleId: '',
        title: '',
        content: '',
        mediaType: '',
        mediaUrl: '',
        durationSeconds: 0,
        position: 0,
        required: true
      });
      setSuccess('Lesson created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create lesson');
    }
  };

  if (!course) return <div className="page-container"><div style={{textAlign: 'center', fontSize: '1.5em'}}>Loading...</div></div>;

  return (
    <div className="page-container">
      <h2 className="page-title">Manage Course: {course.title}</h2>
      <button onClick={() => navigate('/courses')} className="btn-secondary" style={{marginBottom: '30px'}}>Back to Courses</button>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px'}}>
        <div className="card">
          <h3 style={{color: '#667eea'}}>Add New Module</h3>
          <form onSubmit={handleCreateModule}>
            <input
              type="text"
              placeholder="Module Title"
              value={newModule.title}
              onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Module Description"
              value={newModule.description}
              onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
              rows="2"
            />
            <input
              type="number"
              placeholder="Position"
              value={newModule.position}
              onChange={(e) => setNewModule({ ...newModule, position: parseInt(e.target.value) || 0 })}
            />
            <button type="submit" className="btn-success">Create Module</button>
          </form>
        </div>

        <div className="card">
          <h3 style={{color: '#667eea'}}>Add New Lesson</h3>
          <form onSubmit={handleCreateLesson}>
            <select
              value={newLesson.moduleId}
              onChange={(e) => setNewLesson({ ...newLesson, moduleId: e.target.value })}
              required
            >
              <option value="">Select Module</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>{module.title}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Lesson Title"
              value={newLesson.title}
              onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Lesson Content"
              value={newLesson.content}
              onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
              rows="3"
            />
            <select
              value={newLesson.mediaType}
              onChange={(e) => setNewLesson({ ...newLesson, mediaType: e.target.value })}
            >
              <option value="">Select Media Type</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="pdf">PDF</option>
              <option value="text">Text</option>
            </select>
            <input
              type="text"
              placeholder="Media URL"
              value={newLesson.mediaUrl}
              onChange={(e) => setNewLesson({ ...newLesson, mediaUrl: e.target.value })}
            />
            <input
              type="number"
              placeholder="Duration (seconds)"
              value={newLesson.durationSeconds}
              onChange={(e) => setNewLesson({ ...newLesson, durationSeconds: parseInt(e.target.value) || 0 })}
            />
            <input
              type="number"
              placeholder="Position"
              value={newLesson.position}
              onChange={(e) => setNewLesson({ ...newLesson, position: parseInt(e.target.value) || 0 })}
            />
            <label style={{display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 0'}}>
              <input
                type="checkbox"
                checked={newLesson.required}
                onChange={(e) => setNewLesson({ ...newLesson, required: e.target.checked })}
              />
              <span>Required</span>
            </label>
            <button type="submit" className="btn-primary">Create Lesson</button>
          </form>
        </div>
      </div>

      <div className="card" style={{marginTop: '30px'}}>
        <h3 style={{color: '#667eea'}}>Current Modules & Lessons</h3>
        {modules.length === 0 ? (
          <p>No modules created yet.</p>
        ) : (
          modules.map(module => (
            <div key={module.id} style={{border: '2px solid #ddd', borderRadius: '10px', padding: '15px', margin: '15px 0', background: 'rgba(255, 255, 255, 0.8)'}}>
              <h4 style={{color: '#ff6b6b'}}>{module.title}</h4>
              <p>{module.description}</p>
              <div>
                <strong>Lessons:</strong>
                {module.lessons && module.lessons.length > 0 ? (
                  <ul style={{paddingLeft: '20px'}}>
                    {module.lessons.map(lesson => (
                      <li key={lesson.id} style={{margin: '5px 0'}}>
                        {lesson.title} <span style={{color: '#4ecdc4'}}>({lesson.media_type || 'text'})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{fontStyle: 'italic', color: '#999'}}>No lessons yet</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CourseManagement;