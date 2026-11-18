import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MCQ_ANSWER_KEY } from '../data/mcqs.seed.js';
import { buildMcqReport, gradeMcqs } from '../services/mcqGrader.js';

describe('gradeMcqs', () => {
  it('scores matching answers for a randomized pool subset', () => {
    const poolIds = [1, 2, 3];
    const answers = {
      '1': MCQ_ANSWER_KEY[1],
      '2': 'Z',
      '3': MCQ_ANSWER_KEY[3],
    };

    const { mcq_score, breakdown } = gradeMcqs(answers, poolIds);

    assert.equal(mcq_score, 2);
    assert.equal(breakdown.find((item) => item.id === 1)?.correct, true);
    assert.equal(breakdown.find((item) => item.id === 2)?.correct, false);
  });

  it('builds an admin report for pool ids', () => {
    const { breakdown } = gradeMcqs({ '1': MCQ_ANSWER_KEY[5] }, [5]);
    const report = buildMcqReport(breakdown);

    assert.equal(report[0].is_correct, true);
    assert.equal(report[0].poolId, 5);
    assert.ok(report[0].question.length > 0);
  });
});
