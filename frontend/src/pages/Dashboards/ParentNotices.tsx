import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentSidebar from '../../components/ParentSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Badge, Form, InputGroup, Button, Spinner } from 'react-bootstrap';

interface Notice {
  _id: string;
  title: string;
  content: string;
  category: string;
  isActive: boolean;
  publishDate: string;
  expiryDate?: string;
  createdAt: string;
  createdBy?: { name: string };
  targetRoles?: string[];
}

const ParentNotices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchNotices = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const url = filterCategory === 'all' ? '/api/notices' : `/api/notices?category=${filterCategory}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setNotices(Array.isArray(data.data) ? data.data : []);
      } else {
        setError(data.message || 'Failed to establish directive bridge.');
      }
    } catch (err) {
      setError('Communication error: Institutional brief server unreachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [filterCategory]);

  const filteredNotices = notices.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryVariant = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'academic': return 'primary-soft';
      case 'event': return 'info-soft';
      case 'exam': return 'danger-soft';
      case 'holiday': return 'success-soft';
      case 'general': return 'light';
      default: return 'light';
    }
  };

  const getCategoryText = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'academic': return 'primary';
      case 'event': return 'info';
      case 'exam': return 'danger';
      case 'holiday': return 'success';
      default: return 'dark';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <ParentSidebar />

      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Campus Notices" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          <div className="d-flex flex-column flex-md-row gap-4 mb-5 align-items-md-center justify-content-between pb-4 border-bottom border-light-dark">
            <div className="d-flex flex-column flex-md-row gap-3 flex-grow-1" style={{ maxWidth: '700px' }}>
              <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
                <Form.Control 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campus directives..." 
                  className="py-3 px-4 smaller border-0 shadow-none fw-bold ls-1 text-uppercase bg-white"
                />
              </InputGroup>
              <Form.Select 
                className="w-auto shadow-sm border-light-dark smaller fw-bold py-3 px-4 ls-1 text-uppercase rounded-pill appearance-none"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">ALL CATEGORIES</option>
                <option value="academic">ACADEMIC</option>
                <option value="event">EVENTS</option>
                <option value="exam">EXAMS</option>
                <option value="holiday">HOLIDAYS</option>
                <option value="general">GENERAL</option>
              </Form.Select>
            </div>
          </div>

          {loading ? (
             <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" variant="primary" style={{ width: '2rem', height: '2rem' }} />
             </div>
          ) : filteredNotices.length === 0 ? (
            <Card className="border-0 shadow-sm rounded-4 text-center py-5">
              <Card.Body>
                <h6 className="text-secondary fw-bold smallest text-uppercase ls-2">No Notices Identified</h6>
                <p className="text-muted smallest fw-bold ls-1 opacity-50 mt-2 uppercase">No directives matching your query parameters were identified.</p>
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-4">
              <Col lg={selectedNotice ? 5 : 12}>
                <div className="d-flex flex-column gap-3 mb-5">
                  {filteredNotices.map((notice) => {
                    const variant = getCategoryVariant(notice.category);
                    const isSelected = selectedNotice?._id === notice._id;
                    return (
                      <Card 
                        key={notice._id}
                        onClick={() => setSelectedNotice(notice)}
                        className={`border-0 shadow-sm rounded-4 cursor-pointer transition-all border-bottom border-1 ${isSelected ? 'border-start border-4 border-primary bg-white' : 'bg-white opacity-90 border-light-dark'}`}
                      >
                        <Card.Body className="p-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <Badge bg={variant} text={getCategoryText(notice.category)} className="fw-bold smallest text-uppercase px-3 py-2 border rounded-pill ls-1 shadow-none">
                              {notice.category}
                            </Badge>
                            <span className="smallest text-muted fw-bold ls-1 text-uppercase opacity-50">{formatDate(notice.createdAt)}</span>
                          </div>
                          <h6 className="fw-bold text-dark mb-2 ls-1 uppercase smallest fw-bold">{notice.title}</h6>
                          <p className="text-secondary smallest mb-3 lh-base fw-medium text-truncate">
                            {notice.content}
                          </p>
                          <div className="d-flex justify-content-between align-items-center pt-3 border-top border-light-dark">
                             <span className="smallest text-muted fw-bold text-uppercase ls-1 opacity-50">{notice.createdBy?.name || 'OFFICE'}</span>
                             <Button variant="link" className="smallest text-primary fw-bold text-uppercase ls-1 p-0 text-decoration-none uppercase fw-bold">{isSelected ? 'ACTIVE VIEW' : 'EXPAND DIRECTIVE'}</Button>
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              </Col>

              {selectedNotice && (
                <Col lg={7}>
                  <Card className="border-0 shadow-sm rounded-4 overflow-hidden position-sticky border-bottom border-4 border-primary" style={{ top: '2rem' }}>
                    <Card.Body className="p-4 p-lg-5">
                      <div className="mb-5">
                        <Badge bg={getCategoryVariant(selectedNotice.category)} text={getCategoryText(selectedNotice.category)} className="fw-bold smallest text-uppercase px-4 py-2 border rounded-pill ls-1 mb-4">
                          {selectedNotice.category} DIRECTIVE
                        </Badge>
                        <h3 className="fw-bold text-dark ls-1 mb-4 text-uppercase fw-bold">{selectedNotice.title}</h3>
                        <div className="d-flex flex-column flex-sm-row gap-4 smallest fw-bold text-muted text-uppercase ls-1 border-bottom border-light-dark pb-4">
                           <div className="d-flex gap-2 align-items-center"><span className="opacity-50 text-uppercase">RELEASED:</span> <span>{formatDate(selectedNotice.createdAt)}</span></div>
                           <div className="d-flex gap-2 align-items-center"><span className="opacity-50 text-uppercase">ISSUED BY:</span> <span>{selectedNotice.createdBy?.name || 'REGISTRAR'}</span></div>
                        </div>
                      </div>
                      <div className="text-dark smallest lh-lg fw-bold ls-1 opacity-75">
                        {selectedNotice.content.split('\n').map((para, i) => (
                          <p key={i} className="mb-4">{para}</p>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          )}
        </div>
      </main>
    </div>
  );
};

export default ParentNotices;
