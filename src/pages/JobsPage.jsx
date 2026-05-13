import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { Card, Badge, Stars, ZAR } from '../helpers.jsx';
import { C, bgPage, accent, CATEGORIES, CAT_ICONS, PROVINCES } from '../constants.js';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [province, setProvince] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getJobs()
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(job =>
    (!search || job.title.toLowerCase().includes(search.toLowerCase()) || job.description.toLowerCase().includes(search.toLowerCase()) || job.subject?.toLowerCase().includes(search.toLowerCase())) &&
    (!category || job.category === category) &&
    (!province || job.province === province) &&
    (!remoteOnly || job.remote)
  );

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading jobs...</div>;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: bgPage, padding: '0 0 3rem' }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.gray[200]}`, padding: '20px 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray[900], margin: '0 0 16px' }}>Browse Open Jobs</h1>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by job title, subject or description..."
              style={{ padding: '8px 14px', border: `1px solid ${C.gray[300]}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', flex: 1, minWidth: 220 }}
            />
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${C.gray[300]}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
            </select>
            <select value={province} onChange={e => setProvince(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${C.gray[300]}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}>
              <option value="">All Provinces</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={remoteOnly} onChange={() => setRemoteOnly(!remoteOnly)} />Remote only
            </label>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 2rem' }}>
        <div style={{ fontSize: 14, color: C.gray[500], marginBottom: 16 }}>{filtered.length} job{filtered.length !== 1 ? 's' : ''} found</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {filtered.map(job => (
            <Card key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: C.gray[900] }}>{job.title}</div>
                  <div style={{ fontSize: 13, color: C.gray[500], marginTop: 6 }}>{job.subject} · {job.grade}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: accent }}>{ZAR(job.budget)}</div>
                  <div style={{ fontSize: 11, color: C.gray[400] }}>Budget</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: C.gray[600], lineHeight: 1.6, margin: '0 0 12px' }}>{job.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                <Badge color="gold">{job.category}</Badge>
                <Badge color="teal">{job.province}</Badge>
                {job.remote && <Badge color="green">Remote</Badge>}
                <Badge>{job.city}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: C.gray[500] }}>
                <span>{job.proposals} proposals</span>
                <span>Deadline: {job.deadline}</span>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: C.gray[400] }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>No jobs match your filters</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>Try broadening your search or changing category.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
