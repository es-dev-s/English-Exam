/**
 * Map total score (0–50) to an IELTS/PTE equivalent band descriptor.
 */
export function calculateIeltsPteBand(totalScore) {
  if (totalScore >= 47) return 'IELTS 8.5–9.0 / PTE 79–90 (Expert)';
  if (totalScore >= 43) return 'IELTS 8.0 / PTE 70–78 (Very Good)';
  if (totalScore >= 40) return 'IELTS 7.0–7.5 / PTE 65–69 (Good)';
  if (totalScore >= 35) return 'IELTS 6.0–6.5 / PTE 50–64 (Competent — Pass)';
  if (totalScore >= 30) return 'IELTS 5.5 / PTE 42–49 (Modest)';
  if (totalScore >= 25) return 'IELTS 5.0 / PTE 36–41 (Limited)';
  if (totalScore >= 20) return 'IELTS 4.5 / PTE 30–35 (Limited)';
  return 'IELTS 4.0 or below / PTE <30 (Intermittent)';
}
