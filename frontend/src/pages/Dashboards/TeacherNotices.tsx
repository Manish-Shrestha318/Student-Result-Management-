import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../../components/TeacherSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Badge, Form, InputGroup, Button, Spinner } from 'react-bootstrap';

interface Notice {
  _id: string;
  title: string;
  content: string;
  category: string;
  publishDate: string;
  createdAt: string;
}

const TeacherNotices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      }
    } catch (err) {
      setError('Institutional brief server unreachable.');
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <TeacherSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Notices" error={error} />
        
        <div className="container-fluid p-4 p-lg-5">
           <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
              <div>
                 <h3 className="fw-bold text-dark mb-1 text-uppercase ls-1">School Notice</h3>
                 <p className="text-secondary small mb-0 fw-medium">Latest school updates and announcements.</p>
              </div>
              <div className="d-flex gap-2">
                 <InputGroup className="bg-white rounded-pill shadow-sm overflow-hidden" style={{ width: '300px' }}>
                    <Form.Control 
                        placeholder="Search notices..." 
                        className="border-0 shadow-none px-4 py-2 smaller fw-medium" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </InputGroup>
                 <Form.Select 
                    className="w-auto rounded-pill shadow-sm border-0 px-4 smaller fw-bold py-2 bg-white ls-1 text-uppercase"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                 >
                    <option value="all">ALL</option>
                    <option value="academic">ACADEMIC</option>
                    <option value="event">EVENTS</option>
                    <option value="holiday">HOLIDAYS</option>
                    <option value="exam">EXAMINATIONS</option>
                 </Form.Select>
              </div>
           </div>

           {loading ? (
              <div className="d-flex flex-column justify-content-center align-items-center h-50">
                 <Spinner animation="grow" variant="primary" />
                 <span className="mt-3 smallest fw-bold text-muted text-uppercase ls-2">Loading...</span>
              </div>
           ) : (
              <Row className="g-4">
                 <Col lg={selectedNotice ? 5 : 12}>
                    <div className="d-flex flex-column gap-3">
                       {filteredNotices.length > 0 ? (
                          filteredNotices.map((notice) => (
                             <Card 
                                key={notice._id} 
                                className={`border-0 shadow-sm rounded-4 p-4 transition-all cursor-pointer ${selectedNotice?._id === notice._id ? 'border-2 border-primary shadow' : 'hover-lift'}`}
                                onClick={() => setSelectedNotice(notice)}
                             >
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                   <Badge bg="primary-soft" text="primary" className="fw-bold smallest text-uppercase ls-1 px-3 py-2 rounded-pill border"> {notice.category} </Badge>
                                   <span className="smallest text-muted fw-bold">{formatDate(notice.publishDate)}</span>
                                </div>
                                <h5 className="fw-bold text-dark mb-2 text-uppercase ls-1 fs-6">{notice.title}</h5>
                                <p className="text-secondary smallest mb-0 text-truncate opacity-75">{notice.content}</p>
                             </Card>
                          ))
                       ) : (
                          <Card className="border-0 shadow-sm rounded-4 p-5 text-center bg-white opacity-25">
                             <div className="smallest fw-bold text-uppercase ls-2">No notices found.</div>
                          </Card>
                       )}
                    </div>
                 </Col>

                 {selectedNotice && (
                    <Col lg={7}>
                       <Card className="border-0 shadow-sm rounded-4 p-5 bg-white shadow-sm h-100 position-relative animate-fade-in border-start border-4 border-light sticky-top" style={{ top: '2rem' }}>
                          <Button 
                             variant="link" 
                             className="position-absolute top-0 end-0 m-3 text-secondary text-decoration-none" 
                             onClick={() => setSelectedNotice(null)}
                          >
                             &times;
                          </Button>
                          <div className="mb-4 text-center">
                             <Badge bg="primary-soft" text="primary" className="fw-bold smallest text-uppercase ls-1 px-4 py-3 rounded-pill border mb-4"> {selectedNotice.category} </Badge>
                             <h3 className="fw-bold text-dark mb-2 uppercase ls-1">{selectedNotice.title}</h3>
                             <div className="smallest text-muted fw-bold text-uppercase ls-2">Date: {formatDate(selectedNotice.publishDate)}</div>
                          </div>
                          <hr className="my-5 opacity-25" />
                          <div className="notice-view-content text-secondary px-lg-4 fs-6 leading-relaxed">
                             {selectedNotice.content}
                          </div>
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

export default TeacherNotices;
