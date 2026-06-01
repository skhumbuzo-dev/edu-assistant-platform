import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { Card, Badge, ZAR, Btn } from '../helpers.jsx';
import { C, bgPage, accent } from '../constants.js';

const MyJobsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) return;
    api.getJobs()
      .then(allJobs => {
        const myJobs = allJobs.filter(j => j.teacher_id === user.id || j.teacherId === user.id);
        setJobs(myJobs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, user?.id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading your jobs...</div>;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: bgPage, padding: '2rem 0 3rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.gray[900], margin: 0 }}>My Jobs</h1>
          <Btn onClick={() => navigate('/post-job')} size="lg">Post a new job</Btn>
        </div>

        {jobs.length === 0 ? (
          <Card style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.gray[900], marginBottom: 8 }}>No jobs posted yet</div>
            <div style={{ fontSize: 14, color: C.gray[500], marginBottom: 20 }}>Start by posting your first job to connect with freelancers.</div>
            <Btn onClick={() => navigate('/post-job')}>Post a job</Btn>
          </Card>
        ) : (
          <div style={{ display: 'grid', gap: 18 }}>
            {jobs.map(job => (
              <Card key={job.id} style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: C.gray[900], margin: 0 }}>{job.title}</h2>
                      <Badge color={job.status === 'open' ? 'green' : 'gray'}>{job.status}</Badge>
                    </div>
                    <div style={{ fontSize: 14, color: C.gray[500], marginBottom: 12 }}>{job.category} · {job.subject} · {job.grade}</div>
                    <p style={{ fontSize: 14, color: C.gray[600], lineHeight: 1.5, margin: 0 }}>{job.description.slice(0, 120)}...</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: accent }}>{ZAR(job.budget)}</div>
                    <div style={{ fontSize: 12, color: C.gray[500], marginBottom: 16 }}>Budget</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: C.blue[600] }}>{job.proposals}</div>
                    <div style={{ fontSize: 12, color: C.gray[500] }}>Proposals</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <Badge>{job.province}</Badge>
                  <Badge>{job.city}</Badge>
                  {job.remote && <Badge color="green">Remote</Badge>}
                  <Badge color="gray">Deadline: {job.deadline}</Badge>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Btn onClick={() => navigate(`/jobs/${job.id}`)} variant="secondary" size="sm">View details</Btn>
                  {job.proposals > 0 && (
                    <Btn onClick={() => navigate(`/job/${job.id}/proposals`)} size="sm">View proposals</Btn>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobsPage;
