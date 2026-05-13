import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { Card, Btn } from '../helpers.jsx';
import { Input, Select, Textarea } from '../components/FormElements.jsx';
import { C, bgPage, accent, CATEGORIES, PROVINCES, CITIES, SUBJECTS } from '../constants.js';

const PostJobPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [remoteOk, setRemoteOk] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!title || !description || !category || !subject || !gradeLevel || !budget || !deadline || !province || !city) {
      setError('Please complete all required fields before posting your job.');
      return;
    }

    if (!token) {
      setError('You must be logged in to post a job.');
      return;
    }

    const payload = {
      title,
      description,
      categoryId: CATEGORIES.indexOf(category) + 1,
      subject,
      gradeLevel,
      budget: Number(budget),
      deadline,
      province,
      city,
      remoteOk,
    };

    try {
      setSubmitting(true);
      await api.createJob(payload, token);
      setSuccess('Job posted successfully. Redirecting to jobs...');
      setTimeout(() => navigate('/jobs'), 900);
    } catch (err) {
      setError(err.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: bgPage, padding: '2rem 0 3rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Card style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.gray[900], marginBottom: 16 }}>Post a New Job</h1>
          <p style={{ fontSize: 14, color: C.gray[500], marginBottom: 22 }}>Create a project for CAPS admin support and start receiving proposals from qualified freelancers.</p>

          {error && <div style={{ background: C.red[50], border: `1px solid ${C.red[100]}`, color: C.red[800], padding: '12px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
          {success && <div style={{ background: C.green[50], border: `1px solid ${C.green[100]}`, color: C.green[800], padding: '12px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{success}</div>}

          <Input label="Job Title" value={title} onChange={setTitle} placeholder="Grade 12 Maths Paper 1 Marking" required />
          <Textarea label="Job Description" value={description} onChange={setDescription} placeholder="Describe the scope, curriculum alignment and expected deliverables." rows={6} />
          <Select label="Service Category" value={category} onChange={setCategory} options={CATEGORIES} placeholder="Select a category" />
          <Select label="Subject" value={subject} onChange={setSubject} options={SUBJECTS} placeholder="Select a subject" />
          <Input label="Grade Level" value={gradeLevel} onChange={setGradeLevel} placeholder="e.g. Grade 12" />
          <Input label="Budget (ZAR)" type="number" value={budget} onChange={setBudget} placeholder="e.g. 1200" />
          <Input label="Deadline" type="date" value={deadline} onChange={setDeadline} />
          <Select label="Province" value={province} onChange={value => { setProvince(value); setCity(''); }} options={PROVINCES} placeholder="Select a province" />
          <Select label="City" value={city} onChange={setCity} options={province ? (CITIES[province] || []) : []} placeholder={province ? 'Select a city' : 'Select province first'} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 22px', fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={remoteOk} onChange={() => setRemoteOk(!remoteOk)} />
            Allow remote proposals
          </label>

          <Btn size="lg" onClick={handleSubmit} disabled={submitting} style={{ width: '100%' }}>{submitting ? 'Posting...' : 'Post Job'}</Btn>
        </Card>
      </div>
    </div>
  );
};

export default PostJobPage;
