export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function isWithinLimit(text, maxWords) {
  return countWords(text) <= maxWords;
}

export function meetsMinWords(text, minWords) {
  return countWords(text) >= minWords;
}

export function isValidWordRange(text, { minWords = 0, maxWords = Infinity } = {}) {
  const words = countWords(text);
  if (!text.trim()) return true; // blank allowed at type-time; submit may require min
  return words >= minWords && words <= maxWords;
}
