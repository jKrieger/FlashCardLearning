import { forwardRef } from 'react';

interface Props {
  front: string;
  back: string;
  flipped: boolean;
  onFlip: () => void;
}

const FlipCard = forwardRef<HTMLButtonElement, Props>(function FlipCard(
  { front, back, flipped, onFlip },
  ref
) {
  const label = flipped
    ? `Antwort: ${back}. Klicken, um zur Frage zurückzukehren.`
    : `Frage: ${front}. Klicken, um die Antwort zu sehen.`;

  return (
    <button
      ref={ref}
      type="button"
      className={`flipcard ${flipped ? 'is-flipped' : ''}`}
      onClick={onFlip}
      aria-pressed={flipped}
      aria-label={label}
    >
      <span className="flipcard-label">{flipped ? 'Antwort' : 'Frage'}</span>
      <span className="flipcard-content">{flipped ? back : front}</span>
    </button>
  );
});

export default FlipCard;
