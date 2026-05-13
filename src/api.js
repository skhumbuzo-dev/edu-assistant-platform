// ─── API ──────────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:3001/api";

export const api = {
  async getFreelancers() {
    const res = await fetch(`${API_BASE}/freelancers`);
    if (!res.ok) throw new Error("Failed to fetch freelancers");
    return res.json();
  },
  async getJobs() {
    const res = await fetch(`${API_BASE}/jobs`);
    if (!res.ok) throw new Error("Failed to fetch jobs");
    return res.json();
  },
  async getJob(id) {
    const res = await fetch(`${API_BASE}/jobs/${id}`);
    if (!res.ok) throw new Error("Failed to fetch job");
    return res.json();
  },
  async createJob(jobData, token) {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    });
    if (!res.ok) throw new Error("Failed to create job");
    return res.json();
  },
  async submitProposal(proposalData, token) {
    const res = await fetch(`${API_BASE}/proposals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(proposalData),
    });
    if (!res.ok) throw new Error("Failed to submit proposal");
    return res.json();
  },
  async sendMessage(messageData, token) {
    const res = await fetch(`${API_BASE}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    });
    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
  },
  async releasePayment(transactionId, token) {
    const res = await fetch(`${API_BASE}/transactions/${transactionId}/release`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to release payment");
    return res.json();
  },
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Login failed");
    }
    return res.json();
  },
  async register(registrationData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registrationData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Registration failed");
    }
    return res.json();
  },
  async getCurrentUser(token) {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  },
};