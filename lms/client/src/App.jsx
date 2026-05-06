import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Courses from './components/Courses'
import CourseDetail from './components/CourseDetail'
import CreateCourse from './components/CreateCourse'
import CourseManagement from './components/CourseManagement'
import ManageCourses from './components/ManageCourses'
import './App.css'

function App() {
  return (
    <div className="App">
      <Router>
        <nav className="nav">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/courses">Courses</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/manage-courses" element={<ManageCourses />} />
          <Route path="/manage-course/:courseId" element={<CourseManagement />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
