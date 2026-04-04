import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { 
  Terminal, 
  UserPlus, 
  ShieldCheck, 
  CreditCard, 
  BookOpen,
  Search,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';

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
        setLogs(data.activities);
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

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'auth': return <ShieldCheck size={18} color="#2563eb" />;
      case 'user_management': return <UserPlus size={18} color="#16a34a" />;
      case 'academic': return <BookOpen size={18} color="#8b5cf6" />;
      case 'finance': return <CreditCard size={18} color="#f59e0b" />;
      default: return <Terminal size={18} color="#64748b" />;
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <AdminHeader title="System Audit Logs" error={error} />

        <div style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Recent Activity</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Comprehensive log of all administrative and system actions for security auditing.</p>
            </div>
            <button onClick={fetchLogs} disabled={loading} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh Feed
            </button>
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
              <input 
                type="text" 
                placeholder="Filter logs by action, details, or administrator..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading && logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>Gathering system events...</div>
            ) : filteredLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>No audit logs matching your criteria.</div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log._id} className="card" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1.5rem', alignItems: 'start', transition: 'transform 0.2s' }}>
                  <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getCategoryIcon(log.category)}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{log.action}</span>
                      <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.6rem', borderRadius: '4px', backgroundColor: '#eff6ff', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {log.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{log.details}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>
                          {log.userId?.name.charAt(0)}
                        </div>
                        {log.userId?.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={14} /> {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                    <ExternalLink size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityLogs;
