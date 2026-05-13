import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { Card, Badge, ZAR, Btn } from '../helpers.jsx';
import { C, bgPage, accent } from '../constants.js';

const MyProposalsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [jobs, setJobs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([api.getJobs()])
      .then(([allJobs]) => {
        setJobs(Object.fromEntries(allJobs.map(j => [j.id, j])));
        setLoading(false);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading your proposals...</div>;
  }

  // Mock proposals - in production this would come from an API
  const mockProposals = [
    { id: 'p1', jobId: 'j1', coverLetter: 'I have 10 years experience with Grade 12 Maths...', proposedPrice: 1200, estimatedDays: 2, status: 'pending', createdAt: '2025-06-03' },
    { id: 'p2', jobId: 'j2', coverLetter: 'Expert in Life Sciences curriculum. Can complete by June 30.', proposedPrice: 2500, estimatedDays: 5, status: 'accepted', createdAt: '2025-06-01' },
  ];

  const filtered = mockProposals.filter(p => jobs[p.jobId]);

  if (filtered.length === 0) {
    return (
      <div style={{ minHeight: 'calc(100vh - 60px)', background: bgPage, padding: '2rem 0 3rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <Card style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>💼</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.gray[900], marginBottom: 8 }}>No proposals yet</div>
            <div style={{ fontSize: 14, color: C.gray[500], marginBottom: 20 }}>Browse jobs and submit your first proposal to get started.</div>
            <Btn onClick={() => navigate('/jobs')}>Browse jobs</Btn>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: bgPage, padding: '2rem 0 3rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.gray[900], marginBottom: 24 }}>My Proposals</h1>

        <div style={{ display: 'grid', gap: 18 }}>
          {filtered.map(proposal => {
            const job = jobs[proposal.jobId];
            return (
              <Card key={proposal.id} style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: C.gray[900], margin: 0 }}>{job.title}</h2>
                      <Badge color={proposal.status === 'accepted' ? 'green' : proposal.status === 'rejected' ? 'red' : 'gray'}>{proposal.status}</Badge>
                    </div>
                    <div style={{ fontSize: 14, color: C.gray[500], marginBottom: 12 }}>For: {job.category} · {job.subject} · {job.grade}</div>
                    <p style={{ fontSize: 13, color: C.gray[600], lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>{proposal.coverLetter}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: accent }}>{ZAR(proposal.proposedPrice)}</div>
                    <div style={{ fontSize: 12, color: C.gray[500], marginBottom: 8 }}>Your bid</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.gray[700] }}>{proposal.estimatedDays} days</div>
                    <div style={{ fontSize: 12, color: C.gray[500] }}>Estimated</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <Badge color="gray">Submitted {proposal.createdAt}</Badge>
                </div>
                <Btn onClick={() => navigate(`/jobs/${proposal.jobId}`)} variant="secondary" size="sm">View job details</Btn>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyProposalsPage;
