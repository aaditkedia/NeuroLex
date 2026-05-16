// Port of TextProcessor.java to TypeScript. Returns an array of React-renderable
// tokens instead of an HTML string — keeps the output XSS-safe without manual
// escaping, and makes it trivial to style with CSS.

export type BionicToken =
  | { kind: 'whitespace'; text: string }
  | { kind: 'word'; lead: string; bold: string; rest: string; trail: string };

export type BionicOptions = {
  /** Fraction of the core word that gets bolded, 0..1. Default 0.5. */
  boldRatio?: number;
};

const DEFAULT_BOLD_RATIO = 0.5;

function isLetterOrDigit(ch: string): boolean {
  return /[\p{L}\p{N}]/u.test(ch);
}

/**
 * Tokenize text into a stream of whitespace runs and word tokens (with the
 * bionic split already computed). Matches the Java algorithm but:
 *   - Lets the caller set the bold fraction (Java was hard-coded to half).
 *   - Strips leading + trailing punctuation off a word to find its core,
 *     then bolds only the core's first N letters; punctuation stays plain.
 *   - Newlines + tabs are preserved as whitespace tokens (caller decides
 *     how to render them).
 */
export function tokenize(text: string, opts: BionicOptions = {}): BionicToken[] {
  if (!text) return [];
  const ratio = clamp01(opts.boldRatio ?? DEFAULT_BOLD_RATIO);
  const out: BionicToken[] = [];

  let i = 0;
  while (i < text.length) {
    const ch = text[i]!;
    if (/\s/.test(ch)) {
      // Coalesce a run of whitespace so renderer can decide how to emit it.
      let j = i;
      while (j < text.length && /\s/.test(text[j]!)) j++;
      out.push({ kind: 'whitespace', text: text.slice(i, j) });
      i = j;
      continue;
    }

    // Accumulate a non-whitespace run.
    let j = i;
    while (j < text.length && !/\s/.test(text[j]!)) j++;
    const word = text.slice(i, j);
    i = j;

    out.push(splitWord(word, ratio));
  }

  return out;
}

function splitWord(word: string, ratio: number): BionicToken {
  // Find core word boundaries (strip leading/trailing punctuation).
  let start = 0;
  let end = word.length;
  while (start < end && !isLetterOrDigit(word[start]!)) start++;
  while (end > start && !isLetterOrDigit(word[end - 1]!)) end--;

  // No letters/digits at all — render the whole token unbolded.
  if (start >= end) {
    return { kind: 'word', lead: word, bold: '', rest: '', trail: '' };
  }

  const lead = word.slice(0, start);
  const core = word.slice(start, end);
  const trail = word.slice(end);

  if (core.length <= 1) {
    // Tiny core — bold the whole thing.
    return { kind: 'word', lead, bold: core, rest: '', trail };
  }

  // Round up the split so a 50/50 word like "reading" goes "read|ing".
  const splitIndex = Math.max(1, Math.min(core.length - 1, Math.ceil(core.length * ratio)));
  return {
    kind: 'word',
    lead,
    bold: core.slice(0, splitIndex),
    rest: core.slice(splitIndex),
    trail,
  };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return DEFAULT_BOLD_RATIO;
  return Math.max(0.05, Math.min(0.95, n));
}
