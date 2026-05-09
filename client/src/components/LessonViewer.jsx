import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../api';

function LessonViewer({ lesson, onComplete }) {
  const [mediaData, setMediaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lesson && lesson.media_url) {
      fetchMediaData();
    }
  }, [lesson]);

  const fetchMediaData = async () => {
    if (!lesson.media_url) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/lessons/${lesson.id}/media-url`);
      setMediaData(response.data);
    } catch (err) {
      setError('Failed to load media content');
    } finally {
      setLoading(false);
    }
  };

  const renderMediaContent = () => {
    if (!mediaData) return null;

    const { media_url, media_type, content } = mediaData;

    // Handle YouTube URLs
    const getYouTubeEmbedUrl = (url) => {
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(youtubeRegex);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
      return url;
    };

    switch (media_type?.toLowerCase()) {
      case 'video':
        if (media_url.includes('youtube.com') || media_url.includes('youtu.be')) {
          // YouTube video
          const embedUrl = getYouTubeEmbedUrl(media_url);
          return (
            <div className="media-container" style={{textAlign: 'center', margin: '20px 0'}}>
              <iframe
                width="100%"
                height="400"
                src={embedUrl}
                title={`YouTube video: ${lesson.title}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ maxWidth: '800px', borderRadius: '15px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }}
              ></iframe>
            </div>
          );
        } else {
          // Regular video file
          return (
            <div className="media-container" style={{textAlign: 'center', margin: '20px 0'}}>
              <video
                controls
                width="100%"
                height="400"
                style={{ maxWidth: '800px', borderRadius: '15px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }}
                onEnded={() => onComplete && onComplete(lesson.id)}
              >
                <source src={media_url} type="video/mp4" />
                <source src={media_url} type="video/webm" />
                <source src={media_url} type="video/ogg" />
                Your browser does not support the video tag.
              </video>
            </div>
          );
        }

      case 'audio':
        return (
          <div className="media-container" style={{textAlign: 'center', margin: '20px 0'}}>
            <audio
              controls
              style={{ width: '100%', maxWidth: '600px', borderRadius: '25px' }}
              onEnded={() => onComplete && onComplete(lesson.id)}
            >
              <source src={media_url} type="audio/mpeg" />
              <source src={media_url} type="audio/wav" />
              <source src={media_url} type="audio/ogg" />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      case 'pdf':
        return (
          <div className="media-container" style={{textAlign: 'center', margin: '20px 0'}}>
            <iframe
              src={media_url}
              width="100%"
              height="600"
              style={{ border: '2px solid #4ecdc4', maxWidth: '800px', borderRadius: '15px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }}
              title={`PDF: ${lesson.title}`}
            >
              <p>Your browser does not support iframes.
                <a href={media_url} target="_blank" rel="noopener noreferrer" style={{color: '#667eea'}}>Click here to view the PDF</a>
              </p>
            </iframe>
          </div>
        );

      case 'text':
      default:
        return (
          <div className="media-container" style={{margin: '20px 0'}}>
            <div style={{
              padding: '25px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(102, 126, 234, 0.1))',
              border: '2px solid #667eea',
              borderRadius: '15px',
              maxWidth: '800px',
              whiteSpace: 'pre-wrap',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              lineHeight: '1.6'
            }}>
              {content || 'No content available for this lesson.'}
            </div>
          </div>
        );
    }
  };

  if (!lesson) return null;

  return (
    <div className="lesson-viewer" style={{ marginBottom: '20px' }}>
      <h4 style={{color: '#667eea', marginBottom: '15px'}}>{lesson.title}</h4>

      {lesson.content && (
        <div style={{ marginBottom: '15px', padding: '15px', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(78, 205, 196, 0.1))', borderRadius: '10px', border: '1px solid #4ecdc4' }}>
          <p style={{lineHeight: '1.6'}}>{lesson.content}</p>
        </div>
      )}

      {lesson.media_type && (
        <div style={{ marginBottom: '10px' }}>
          <small style={{ color: '#666', fontWeight: 'bold' }}>
            Media Type: <span style={{color: '#ff6b6b'}}>{lesson.media_type}</span>
            {lesson.duration_seconds && ` | Duration: ${Math.floor(lesson.duration_seconds / 60)}:${(lesson.duration_seconds % 60).toString().padStart(2, '0')}`}
          </small>
        </div>
      )}

      {loading && <p style={{textAlign: 'center', color: '#667eea'}}>Loading media content...</p>}
      {error && <p className="error">{error}</p>}

      {lesson.media_url && renderMediaContent()}

      {onComplete && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => onComplete(lesson.id)}
            className="btn-success"
          >
            Mark as Complete
          </button>
        </div>
      )}
    </div>
  );
}

export default LessonViewer;