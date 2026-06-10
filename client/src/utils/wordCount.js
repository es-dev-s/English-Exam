export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function isWithinLimit(text, maxWords) {
  return countWords(text) <= maxWords;
}
