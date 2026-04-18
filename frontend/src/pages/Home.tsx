import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import './Home.css';

const features = [
  { title: 'Real-Time Results',    desc: 'Publish and access academic results instantly. Students and parents are always in the loop as soon as marks are entered.' },
  { title: 'Attendance Tracking',  desc: 'Mark and monitor attendance every day. Get automatic low-attendance alerts before it becomes a problem.' },
  { title: 'Notice Board',         desc: 'Share school-wide announcements, events, and critical notices with all roles in a single click.' },
  { title: 'Analytics Dashboard',  desc: 'Visualise class averages, subject-wise pass rates, and individual student performance trends at a glance.' },
  { title: 'Messaging System',     desc: 'Built-in real-time chat between teachers, students, and parents powered by Socket.io.' },
  { title: 'Secure & Private',     desc: 'Role-based access control with JWT authentication ensures each user sees only what they need to.' },
];

const Home: React.FC = () => {
  return (
    <div className="home-page">

      {/* ── Navbar ── */}
      <nav className="home-nav">
        <Container className="d-flex justify-content-between align-items-center">
          <div className="home-logo">Smart<span>Results</span></div>

          <div className="d-none d-lg-flex gap-4 align-items-center">
            <a href="#features" className="home-nav-link">Features</a>
            <a href="#about"    className="home-nav-link">About</a>
            <a href="#contact"  className="home-nav-link">Contact</a>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link to="/login"    className="home-btn-login">Log In</Link>
            <Link to="/register" className="home-btn-signup">Sign Up</Link>
          </div>
        </Container>
      </nav>

      {/* ── Hero ── */}
      <section className="home-hero">
        <Container>
          <Row className="align-items-center gy-5">
            <Col lg={6}>
              <div className="home-badge">✦ New: Interactive Analytics 2.0</div>
              <h1 className="home-hero-title">
                The school where<br />
                your <span className="highlight">future begins!</span>
              </h1>
              <p className="home-hero-sub">
                Empower your educational journey with SmartResults — a unified platform for real-time results, seamless communication, and deep performance insights for students, teachers, and parents.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/login"  className="home-cta-primary">Get Started →</Link>
                <a href="#about"   className="home-cta-secondary">Learn More</a>
              </div>
            </Col>

            <Col lg={6} className="text-center">
              <div className="home-hero-img-wrap">
                <img
                  src="/school_management_hero_1776163888223.png"
                  alt="SmartResults platform illustration"
                  className="home-hero-img"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── Features ── */}
      <section className="home-features" id="features">
        <Container>
          <div className="text-center mb-2">
            <div className="home-section-tag">Platform Features</div>
          </div>
          <h2 className="home-section-title text-center">Everything your school needs</h2>
          <p className="home-section-sub text-center mx-auto">
            One platform for students, teachers, parents, and administrators — built for modern schools.
          </p>
          <Row className="g-4">
            {features.map((f, i) => (
              <Col key={i} sm={6} lg={4}>
                <div className="home-feature-card">
                  <div className="home-feature-title">{f.title}</div>
                  <p className="home-feature-desc">{f.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── About ── */}
      <section className="home-about" id="about">
        <Container>
          <Row className="align-items-center gy-5">
            <Col lg={5}>
              <div className="home-about-img-wrap">
                <img
                  src="/student_success_illustration_1776163925988.png"
                  alt="About SmartResults"
                  className="home-about-img"
                  onError={(e: any) => { e.target.style.display = 'none'; }}
                />
              </div>
            </Col>

            <Col lg={7} className="ps-lg-5">
              <div className="home-section-tag">About the Platform</div>
              <h2 className="home-section-title mt-2">
                Built to simplify school management
              </h2>
              <ul className="home-check-list">
                <li>Role-based dashboards for Admins, Teachers, Students &amp; Parents</li>
                <li>Real-time notifications via Socket.io</li>
                <li>Automated grade calculation and report card generation</li>
                <li>Subject-wise analytics and term-over-term progress tracking</li>
                <li>Secure JWT authentication with Google OAuth support</li>
              </ul>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── Stats (bottom) ── */}
      <section className="home-stats">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={10}>
              <Row>
                {[
                  { num: '500+', label: 'Students Enrolled' },
                  { num: '50+',  label: 'Active Teachers'   },
                  { num: '20+',  label: 'Classes Managed'   },
                  { num: '99%',  label: 'Satisfaction Rate' },
                ].map((s, i) => (
                  <Col key={i} xs={6} md={3} className="home-stat-item py-3">
                    <div className="home-stat-num">{s.num}</div>
                    <div className="home-stat-label">{s.label}</div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer" id="contact">
        <Container>
          <Row className="g-5">
            {/* Brand */}
            <Col lg={4}>
              <div className="home-footer-logo">Smart<span>Results</span></div>
              <p className="home-footer-desc">
                A modern student result management system built with the MERN stack. Empowering schools with real-time data, smart analytics, and seamless communication.
              </p>
            </Col>

            {/* Platform */}
            <Col xs={6} lg={2}>
              <div className="home-footer-heading">Platform</div>
              <ul className="home-footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><Link to="/login">Student Portal</Link></li>
                <li><Link to="/login">Teacher Portal</Link></li>
                <li><Link to="/login">Parent Portal</Link></li>
              </ul>
            </Col>

            {/* Company */}
            <Col xs={6} lg={2}>
              <div className="home-footer-heading">Company</div>
              <ul className="home-footer-links">
                <li><a href="#about">About Us</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Use</a></li>
              </ul>
            </Col>

            {/* Connect With Us */}
            <Col xs={12} lg={4}>
              <div className="home-footer-heading">Connect With Us</div>
              <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: '1.75', marginBottom: '1rem' }}>
                Have feedback or want to collaborate? Drop us a line at any time.
              </p>
              <a href="mailto:bantuxtha@gmail.com"
                style={{ fontSize: '0.87rem', color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
                bantuxtha@gmail.com
              </a>
            </Col>
          </Row>

          <hr className="home-footer-divider" />
          <p className="home-footer-bottom text-center">
            © {new Date().getFullYear()} SmartResults by Manish Shrestha. All rights reserved.
          </p>
        </Container>
      </footer>

    </div>
  );
};

export default Home;
