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
  return (
    <button
      ref={ref}
      type="button"
      className={`flipcard ${flipped ? 'is-flipped' : ''}`}
      onClick={onFlip}
      aria-pressed={flipped}
      aria-label={flipped ? `Antwort: ${back}. Klicken, um zur Frage zurückzukehren.` : `Frage: ${front}. Klicken, um die Antwort zu sehen.`}
    >
      <span className="flipcard-inner" aria-hidden="true">
        <span className="flipcard-face flipcard-face-front">
          <span className="flipcard-label">Frage</span>
          <span className="flipcard-content">{front}</span>
        </span>
        <span className="flipcard-face flipcard-face-back">
          <span className="flipcard-label">Antwort</span>
          <span className="flipcard-content">{back}</span>
        </span>
      </span>
    </button>
  );
});

export default FlipCard;
