import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateIeltsPteBand } from '../services/bandCalculator.js';
import { PASSING_MARK } from '../config/assessment.js';

describe('calculateIeltsPteBand', () => {
  it('returns the pass band at the passing mark', () => {
    assert.match(calculateIeltsPteBand(PASSING_MARK), /Pass/);
  });

  it('returns lower bands for scores below the pass threshold', () => {
    assert.match(calculateIeltsPteBand(PASSING_MARK - 1), /Modest|Limited/);
  });

  it('returns higher bands for strong scores', () => {
    assert.match(calculateIeltsPteBand(47), /Expert/);
  });
});
