import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gradeTyping } from '../services/typingGrader.js';

describe('gradeTyping', () => {
  it('awards full marks when WPM and accuracy targets are met', () => {
    const source = Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ');
    // ~50 words => need elapsed such that WPM >= 25 => minutes <= 2 => seconds <= 120
    // correctChars/5 / minutes >= 25
    const result = gradeTyping({
      typedText: source,
      sourceText: source,
      elapsedSeconds: 60,
    });

    assert.equal(result.meets_requirement, true);
    assert.equal(result.typing_score, 5);
    assert.ok(result.wpm >= 25);
    assert.ok(result.accuracy >= 90);
  });

  it('returns zero for empty typing', () => {
    const result = gradeTyping({ typedText: '', sourceText: 'hello world', elapsedSeconds: 30 });
    assert.equal(result.typing_score, 0);
  });
});
