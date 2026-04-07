import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Table, Button, Form, Badge, InputGroup, Pagination } from 'react-bootstrap';

const FeeManagement: React.FC = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchFees = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const url = selectedClass ? `/api/fees/report?classId=${selectedClass}` : `/api/fees/report`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFees(data.data.details);
        setSummary(data.data.summary);
      } else {
        setError(data.message || 'Failed to fetch fee data');
      }
    } catch (err) {
      setError('An error occurred while fetching fee records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [selectedClass]);

  const filteredFees = fees.filter(fee => 
    fee.studentId?.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.feeType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentFees = filteredFees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);

  const handleUpdatePayment = async (feeId: string) => {
    const amount = prompt("Enter payment amount:");
    if (!amount || isNaN(parseFloat(amount))) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/fees/payment/${feeId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethod: 'cash'
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchFees();
      } else {
        alert(data.message || 'Payment update failed');
      }
    } catch (err) {
      alert('Error updating payment');
    }
  };

  const getStatusVariant = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid': return 'success-soft';
      case 'partial': return 'warning-soft';
      case 'overdue': return 'danger-soft';
      default: return 'light';
    }
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <AdminSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Financial Administration" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── Metric Grid ── */}
          <Row className="g-4 mb-5">
            <MetricCol label="TOTAL REVENUE" value={`$${summary?.totalCollected || 0}`} variant="success" />
            <MetricCol label="OUTSTANDING" value={`$${summary?.totalPending || 0}`} variant="danger" />
            <MetricCol label="COLLECTION EFFICIENCY" value={summary?.collectionRate || '0%'} variant="primary" />
            <MetricCol label="LEDGER ENTRIES" value={summary?.totalFees || 0} variant="dark" />
          </Row>

          {/* ── Filter Command Bar ── */}
          <div className="d-flex flex-column flex-xxl-row justify-content-between align-items-xxl-center mb-4 gap-4">
            <div className="d-flex flex-column flex-md-row gap-3 flex-grow-1">
              <InputGroup className="w-auto shadow-sm">
                <Form.Control 
                  type="text" 
                  placeholder="Query ledger by name or type..." 
                  className="py-2 smaller border-light-dark shadow-none fw-medium"
                  style={{ width: '320px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Form.Select 
                className="w-auto shadow-sm border-light-dark smaller fw-bold py-2 ls-1 text-uppercase"
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">ALL ACADEMIC COHORTS</option>
                <option value="10A">COHORT 10A</option>
                <option value="10B">COHORT 10B</option>
                <option value="9A">COHORT 9A</option>
              </Form.Select>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-dark" className="fw-bold px-4 py-2 rounded-pill smaller ls-1 border-0 bg-white shadow-sm">
                 EXPORT LEDGER
              </Button>
              <Button variant="primary" className="fw-bold px-4 py-2 rounded-pill shadow-sm ls-1">
                 GENERATE INVOICE
              </Button>
            </div>
          </div>

          {/* ── Financial Ledger ── */}
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-5">
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="bg-light-soft border-bottom border-light-dark">
                  <tr>
                    <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Student Principal</th>
                    <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Fee Particulars</th>
                    <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Financial State</th>
                    <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Settlement Deadline</th>
                    <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Current Standing</th>
                    <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary text-end">Action Deck</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="py-5 text-center text-muted fw-bold small italic">Synchronizing ledger records...</td></tr>
                  ) : filteredFees.length === 0 ? (
                    <tr><td colSpan={6} className="py-5 text-center text-muted small fw-medium">No financial records indexed in current scope.</td></tr>
                  ) : (
                    currentFees.map((fee) => {
                      const balance = fee.amount - fee.paidAmount;
                      const variant = getStatusVariant(fee.status);
                      return (
                        <tr key={fee._id}>
                          <td className="px-4 py-3 border-0">
                            <div className="fw-bold text-dark small">{fee.studentId?.userId?.name || 'UNKNOWN ACCOUNT'}</div>
                            <div className="smallest text-muted text-uppercase fw-bold ls-1 mt-1">ROLL: {fee.studentId?.rollNumber} • COH : {fee.studentId?.class}</div>
                          </td>
                          <td className="px-4 py-3 border-0">
                            <span className="smaller fw-bold text-secondary text-uppercase ls-1">{fee.feeType} MODULE</span>
                          </td>
                          <td className="px-4 py-3 border-0">
                            <div className="smaller fw-bold text-dark mb-1">TOTAL: ${fee.amount}</div>
                            <div className="smallest text-success fw-bold text-uppercase ls-1">COLLECTED: ${fee.paidAmount}</div>
                            <div className={`smallest fw-bold text-uppercase ls-1 ${balance > 0 ? 'text-danger' : 'text-success'}`}>
                              REMAINING: ${balance}
                            </div>
                          </td>
                          <td className="px-4 py-3 small text-muted border-0 fw-medium">
                            {new Date(fee.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </td>
                          <td className="px-4 py-3 border-0">
                            <Badge bg={variant} text={variant.split('-')[0]} className="fw-bold smaller text-uppercase px-3 py-2 border rounded-pill ls-1 w-100">
                              {fee.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-end border-0">
                            <div className="d-flex justify-content-end gap-1">
                              <Button variant="outline-success" size="sm" className="fw-bold border-0 bg-success-soft text-success rounded-pill px-3 py-1 smaller shadow-none" onClick={() => handleUpdatePayment(fee._id)}>
                                RECONCILE
                              </Button>
                              <Button variant="outline-secondary" size="sm" className="fw-bold border-0 bg-light text-secondary rounded-pill px-3 py-1 smaller shadow-none">
                                LOG
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>

            {/* ── Pagination Segment ── */}
            {totalPages > 1 && (
              <div className="card-footer bg-white border-top border-light-dark p-4 d-flex justify-content-between align-items-center">
                <span className="smaller text-secondary fw-medium">Displaying {indexOfFirst + 1}–{Math.min(indexOfLast, filteredFees.length)} of {filteredFees.length} entries</span>
                <Pagination className="mb-0 gap-1 pagination-sm">
                  <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} />
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                      {page}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} />
                </Pagination>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

const MetricCol: React.FC<{ label: string, value: string | number, variant: string }> = ({ label, value, variant }) => (
  <Col md={3}>
    <Card className={`border-0 shadow-sm rounded-4 h-100 border-start border-5 border-${variant}`}>
      <Card.Body className="p-4 py-3">
        <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-1">{label}</span>
        <h4 className={`fw-bold text-dark mb-0 ls-1`}>{value}</h4>
      </Card.Body>
    </Card>
  </Col>
);

export default FeeManagement;

