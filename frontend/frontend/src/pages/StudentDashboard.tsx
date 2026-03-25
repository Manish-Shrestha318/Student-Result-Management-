import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>EduSystem</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard/student" className="nav-item active">Dashboard</Link>
          <Link to="#" className="nav-item">Grades</Link>
          <Link to="#" className="nav-item">Attendance</Link>
          <Link to="#" className="nav-item">Schedule</Link>
          <Link to="#" className="nav-item">Assignments</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">Log Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <h1>Student Dashboard</h1>
          <div className="user-profile">
            <div className="avatar">JD</div>
            <span>John Doe</span>
          </div>
        </header>

        <section className="dashboard-content">
          {/* Welcome Card */}
          <div className="card welcome-card">
            <h2>Welcome back, John!</h2>
            <p>You have 2 pending assignments and your next class starts in 30 minutes.</p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Current GPA</h3>
              <p className="stat-value">3.8</p>
            </div>
            <div className="stat-card">
              <h3>Attendance</h3>
              <p className="stat-value">95%</p>
            </div>
            <div className="stat-card">
              <h3>Assignments Due</h3>
              <p className="stat-value">2</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card recent-activity">
            <h3>Upcoming Classes</h3>
            <ul className="activity-list">
              <li>
                <div className="activity-time">09:00 AM</div>
                <div className="activity-details">
                  <h4>Mathematics 101</h4>
                  <p>Room 302, Ms. Smith</p>
                </div>
              </li>
              <li>
                <div className="activity-time">11:00 AM</div>
                <div className="activity-details">
                  <h4>Physics</h4>
                  <p>Lab 2, Mr. Johnson</p>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
