import { useMemo } from 'react';
import { tokenize, type BionicToken } from '../lib/bionic';

type Props = {
  text: string;
  bionic: boolean;
  boldRatio: number;
};

export function BionicView({ text, bionic, boldRatio }: Props) {
  const nodes = useMemo(() => {
    if (!bionic) return null;
    return tokenize(text, { boldRatio }).map((tok, i) => renderToken(tok, i));
  }, [text, bionic, boldRatio]);

  if (!bionic) {
    // Plain mode — preserve whitespace via white-space:pre-wrap on the parent.
    return <>{text}</>;
  }

  return <>{nodes}</>;
}

function renderToken(tok: BionicToken, key: number) {
  if (tok.kind === 'whitespace') {
    // Preserve \n as a real line break; spaces handled by white-space:pre-wrap.
    if (tok.text.includes('\n')) {
      const parts = tok.text.split('\n');
      return (
        <span key={key}>
          {parts.map((p, j) => (
            <span key={j}>
              {p}
              {j < parts.length - 1 && <br />}
            </span>
          ))}
        </span>
      );
    }
    return <span key={key}>{tok.text}</span>;
  }
  return (
    <span key={key} className="bionic-word">
      {tok.lead}
      {tok.bold && <strong>{tok.bold}</strong>}
      {tok.rest}
      {tok.trail}
    </span>
  );
}
