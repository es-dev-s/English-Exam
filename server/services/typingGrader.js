import {
  TYPING_MARKS,
  TYPING_MIN_WPM,
  TYPING_MIN_ACCURACY,
} from '../config/assessment.js';

/**
 * Grade typing performance.
 * Full marks if WPM >= 25 and accuracy >= 90%; otherwise proportional (capped).
 */
export function gradeTyping({ typedText = '', sourceText = '', elapsedSeconds = 0 } = {}) {
  const source = String(sourceText || '');
  const typed = String(typedText || '');
  const seconds = Math.max(0, Number(elapsedSeconds) || 0);

  const sourceChars = source.length;
  const typedChars = typed.length;
  let correctChars = 0;
  const compareLen = Math.max(sourceChars, typedChars);
  for (let i = 0; i < compareLen; i++) {
    if (typed[i] === source[i]) correctChars += 1;
  }

  const accuracy = typedChars === 0
    ? 0
    : Math.round((correctChars / Math.max(typedChars, sourceChars)) * 1000) / 10;

  const minutes = seconds > 0 ? seconds / 60 : 0;
  const wpm = minutes > 0
    ? Math.round(((correctChars / 5) / minutes) * 10) / 10
    : 0;

  const meetsWpm = wpm >= TYPING_MIN_WPM;
  const meetsAccuracy = accuracy >= TYPING_MIN_ACCURACY;
  let typing_score = 0;

  if (typedChars === 0 || seconds <= 0) {
    typing_score = 0;
  } else if (meetsWpm && meetsAccuracy) {
    typing_score = TYPING_MARKS;
  } else {
    const wpmRatio = Math.min(1, wpm / TYPING_MIN_WPM);
    const accRatio = Math.min(1, accuracy / TYPING_MIN_ACCURACY);
    typing_score = Math.round(TYPING_MARKS * ((wpmRatio + accRatio) / 2) * 2) / 2;
  }

  return {
    typing_score,
    wpm,
    accuracy,
    elapsed_seconds: seconds,
    meets_requirement: meetsWpm && meetsAccuracy,
    typed_length: typedChars,
    source_length: sourceChars,
  };
}
