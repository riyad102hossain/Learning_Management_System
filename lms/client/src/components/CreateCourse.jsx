import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../api';

function CreateCourse() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    published: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/courses`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Course created successfully!');
      setTimeout(() => navigate(`/manage-course/${response.data.id}`), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course');
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Create New Course</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Course Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="slug"
          placeholder="Course Slug (URL-friendly)"
          value={formData.slug}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Course Description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
        />
        <label style={{display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 0'}}>
          <input
            type="checkbox"
            name="published"
            checked={formData.published}
            onChange={handleChange}
          />
          <span>Publish Course</span>
        </label>
        <button type="submit" className="btn-success">Create Course</button>
      </form>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default CreateCourse;