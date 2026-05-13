import { useState } from 'react';
import { Card, Badge, ZAR, Stat } from '../helpers.jsx';
import { C, bgPage, accent } from '../constants.js';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Total Revenue', value: 'R45,320', icon: '💰', color: accent },
    { label: 'Active Jobs', value: '24', icon: '📋', color: C.blue[600] },
    { label: 'Total Users', value: '847', icon: '👥', color: C.green[600] },
    { label: 'Pending Payments', value: 'R12,400', icon: '⏳', color: C.gold[600] },
  ];

  const recentTransactions = [
    { id: 'tx1', job: 'Grade 12 Maths Marking', teacher: 'Mrs. Naidoo', freelancer: 'Thandi Nkosi', amount: 1200, commission: 240, status: 'completed' },
    { id: 'tx2', job: 'Life Sciences Lesson Plans', teacher: 'Mr. Khumalo', freelancer: 'Johan van der Berg', amount: 2800, commission: 560, status: 'completed' },
    { id: 'tx3', job: 'SBA Portfolio Compilation', teacher: 'Ms. Adams', freelancer: 'Zanele Dlamini', amount: 950, commission: 190, status: 'escrow' },
    { id: 'tx4', job: 'Data Capturing - Q2 Results', teacher: 'Mr. Mokoena', freelancer: 'Mpho Sithole', amount: 600, commission: 120, status: 'pending' },
  ];

  const recentUsers = [
    { id: 'u1', name: 'Priya Naidoo', email: 'priya@email.com', role: 'teacher', joinedAt: '2025-05-15', status: 'active' },
    { id: 'u2', name: 'Thandi Nkosi', email: 'thandi@email.com', role: 'freelancer', joinedAt: '2025-04-20', status: 'active' },
    { id: 'u3', name: 'Johan van der Berg', email: 'johan@email.com', role: 'freelancer', joinedAt: '2025-04-10', status: 'active' },
    { id: 'u4', name: 'Andile Khumalo', email: 'andile@email.com', role: 'teacher', joinedAt: '2025-06-01', status: 'active' },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: bgPage, padding: '2rem 0 3rem' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.gray[900], marginBottom: 24 }}>Admin Dashboard</h1>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: `1px solid ${C.gray[200]}`, paddingBottom: 16 }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Users' },
            { id: 'transactions', label: 'Transactions' },
            { id: 'analytics', label: 'Analytics' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? accent : C.gray[600],
                borderBottom: activeTab === tab.id ? `2px solid ${accent}` : 'transparent',
                paddingBottom: 8,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 32 }}>
              {stats.map((stat, i) => (
                <Stat key={i} label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
              ))}
            </div>
            <Card style={{ padding: '24px 28px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.gray[900], marginBottom: 16 }}>Recent Transactions</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.gray[200]}` }}>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Job</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Teacher</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Freelancer</th>
                      <th style={{ textAlign: 'right', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Amount</th>
                      <th style={{ textAlign: 'right', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Commission</th>
                      <th style={{ textAlign: 'center', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map(tx => (
                      <tr key={tx.id} style={{ borderBottom: `1px solid ${C.gray[100]}` }}>
                        <td style={{ padding: '12px', fontSize: 13, color: C.gray[900] }}>{tx.job}</td>
                        <td style={{ padding: '12px', fontSize: 13, color: C.gray[600] }}>{tx.teacher}</td>
                        <td style={{ padding: '12px', fontSize: 13, color: C.gray[600] }}>{tx.freelancer}</td>
                        <td style={{ textAlign: 'right', padding: '12px', fontSize: 13, fontWeight: 600, color: accent }}>{ZAR(tx.amount)}</td>
                        <td style={{ textAlign: 'right', padding: '12px', fontSize: 13, color: C.gray[600] }}>{ZAR(tx.commission)} (20%)</td>
                        <td style={{ textAlign: 'center', padding: '12px' }}>
                          <Badge color={tx.status === 'completed' ? 'green' : tx.status === 'escrow' ? 'blue' : 'gray'}>{tx.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <Card style={{ padding: '24px 28px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.gray[900], marginBottom: 16 }}>All Users</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.gray[200]}` }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Email</th>
                    <th style={{ textAlign: 'center', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Role</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Joined</th>
                    <th style={{ textAlign: 'center', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: `1px solid ${C.gray[100]}` }}>
                      <td style={{ padding: '12px', fontSize: 13, fontWeight: 600, color: C.gray[900] }}>{user.name}</td>
                      <td style={{ padding: '12px', fontSize: 13, color: C.gray[600] }}>{user.email}</td>
                      <td style={{ textAlign: 'center', padding: '12px' }}>
                        <Badge color={user.role === 'teacher' ? 'blue' : 'green'}>{user.role}</Badge>
                      </td>
                      <td style={{ padding: '12px', fontSize: 13, color: C.gray[600] }}>{user.joinedAt}</td>
                      <td style={{ textAlign: 'center', padding: '12px' }}>
                        <Badge color="green">{user.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'transactions' && (
          <Card style={{ padding: '24px 28px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.gray[900], marginBottom: 16 }}>All Transactions</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.gray[200]}` }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Job</th>
                    <th style={{ textAlign: 'right', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Gross</th>
                    <th style={{ textAlign: 'right', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Commission</th>
                    <th style={{ textAlign: 'right', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Freelancer Payout</th>
                    <th style={{ textAlign: 'center', padding: '12px', fontSize: 13, fontWeight: 700, color: C.gray[600] }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: `1px solid ${C.gray[100]}` }}>
                      <td style={{ padding: '12px', fontSize: 13, color: C.gray[900] }}>{tx.job}</td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13, fontWeight: 600, color: C.gray[900] }}>{ZAR(tx.amount)}</td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13, color: accent }}>{ZAR(tx.commission)}</td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13, fontWeight: 600, color: C.gray[900] }}>{ZAR(tx.amount - tx.commission)}</td>
                      <td style={{ textAlign: 'center', padding: '12px' }}>
                        <Badge color={tx.status === 'completed' ? 'green' : tx.status === 'escrow' ? 'blue' : 'gray'}>{tx.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24 }}>
            <Card style={{ padding: '24px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.gray[900], marginBottom: 8 }}>Revenue Trend</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: accent }}>R45.3k</div>
              <div style={{ fontSize: 12, color: C.gray[500], marginTop: 8 }}>↑ 12% from last month</div>
            </Card>
            <Card style={{ padding: '24px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.gray[900], marginBottom: 8 }}>Job Completion Rate</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.green[600] }}>94%</div>
              <div style={{ fontSize: 12, color: C.gray[500], marginTop: 8 }}>↑ 3% from last month</div>
            </Card>
            <Card style={{ padding: '24px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.gray[900], marginBottom: 8 }}>Average Rating</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.gold[600] }}>4.7/5</div>
              <div style={{ fontSize: 12, color: C.gray[500], marginTop: 8 }}>Based on 847 reviews</div>
            </Card>
            <Card style={{ padding: '24px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.gray[900], marginBottom: 8 }}>User Growth</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.blue[600] }}>+142</div>
              <div style={{ fontSize: 12, color: C.gray[500], marginTop: 8 }}>New users this month</div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
