/**
 * Part 2 — Listening: business dialogue audio + 10 hard comprehension MCQs (2 marks each = 20).
 * Candidates hear audio only (max 2 plays). Script text is not exposed via the public questions API.
 */

export const LISTENING_ANSWER_KEY = {
  1: 'C',
  2: 'B',
  3: 'A',
  4: 'D',
  5: 'B',
  6: 'C',
  7: 'A',
  8: 'D',
  9: 'B',
  10: 'C',
};

export const LISTENING_DIALOGUE = {
  title: 'Sales Discovery Call — Horizon Cloud Solutions',
  scenario:
    'A sales executive from Horizon Cloud Solutions speaks with a prospective client about upgrading their customer support platform.',
  speakers: [
    { id: 'alex', name: 'Alex Rivera', role: 'Account Executive, Horizon Cloud Solutions' },
    { id: 'priya', name: 'Priya Sharma', role: 'Head of Customer Experience, Meridian Retail' },
  ],
  lines: [
    {
      speaker: 'alex',
      text: 'Good morning, Priya. Thank you for making time today. I know Meridian Retail has been evaluating support tools after your ticket volume rose last quarter.',
    },
    {
      speaker: 'priya',
      text: 'That’s right. We’re handling about twelve thousand tickets a month across email and chat, and response times have slipped to nearly nine hours on average. Leadership wants that under four hours within six months.',
    },
    {
      speaker: 'alex',
      text: 'Understood. Our Horizon Assist suite typically cuts first-response time by forty to fifty percent when teams migrate fully within eight weeks. Before I propose a plan, could you tell me what’s working today and where the biggest bottlenecks are?',
    },
    {
      speaker: 'priya',
      text: 'Agents like our current knowledge base, but escalation handoffs are messy. Tickets bounce between three teams, and we have almost no visibility into why VIP customers churn after a bad support experience. Budget is also tight — we’ve been told not to exceed ninety thousand dollars for year one, including onboarding.',
    },
    {
      speaker: 'alex',
      text: 'That ceiling is workable. Our Professional plan for up to eighty agents is seventy-two thousand annually, plus a one-time onboarding fee of twelve thousand. That includes migration support, two training workshops, and a dedicated success manager for the first ninety days.',
    },
    {
      speaker: 'priya',
      text: 'How does escalation routing improve specifically? We can’t afford another tool that looks modern but still dumps everything on senior agents.',
    },
    {
      speaker: 'alex',
      text: 'Horizon Assist uses skill-based routing and SLA priorities. VIP accounts are tagged automatically from your CRM, and unresolved VIP tickets escalate to a specialist queue after thirty minutes. You’ll also get a weekly churn-risk report that correlates support delays with purchase history.',
    },
    {
      speaker: 'priya',
      text: 'Interesting. One concern: last year we tried a competitor and the migration took four months. Can you commit to a shorter timeline?',
    },
    {
      speaker: 'alex',
      text: 'If your IT team can provide API credentials in week one, we commit to a live pilot for twenty agents by day twenty-one, and full rollout by day fifty-six. We’ll pause billing for the Professional plan until the pilot succeeds against the four-hour response target for at least two consecutive weeks.',
    },
    {
      speaker: 'priya',
      text: 'That’s a fair condition. I’ll need a written proposal by Thursday for our CFO, and I’d like two agent leads to join a demo next Tuesday at ten. If the pilot terms are in writing, I’m prepared to recommend a shortlist decision by the end of next week.',
    },
    {
      speaker: 'alex',
      text: 'Perfect. I’ll send the proposal tomorrow morning with pricing, pilot criteria, and the onboarding checklist. I’ll also include three Meridian-like case studies. Looking forward to Tuesday’s demo.',
    },
  ],
};

export const LISTENING_QUESTIONS = [
  {
    id: 1,
    difficulty: 'hard',
    type: 'listening-comprehension',
    question: 'What average response time is Meridian Retail currently experiencing?',
    options: {
      A: 'About four hours',
      B: 'About six hours',
      C: 'Nearly nine hours',
      D: 'Twelve hours',
    },
  },
  {
    id: 2,
    difficulty: 'hard',
    type: 'listening-comprehension',
    question: 'What response-time target does Meridian leadership want within six months?',
    options: {
      A: 'Under two hours',
      B: 'Under four hours',
      C: 'Under six hours',
      D: 'Same-day only for VIP accounts',
    },
  },
  {
    id: 3,
    difficulty: 'hard',
    type: 'listening-comprehension',
    question: 'According to Alex, by how much does Horizon Assist typically reduce first-response time when teams migrate fully within eight weeks?',
    options: {
      A: '40–50%',
      B: '20–30%',
      C: '10–15%',
      D: '60–70%',
    },
  },
  {
    id: 4,
    difficulty: 'hard',
    type: 'listening-comprehension',
    question: 'Which issue does Priya identify as a major operational bottleneck?',
    options: {
      A: 'Agents dislike the knowledge base',
      B: 'Chat volume is too low',
      C: 'The CRM has no customer records',
      D: 'Escalation handoffs between teams are messy',
    },
  },
  {
    id: 5,
    difficulty: 'hard',
    type: 'listening-comprehension',
    question: 'What is Meridian’s maximum budget for year one, including onboarding?',
    options: {
      A: '$72,000',
      B: '$90,000',
      C: '$12,000',
      D: '$100,000',
    },
  },
  {
    id: 6,
    difficulty: 'hard',
    type: 'listening-comprehension',
    question: 'What is the annual price Alex quotes for the Professional plan (up to 80 agents), before the onboarding fee?',
    options: {
      A: '$56,000',
      B: '$90,000',
      C: '$72,000',
      D: '$84,000',
    },
  },
  {
    id: 7,
    difficulty: 'hard',
    type: 'listening-comprehension',
    question: 'How soon do unresolved VIP tickets escalate to the specialist queue in Horizon Assist?',
    options: {
      A: 'After 30 minutes',
      B: 'After 15 minutes',
      C: 'After 2 hours',
      D: 'At the end of the business day',
    },
  },
  {
    id: 8,
    difficulty: 'hard',
    type: 'listening-comprehension',
    question: 'What timeline does Alex commit to for full rollout if API credentials are provided in week one?',
    options: {
      A: 'Day 21',
      B: 'Day 30',
      C: 'Day 90',
      D: 'Day 56',
    },
  },
  {
    id: 9,
    difficulty: 'hard',
    type: 'listening-comprehension',
    question: 'Under Alex’s offer, when does billing for the Professional plan begin?',
    options: {
      A: 'Immediately on contract signature',
      B: 'After the pilot meets the four-hour target for two consecutive weeks',
      C: 'After ninety days of onboarding',
      D: 'Only after the CFO approves the full rollout',
    },
  },
  {
    id: 10,
    difficulty: 'hard',
    type: 'listening-comprehension',
    question: 'What does Priya request by Thursday for the CFO?',
    options: {
      A: 'A discount contract only',
      B: 'Agent training recordings',
      C: 'A written proposal',
      D: 'A competitor comparison spreadsheet',
    },
  },
];
