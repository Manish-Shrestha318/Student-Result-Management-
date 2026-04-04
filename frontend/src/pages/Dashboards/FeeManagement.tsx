import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Download,
  DollarSign
} from 'lucide-react';

const FeeManagement: React.FC = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'paid': return { bg: '#dcfce7', text: '#15803d' };
      case 'partial': return { bg: '#fef9c3', text: '#a16207' };
      case 'overdue': return { bg: '#fee2e2', text: '#dc2626' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <AdminHeader title="Finance & Fee Management" error={error} />

        <div style={{ padding: '2.5rem' }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <MetricCard label="Total Collected" value={`$${summary?.totalCollected || 0}`} color="#16a34a" />
            <MetricCard label="Pending Balance" value={`$${summary?.totalPending || 0}`} color="#dc2626" />
            <MetricCard label="Collection Rate" value={summary?.collectionRate || '0%'} color="#2563eb" />
            <MetricCard label="Total Fee Records" value={summary?.totalFees || 0} color="#64748b" />
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
                <input 
                  type="text" 
                  placeholder="Search student or fee type..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none' }}
                />
              </div>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                <option value="">All Classes</option>
                <option value="10A">Class 10A</option>
                <option value="10B">Class 10B</option>
                <option value="9A">Class 9A</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={18} /> Export
              </button>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> Create Invoice
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Student Detail</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Fee Particulars</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Financials</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Due Date</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Management</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center' }}>Loading ledger...</td></tr>
                  ) : filteredFees.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center' }}>No fee records found.</td></tr>
                  ) : (
                    filteredFees.map((fee) => {
                      const style = getStatusStyle(fee.status);
                      const balance = fee.amount - fee.paidAmount;
                      return (
                        <tr key={fee._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ fontWeight: 600 }}>{fee.studentId?.userId?.name || 'Unknown Student'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {fee.studentId?.rollNumber} • Class {fee.studentId?.class}</div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>{fee.feeType} Fees</span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ fontSize: '0.9rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Total:</span> <strong>${fee.amount}</strong>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#16a34a' }}>
                              Paid: ${fee.paidAmount}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: balance > 0 ? '#dc2626' : '#16a34a' }}>
                              Bal: ${balance}
                            </div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {new Date(fee.dueDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span style={{ 
                              padding: '0.3rem 0.6rem', 
                              borderRadius: '6px', 
                              backgroundColor: style.bg, 
                              color: style.text, 
                              fontSize: '0.75rem', 
                              fontWeight: 700, 
                              textTransform: 'uppercase' 
                            }}>
                              {fee.status}
                            </span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleUpdatePayment(fee._id)}
                                title="Record Payment" 
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #16a34a', background: '#fff', cursor: 'pointer', color: '#16a34a' }}
                              >
                                <DollarSign size={16} />
                              </button>
                              <button title="Options" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string | number, color: string }> = ({ label, value, color }) => (
  <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>{label}</p>
    <h3 style={{ fontSize: '1.5rem', margin: 0, color }}>{value}</h3>
  </div>
);

export default FeeManagement;
