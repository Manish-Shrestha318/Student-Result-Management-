import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

const Home: React.FC = () => {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Navigation */}
      <nav className="bg-white py-3 shadow-sm">
        <Container className="d-flex justify-content-between align-items-center">
          <h4 className="m-0 fw-bold text-primary tracking-tight">SmartResults</h4>
          <div className="d-flex gap-2">
            <Link to="/login">
              <Button variant="outline-primary" className="fw-bold px-4">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" className="fw-bold px-4">Register</Button>
            </Link>
          </div>
        </Container>
      </nav>

      {/* Main Content */}
      <Container className="flex-grow-1 d-flex align-items-center py-5">
        <Row className="w-100 justify-content-center">
          <Col md={8} lg={6} className="text-center">
            <Card className="border-0 shadow-sm rounded-4 p-5 bg-white">
              <h1 className="display-5 fw-bold text-dark mb-4">
                Welcome to SmartResults
              </h1>
              <p className="lead text-secondary mb-5">
                A simple, centralized platform to manage student academic records, notices, and attendance efficiently.
              </p>
              
              <div className="d-flex justify-content-center gap-3">
                <Link to="/login">
                  <Button variant="primary" size="lg" className="px-5 shadow-sm fw-bold">Sign In</Button>
                </Link>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
