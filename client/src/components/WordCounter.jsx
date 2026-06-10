import { countWords } from '../utils/wordCount';

export default function WordCounter({ text, maxWords }) {
  const words = countWords(text);
  const over = words > maxWords;
  const near = words > maxWords * 0.9 && !over;

  return (
    <p
      className={`text-sm mt-1 ${
        over ? 'text-red-600 font-medium' : near ? 'text-amber-600' : 'text-slate-500'
      }`}
    >
      {words} / {maxWords} words
      {over && ' — exceeds limit; submission blocked'}
    </p>
  );
}
