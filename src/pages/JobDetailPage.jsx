import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { Card, Badge, Btn, ZAR } from '../helpers.jsx';
import { C, bgPage, accent } from '../constants.js';
import { Input, Textarea } from '../components/FormElements.jsx';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getJob(id)
      .then(setJob)
      .catch(err => {
        console.error(err);
        setError('Unable to load job details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleProposal = async () => {
    setError('');
    setSuccess('');

    if (!user || !token) {
      setError('Please log in to submit a proposal.');
      return;
    }

    if (!coverLetter || !proposedPrice) {
      setError('Please provide a cover letter and proposed price.');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitProposal({ jobId: id, coverLetter, proposedPrice: Number(proposedPrice), estimatedDays: Number(estimatedDays) }, token);
      setSuccess('Proposal submitted successfully.');
      setCoverLetter('');
      setProposedPrice('');
      setEstimatedDays('');
    } catch (err) {
      setError(err.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading job details...</div>;
  }

  if (!job) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Job not found.</div>;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: bgPage, padding: '2rem 0 3rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem' }}>
        <button onClick={() => navigate('/jobs')} style={{ border: 'none', background: 'transparent', color: accent, cursor: 'pointer', fontSize: 13, marginBottom: 16 }}>← Back to jobs</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 24 }}>
          <div>
            <Card style={{ padding: '26px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.gray[900], marginBottom: 8 }}>{job.title}</div>
                  <div style={{ fontSize: 14, color: C.gray[500] }}>{job.category} · {job.subject} · {job.grade}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: accent }}>{ZAR(job.budget)}</div>
                  <div style={{ fontSize: 13, color: C.gray[500] }}>Budget</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                <Badge color="gold">{job.category}</Badge>
                <Badge>{job.province}</Badge>
                <Badge>{job.city}</Badge>
                {job.remote && <Badge color="green">Remote</Badge>}
                <Badge color="blue">{job.status}</Badge>
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.8, color: C.gray[700], marginBottom: 24 }}>{job.description}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 24 }}>
                <div style={{ background: C.gray[50], borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.gray[500], textTransform: 'uppercase', marginBottom: 6 }}>Deadline</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.gray[900] }}>{job.deadline}</div>
                </div>
                <div style={{ background: C.gray[50], borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.gray[500], textTransform: 'uppercase', marginBottom: 6 }}>Posted by</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.gray[900] }}>{job.teacher}</div>
                </div>
                <div style={{ background: C.gray[50], borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.gray[500], textTransform: 'uppercase', marginBottom: 6 }}>Proposals</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.gray[900] }}>{job.proposals}</div>
                </div>
              </div>
            </Card>

            <Card style={{ marginTop: 24, padding: '24px 26px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.gray[900] }}>Proposal details</div>
                  <div style={{ fontSize: 13, color: C.gray[500], marginTop: 4 }}>Submit your bid and pitch for this job.</div>
                </div>
              </div>
              {user ? (
                user.role === 'freelancer' ? (
                  <>
                    {error && <div style={{ background: C.red[50], border: `1px solid ${C.red[100]}`, color: C.red[800], padding: '12px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
                    {success && <div style={{ background: C.green[50], border: `1px solid ${C.green[100]}`, color: C.green[800], padding: '12px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{success}</div>}
                    <Textarea label="Cover letter" value={coverLetter} onChange={setCoverLetter} placeholder="Explain why you're a great fit for this job." rows={6} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Input label="Proposed price (ZAR)" type="number" value={proposedPrice} onChange={setProposedPrice} placeholder="e.g. 1500" />
                      <Input label="Estimated days" type="number" value={estimatedDays} onChange={setEstimatedDays} placeholder="e.g. 5" />
                    </div>
                    <Btn onClick={handleProposal} disabled={submitting} size="lg" style={{ marginTop: 12 }}>{submitting ? 'Submitting...' : 'Submit proposal'}</Btn>
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: C.gray[600] }}>
                    Only freelancers can submit proposals. Please sign in with a freelancer account.
                  </div>
                )
              ) : (
                <div style={{ fontSize: 14, color: C.gray[600] }}>
                  Sign in to submit a proposal for this job.
                </div>
              )}
            </Card>
          </div>
          <div>
            <Card style={{ padding: '22px 20px' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.gray[900], marginBottom: 12 }}>Job summary</div>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 12, color: C.gray[500] }}>Location</div>
                  <div style={{ fontSize: 15, color: C.gray[700] }}>{job.city}, {job.province}</div>
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 12, color: C.gray[500] }}>Remote option</div>
                  <div style={{ fontSize: 15, color: C.gray[700] }}>{job.remote ? 'Yes' : 'No'}</div>
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 12, color: C.gray[500] }}>Grade level</div>
                  <div style={{ fontSize: 15, color: C.gray[700] }}>{job.grade}</div>
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 12, color: C.gray[500] }}>Subject</div>
                  <div style={{ fontSize: 15, color: C.gray[700] }}>{job.subject}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
