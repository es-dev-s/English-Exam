import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MCQ_ANSWER_KEY } from '../data/mcqs.seed.js';
import { buildMcqReport, gradeMcqs } from '../services/mcqGrader.js';

describe('gradeMcqs', () => {
  it('scores only matching answers', () => {
    const answers = {
      '1': MCQ_ANSWER_KEY[1],
      '2': 'Z',
    };

    const { mcq_score, breakdown } = gradeMcqs(answers);

    assert.equal(mcq_score, 1);
    assert.equal(breakdown.find((item) => item.id === 1)?.correct, true);
    assert.equal(breakdown.find((item) => item.id === 2)?.correct, false);
  });

  it('builds an admin report without leaking data through submit route shape', () => {
    const { breakdown } = gradeMcqs({ '1': MCQ_ANSWER_KEY[1] });
    const report = buildMcqReport(breakdown);

    assert.equal(report[0].is_correct, true);
    assert.equal(report[0].correct_answer, MCQ_ANSWER_KEY[1]);
    assert.ok(report[0].question.length > 0);
  });
});
