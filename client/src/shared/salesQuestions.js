import { WRITING_MIN_WORDS } from './assessment.js';

/**
 * Bank of sales writing prompts. Assessments may sample a subset by id.
 */
export const SALES_QUESTION_BANK = [
  {
    id: 'wq1',
    questionId: 1,
    label: 'Q1. What motivates you to pursue a career in sales?',
    prompt: 'What motivates you to pursue a career in sales? Describe the experiences, values, or goals that draw you to this profession.',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Write at least 100 words about your motivation for a sales career...',
    rows: 6,
  },
  {
    id: 'wq2',
    questionId: 2,
    label: 'Q2. A client stops responding after two follow-ups. What do you do?',
    prompt: 'A promising client stops responding after two polite follow-ups. Explain how you would re-engage them without appearing pushy.',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Describe your follow-up strategy in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq3',
    questionId: 3,
    label: 'Q3. Describe one personal sales strength and one weakness.',
    prompt: 'Describe one of your strongest skills as a salesperson and one weakness you are actively improving. Give concrete examples.',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Explain one strength and one weakness in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq4',
    questionId: 4,
    label: 'Q4. Explain what "customer value" means to you.',
    prompt: 'Explain what "customer value" means in a B2B sales context and how you would demonstrate it during a discovery call.',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Define and illustrate customer value in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq5',
    questionId: 5,
    label: 'Q5. Build a weekly plan for 40 mixed-intent prospects.',
    prompt:
      'You are leading 40 prospects this week: 5 are highly interested, 15 are neutral, 10 have declined, and 10 have gone quiet. Create a weekly action plan prioritizing your time.',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Outline your weekly plan in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq6',
    questionId: 6,
    label: 'Q6. How do you prepare for a first discovery call?',
    prompt:
      'Describe your preparation process before a first discovery call with a new enterprise prospect. What research do you do, and which questions do you prioritize?',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Explain your discovery-call preparation in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq7',
    questionId: 7,
    label: 'Q7. Handle a price objection from a CFO.',
    prompt:
      'A CFO says your solution is 20% more expensive than a competitor. Write how you would respond, including questions you would ask and value points you would emphasize.',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Write your response to the pricing objection in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq8',
    questionId: 8,
    label: 'Q8. Recover after missing a quarterly target.',
    prompt:
      'You missed your quarterly sales target by 15%. Explain how you would diagnose the miss, communicate with your manager, and rebuild momentum the following quarter.',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Describe your recovery plan in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq9',
    questionId: 9,
    label: 'Q9. Qualify a lead that looks large but unclear.',
    prompt:
      'A lead from a well-known brand requests a demo but will not share budget, timeline, or decision criteria. How would you qualify (or disqualify) this opportunity?',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Explain your qualification approach in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq10',
    questionId: 10,
    label: 'Q10. Write a post-demo follow-up email outline.',
    prompt:
      'After a successful product demo, outline the follow-up email you would send within 24 hours. Explain what to include, what to avoid, and how you would propose next steps.',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Describe the follow-up email strategy in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq11',
    questionId: 11,
    label: 'Q11. Manage a multi-stakeholder buying committee.',
    prompt:
      'Your deal involves an economic buyer, a technical evaluator, and an end-user champion who disagree on priorities. How would you navigate the buying committee toward consensus?',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Explain your stakeholder management approach in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq12',
    questionId: 12,
    label: 'Q12. Upsell without damaging trust.',
    prompt:
      'An existing customer is happy with a basic plan. Leadership wants you to upsell premium features. How would you approach the conversation so it feels helpful rather than aggressive?',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Describe your consultative upsell approach in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq13',
    questionId: 13,
    label: 'Q13. Respond when a competitor is already selected.',
    prompt:
      'A prospect tells you they have verbally selected a competitor but the contract is not signed. What would you do in the next 48 hours?',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Explain your competitive response plan in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq14',
    questionId: 14,
    label: 'Q14. Balance pipeline activity and deep deal work.',
    prompt:
      'You have too many early-stage leads and not enough late-stage deals. Describe how you would rebalance your calendar for the next two weeks.',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Outline your time-allocation strategy in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq15',
    questionId: 15,
    label: 'Q15. Handle an angry customer escalation.',
    prompt:
      'A renewal account threatens to cancel because onboarding was delayed. Write how you would stabilize the relationship and protect the renewal.',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Describe your retention conversation in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq16',
    questionId: 16,
    label: 'Q16. Ask for a referral the right way.',
    prompt:
      'A delighted customer just renewed for a third year. Explain when and how you would ask for referrals, including the language you would use and how you would follow up.',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Explain your referral ask process in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq17',
    questionId: 17,
    label: 'Q17. Adapt your pitch for a technical audience.',
    prompt:
      'You usually sell to commercial leaders, but tomorrow’s meeting is with two engineers and a security lead. How would you adapt your pitch, demo, and proof points?',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Describe how you would adapt for a technical audience in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq18',
    questionId: 18,
    label: 'Q18. Close ethically under end-of-quarter pressure.',
    prompt:
      'It is the last week of the quarter and your manager is pressuring you to close a hesitant deal with a discount. How would you close ethically while protecting long-term trust?',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Explain your ethical close approach in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq19',
    questionId: 19,
    label: 'Q19. Turn a lost deal into future pipeline.',
    prompt:
      'You lose a competitive deal. Describe your post-loss review process and how you would keep the account warm for a future opportunity.',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Describe your lost-deal recovery plan in at least 100 words...',
    rows: 6,
  },
  {
    id: 'wq20',
    questionId: 20,
    label: 'Q20. Define success metrics for your first 90 days.',
    prompt:
      'You are starting a new sales role next month. Outline the activity metrics and outcome metrics you would track in your first 90 days, and why each matters.',
    minWords: WRITING_MIN_WORDS,
    maxWords: 300,
    placeholder: 'Explain your first-90-days metrics plan in at least 100 words...',
    rows: 6,
  },
];

/** @deprecated Prefer SALES_QUESTION_BANK; kept for existing imports. */
export const SALES_QUESTIONS = SALES_QUESTION_BANK;

export function getSalesWordLimits() {
  return Object.fromEntries(
    SALES_QUESTION_BANK.map((q) => [q.id, { minWords: q.minWords, maxWords: q.maxWords }])
  );
}
