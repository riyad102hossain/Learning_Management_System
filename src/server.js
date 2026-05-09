require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET || 'change_this_secret';

app.use(cors());
app.use(express.json());

const notFound = (res) => res.status(404).json({ error: 'Not found' });

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.post('/auth/register', async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [role]);
    if (roleResult.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const roleId = roleResult.rows[0].id;
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role_id`,
      [email, passwordHash, firstName || null, lastName || null, roleId]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role }, jwtSecret, { expiresIn: '12h' });
    res.status(201).json({ token, user });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const result = await pool.query(
      `SELECT u.id, u.password_hash, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email, role: user.role }, jwtSecret, { expiresIn: '12h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, slug, description, instructor_id, price, published FROM courses WHERE published = true ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch courses' });
  }
});

app.get('/courses/:courseId', async (req, res) => {
  const { courseId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (result.rowCount === 0) return notFound(res);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch course' });
  }
});

app.get('/my-courses', authMiddleware, requireRole('Instructor', 'Admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, slug, description, instructor_id, price, published FROM courses WHERE instructor_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch courses' });
  }
});

app.post('/courses', authMiddleware, requireRole('Instructor', 'Admin'), async (req, res) => {
  const { title, slug, description, published } = req.body;
  if (!title || !slug) {
    return res.status(400).json({ error: 'Title and slug are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO courses (title, slug, description, instructor_id, price, published)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, slug, description || null, req.user.id, 0, published || false] // All courses are FREE
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create course' });
  }
});

app.post('/courses/:courseId/modules', authMiddleware, requireRole('Instructor', 'Admin'), async (req, res) => {
  const { courseId } = req.params;
  const { title, description, position } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    // Check if user owns the course
    const courseCheck = await pool.query('SELECT id FROM courses WHERE id = $1 AND instructor_id = $2', [courseId, req.user.id]);
    if (courseCheck.rowCount === 0 && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `INSERT INTO modules (course_id, title, description, position)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [courseId, title, description || null, position || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create module' });
  }
});

app.post('/modules/:moduleId/lessons', authMiddleware, requireRole('Instructor', 'Admin'), async (req, res) => {
  const { moduleId } = req.params;
  const { title, content, mediaType, mediaUrl, durationSeconds, position, required } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    // Check if user owns the course containing this module
    const moduleCheck = await pool.query(
      `SELECT m.id FROM modules m
       JOIN courses c ON m.course_id = c.id
       WHERE m.id = $1 AND (c.instructor_id = $2 OR $3 = 'Admin')`,
      [moduleId, req.user.id, req.user.role]
    );
    if (moduleCheck.rowCount === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `INSERT INTO lessons (module_id, title, content, media_type, media_url, duration_seconds, position, required)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [moduleId, title, content || null, mediaType || null, mediaUrl || null, durationSeconds || 0, position || 0, required !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create lesson' });
  }
});

app.post('/courses/:courseId/enroll', authMiddleware, async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await pool.query('SELECT id FROM courses WHERE id = $1 AND published = true', [courseId]);
    if (course.rowCount === 0) {
      return res.status(404).json({ error: 'Course not found or not published' });
    }
    const enrolled = await pool.query(
      `INSERT INTO enrollments (student_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (student_id, course_id) DO NOTHING
       RETURNING *`,
      [req.user.id, courseId]
    );
    if (enrolled.rowCount === 0) {
      return res.status(200).json({ message: 'Already enrolled' });
    }
    res.status(201).json(enrolled.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Enrollment failed' });
  }
});

app.get('/courses/:courseId/contents', async (req, res) => {
  const { courseId } = req.params;
  try {
    const modules = await pool.query(
      `SELECT m.id, m.title, m.position, m.description,
        jsonb_agg(jsonb_build_object(
          'id', l.id,
          'title', l.title,
          'position', l.position,
          'media_type', l.media_type,
          'media_url', l.media_url,
          'duration_seconds', l.duration_seconds,
          'content', l.content
        ) ORDER BY l.position) AS lessons
       FROM modules m
       LEFT JOIN lessons l ON l.module_id = m.id
       WHERE m.course_id = $1
       GROUP BY m.id
       ORDER BY m.position`,
      [courseId]
    );
    res.json({ modules: modules.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch course contents' });
  }
});

app.post('/lessons/:lessonId/complete', authMiddleware, requireRole('Student'), async (req, res) => {
  const { lessonId } = req.params;
  const completedAt = new Date();
  try {
    const lessonResult = await pool.query('SELECT l.module_id, m.course_id FROM lessons l JOIN modules m ON l.module_id = m.id WHERE l.id = $1', [lessonId]);
    if (lessonResult.rowCount === 0) return notFound(res);
    const { course_id } = lessonResult.rows[0];

    await pool.query(
      `INSERT INTO lesson_progress (student_id, lesson_id, completed_at, progress_percent)
       VALUES ($1, $2, $3, 100)
       ON CONFLICT (student_id, lesson_id)
       DO UPDATE SET completed_at = EXCLUDED.completed_at, progress_percent = EXCLUDED.progress_percent`,
      [req.user.id, lessonId, completedAt]
    );

    const total = await pool.query('SELECT COUNT(*) AS count FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id = $1)', [course_id]);
    const completed = await pool.query(
      `SELECT COUNT(*) AS count FROM lesson_progress WHERE student_id = $1 AND lesson_id IN (
         SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = $2
       )`,
      [req.user.id, course_id]
    );
    const totalLessons = Number(total.rows[0].count);
    const completedLessons = Number(completed.rows[0].count);
    const progressPercent = totalLessons === 0 ? 0 : Math.floor((completedLessons / totalLessons) * 100);

    await pool.query(
      `INSERT INTO course_progress (student_id, course_id, completed_lessons, total_lessons, progress_percent, updated_at)
       VALUES ($1, $2, $3, $4, $5, now())
       ON CONFLICT (student_id, course_id)
       DO UPDATE SET completed_lessons = EXCLUDED.completed_lessons,
                     total_lessons = EXCLUDED.total_lessons,
                     progress_percent = EXCLUDED.progress_percent,
                     updated_at = EXCLUDED.updated_at`,
      [req.user.id, course_id, completedLessons, totalLessons, progressPercent]
    );

    res.json({ courseId: course_id, completedLessons, totalLessons, progressPercent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to update progress' });
  }
});

app.get('/lessons/:lessonId/media-url', async (req, res) => {
  const { lessonId } = req.params;
  try {
    const result = await pool.query(
      `SELECT l.media_url, l.media_type, l.content
       FROM lessons l
       WHERE l.id = $1`,
      [lessonId]
    );
    if (result.rowCount === 0) return notFound(res);
    const { media_url, media_type, content } = result.rows[0];
    res.json({ media_url, media_type, content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to resolve media URL' });
  }
});

app.get('/courses/:courseId/progress', authMiddleware, async (req, res) => {
  const { courseId } = req.params;
  try {
    const result = await pool.query(
      `SELECT course_id, completed_lessons, total_lessons, progress_percent, updated_at
       FROM course_progress
       WHERE student_id = $1 AND course_id = $2`,
      [req.user.id, courseId]
    );
    if (result.rowCount === 0) return res.json({ courseId, completed_lessons: 0, total_lessons: 0, progress_percent: 0 });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch progress' });
  }
});

app.use((req, res) => {
  notFound(res);
});

app.listen(port, () => {
  console.log(`LMS server listening on port ${port}`);
  console.log('Hot reload is enabled! 🚀');
});
