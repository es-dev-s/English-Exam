export function countWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

export function isWithinWordLimit(text, maxWords) {
  return countWords(text) <= maxWords;
}

export function meetsMinWords(text, minWords) {
  return countWords(text) >= minWords;
}
