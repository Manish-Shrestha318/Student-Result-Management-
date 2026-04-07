import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Badge, Button, Form, InputGroup, Spinner } from 'react-bootstrap';

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.activities || []);
      } else {
        setError(data.message || 'Failed to fetch logs');
      }
    } catch (err) {
      setError('An error occurred while fetching system activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString()} — ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <AdminSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="System Forensic Audit" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── Operational Command Bar ── */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-4 border-bottom">
            <div>
              <h5 className="fw-bold text-dark mb-1 ls-1 text-uppercase small border-start border-4 border-primary ps-3">Activity Stream Matrix</h5>
              <p className="text-secondary smallest fw-bold text-uppercase ls-1 ms-3 mt-1 opacity-75">Immutable audit record of institutional state modifications.</p>
            </div>
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={fetchLogs} 
              disabled={loading} 
              className="fw-bold rounded-pill px-4 py-2 ls-1 text-uppercase smallest shadow-sm"
            >
              {loading ? 'SYNCHRONIZING...' : 'FORCE REFRESH'}
            </Button>
          </div>

          {/* ── Analytical Query Terminal ── */}
          <Card className="border-0 shadow-sm rounded-4 mb-5 p-2 overflow-hidden">
             <InputGroup>
                <div className="bg-white border-0 px-4 py-2 d-flex align-items-center opacity-50">
                   <span className="smallest fw-bold text-uppercase ls-1">Query Hash:</span>
                </div>
                <Form.Control 
                  type="text" 
                  placeholder="FILTER BY AGENT, ACTION MANIFOLD, OR SYSTEM PARAMETERS..." 
                  className="border-0 shadow-none py-3 smaller fw-bold text-uppercase ls-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </InputGroup>
          </Card>

          {/* ── Log Forensic Terminal ── */}
          <div className="d-flex flex-column gap-4">
            {loading && logs.length === 0 ? (
              <div className="text-center py-5">
                 <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                 <p className="smallest fw-bold text-primary mt-4 ls-1 text-uppercase">Mapping system events...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <Card className="border-0 shadow-sm rounded-4 py-5 text-center">
                <Card.Body>
                  <h6 className="text-secondary fw-bold smallest text-uppercase ls-1 opacity-50">Query Paradox</h6>
                  <p className="text-muted smaller mb-0 mt-2">No historical records identified for the active parameters.</p>
                </Card.Body>
              </Card>
            ) : (
              filteredLogs.map((log) => (
                <Card key={log._id} className="border-0 shadow-sm rounded-4 hover-lift overflow-hidden border-start border-4 border-primary shadow-sm-hover">
                  <Card.Body className="p-4 p-md-5">
                     <Row className="align-items-start g-4">
                        <Col lg={8}>
                           <div className="d-flex align-items-center gap-3 mb-3">
                             <Badge bg="primary-soft" text="primary" className="fw-bold smallest text-uppercase px-3 py-2 border rounded-pill ls-1 shadow-none">
                                {log.category.replace('_', ' ')}
                             </Badge>
                             <span className="smallest text-muted fw-bold ls-1 text-uppercase opacity-75">REF: {log._id.slice(-8).toUpperCase()}</span>
                           </div>
                           <h6 className="fw-bold text-dark mb-2 fs-5 ls-1 text-uppercase">{log.action}</h6>
                           <p className="text-secondary smaller fw-medium lh-lg mb-0">{log.details}</p>
                        </Col>
                        <Col lg={4} className="text-lg-end border-start-lg ps-lg-5">
                           <div className="d-flex flex-column gap-3 justify-content-lg-end h-100">
                             <div className="d-flex align-items-center gap-3 justify-content-lg-end">
                                <div className="text-end">
                                   <div className="smallest fw-bold text-dark ls-1 text-uppercase">{log.userId?.name}</div>
                                   <div className="smallest text-muted fw-bold text-uppercase ls-1 opacity-50">Authorized Agent</div>
                                </div>
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '42px', height: '42px', fontSize: '0.9rem' }}>
                                  {log.userId?.name.charAt(0)}
                                </div>
                             </div>
                             <div className="smallest fw-bold text-muted ls-1 text-uppercase border-top pt-3">
                                {formatDate(log.createdAt)}
                             </div>
                           </div>
                        </Col>
                     </Row>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityLogs;


