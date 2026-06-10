import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ASSESSMENT_TIME_MINUTES } from '../config/assessment';
import { APP_NAME } from '../config/branding';

const POSITION_OPTIONS = [
  'Sales Executive',
  'Sales Support Executive',
  'Quality Analyst',
  'Chat Analyst',
  'HR',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    appliedPosition: '',
    date: today,
    agreed: false,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Valid email is required';
    }
    if (!form.phone.trim()) next.phone = 'Phone number is required';
    if (!form.appliedPosition) next.appliedPosition = 'Applied position is required';
    if (!form.date) next.date = 'Date is required';
    if (!form.agreed) next.agreed = 'You must acknowledge the assessment rules';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    sessionStorage.setItem(
      'candidate',
      JSON.stringify({
        name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        applied_position: form.appliedPosition,
        test_date: form.date,
      })
    );
    navigate('/candidate/test');
  };

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Candidate Onboarding</h1>
        <p className="mt-2 text-slate-600">{APP_NAME}</p>
      </div>

      <div className="entegra-info-box mb-8">
        <h2 className="font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Assessment Instructions
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-brand-900/90">
          <li><strong>Total marks:</strong> 50 (Passing mark: 35)</li>
          <li><strong>Part 1 — English Proficiency:</strong> 40 MCQs × 1 mark (IELTS/PTE-style grammar, vocabulary & collocations)</li>
          <li><strong>Part 2 — Sales Acumen:</strong> 5 descriptive questions × 2 marks (AI-evaluated)</li>
          <li><strong>Time limit:</strong> {ASSESSMENT_TIME_MINUTES} minutes — the test auto-submits when the timer reaches 0:00</li>
          <li><strong>Word limits:</strong> Part 2 answers must stay within stated limits or submission will be blocked</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="entegra-card p-6 space-y-5">
        <div>
          <label htmlFor="fullName" className="entegra-label">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={form.fullName}
            onChange={update('fullName')}
            className="entegra-input"
            placeholder="Enter your full name"
          />
          {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="email" className="entegra-label">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={update('email')}
            className="entegra-input"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="entegra-label">Phone</label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={update('phone')}
            className="entegra-input"
            placeholder="+1 234 567 8900"
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="appliedPosition" className="entegra-label">Applied Position</label>
          <select
            id="appliedPosition"
            value={form.appliedPosition}
            onChange={update('appliedPosition')}
            className="entegra-input"
          >
            <option value="">Select position</option>
            {POSITION_OPTIONS.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
          {errors.appliedPosition && <p className="text-red-600 text-sm mt-1">{errors.appliedPosition}</p>}
        </div>

        <div>
          <label htmlFor="date" className="entegra-label">Date</label>
          <input
            id="date"
            type="date"
            value={form.date}
            onChange={update('date')}
            className="entegra-input"
          />
          {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.agreed}
            onChange={(e) => setForm((f) => ({ ...f, agreed: e.target.checked }))}
            className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-slate-600">
            I understand the assessment is 50 marks with a 35-mark pass threshold, lasts {ASSESSMENT_TIME_MINUTES} minutes,
            and will auto-submit when time expires.
          </span>
        </label>
        {errors.agreed && <p className="text-red-600 text-sm">{errors.agreed}</p>}

        <button type="submit" className="entegra-btn-primary w-full">
          Begin Assessment
        </button>
      </form>
    </div>
  );
}
