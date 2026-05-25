import React, { useState, useEffect } from 'react';
import ComplaintForm from './components/ComplaintForm';

function App() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComplaints = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/complaints');
      if (!response.ok) throw new Error('Failed to fetch complaints');
      const data = await response.json();
      setComplaints(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load recent complaints. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleComplaintAdded = (newComplaint) => {
    setComplaints(prev => [newComplaint, ...prev]);
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <header className="app-header">
        <h1>HostelVoice</h1>
        <p>Smart Complaint System</p>
      </header>

      <main>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <ComplaintForm onComplaintAdded={handleComplaintAdded} />
        </div>

        <section style={{ marginTop: '4rem' }}>
          <h2 style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            Recent Complaints
          </h2>
          
          {loading ? (
            <p>Loading complaints...</p>
          ) : error ? (
            <p style={{ color: 'var(--danger-color)' }}>{error}</p>
          ) : complaints.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No complaints filed yet.</p>
          ) : (
            <div className="complaints-grid">
              {complaints.map(complaint => (
                <div key={complaint._id} className="complaint-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span className={`badge ${complaint.category.toLowerCase()}`}>
                      {complaint.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatDate(complaint.createdAt)}
                    </span>
                  </div>
                  <h3>{complaint.title}</h3>
                  <p>{complaint.description}</p>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Status: <strong style={{ color: complaint.status === 'Pending' ? '#fbbf24' : 'var(--accent-color)' }}>{complaint.status}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default App;
