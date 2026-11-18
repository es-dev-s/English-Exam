import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LISTENING_BANK } from '../data/listening.bank.js';
import { buildListeningReport, gradeListening } from '../services/listeningGrader.js';

describe('gradeListening', () => {
  it('awards 1 mark per correct answer for a dialogue', () => {
    const dialogue = LISTENING_BANK[0];
    const { listening_score, breakdown } = gradeListening(
      {
        '1': dialogue.answerKey[1],
        '2': 'Z',
      },
      dialogue.id
    );

    assert.equal(listening_score, 1);
    assert.equal(breakdown.find((item) => item.id === 1)?.correct, true);
    assert.equal(breakdown.find((item) => item.id === 2)?.correct, false);
  });

  it('builds an admin listening report', () => {
    const dialogue = LISTENING_BANK[0];
    const { breakdown } = gradeListening({ '1': dialogue.answerKey[1] }, dialogue.id);
    const report = buildListeningReport(breakdown, dialogue.id);

    assert.equal(report[0].is_correct, true);
    assert.equal(report[0].max_marks, 1);
    assert.ok(report[0].question.length > 0);
  });
});
