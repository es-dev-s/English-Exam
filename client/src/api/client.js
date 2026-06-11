import { getAdminToken } from '../utils/authStorage';

const API_BASE = '/api';

export async function fetchQuestions() {
  const res = await fetch(`${API_BASE}/questions`);
  if (!res.ok) {
    throw new Error('Failed to load questions. Make sure the API server is running.');
  }
  const data = await res.json();
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error('No questions returned from the server.');
  }
  return data;
}

export async function submitAssessment(payload) {
  const res = await fetch(`${API_BASE}/submit-assessment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Submission failed');
  return data;
}

export async function adminLogin({ username, password }) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function verifyAdminSession(token) {
  const res = await fetch(`${API_BASE}/admin/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Session expired');
  return data;
}

function adminHeaders() {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}` };
}

export async function fetchAdminResultDetail(resultId) {
  const res = await fetch(`${API_BASE}/admin/results/${resultId}`, {
    headers: adminHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load result details');
  return data;
}

export async function fetchAdminResults() {
  const res = await fetch(`${API_BASE}/admin/results`, {
    headers: adminHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load results');
  return data;
}

export async function uploadCandidateCv(resultId, file) {
  const formData = new FormData();
  formData.append('cv', file);
  const res = await fetch(`${API_BASE}/admin/results/${resultId}/cv`, {
    method: 'POST',
    headers: adminHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'CV upload failed');
  return data;
}

export async function downloadCandidateCv(resultId) {
  const res = await fetch(`${API_BASE}/admin/results/${resultId}/cv`, {
    headers: adminHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to download CV');
  }
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] || 'candidate-cv';
  const blob = await res.blob();
  return { blob, filename };
}
