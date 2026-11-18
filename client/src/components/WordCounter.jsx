import { countWords } from '../utils/wordCount';

export default function WordCounter({ text, minWords = 0, maxWords }) {
  const words = countWords(text);
  const over = typeof maxWords === 'number' && words > maxWords;
  const underRecommended = minWords > 0 && text.trim() && words < minWords;
  const nearMax = typeof maxWords === 'number' && words > maxWords * 0.9 && !over;
  const nearMin = minWords > 0 && words >= minWords * 0.85 && words < minWords;

  let message = '';
  if (over) message = ' — exceeds limit; submission blocked';
  else if (underRecommended) message = ` — under recommended ${minWords} words (still allowed)`;
  else if (nearMin) message = ' — approaching recommended minimum';

  const rangeLabel =
    minWords > 0 && typeof maxWords === 'number'
      ? `${minWords}–${maxWords}`
      : minWords > 0
        ? `min ${minWords}`
        : `${maxWords}`;

  return (
    <p
      className={`text-sm mt-1 ${
        over
          ? 'text-red-600 font-medium'
          : underRecommended || nearMax || nearMin
            ? 'text-amber-600'
            : 'text-slate-500'
      }`}
    >
      {words} / {rangeLabel} words
      {message}
    </p>
  );
}
