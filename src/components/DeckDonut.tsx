import type { DeckStats } from '../domain/types';

interface Props {
  stats: DeckStats;
  size?: number;
  stroke?: number;
}

const TAU = 2 * Math.PI;

export default function DeckDonut({ stats, size = 96, stroke = 10 }: Props) {
  const { total, newCount, learningCount, masteredCount, masteredPercent } = stats;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = TAU * radius;

  if (total === 0) {
    return (
      <div className="deck-donut" style={{ width: size, height: size }} aria-hidden="true">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--surface-muted)"
            strokeWidth={stroke}
          />
        </svg>
        <span className="deck-donut-label deck-donut-label-empty">neu</span>
      </div>
    );
  }

  const fractions = [
    { value: masteredCount / total, color: 'var(--mastered)' },
    { value: learningCount / total, color: 'var(--learning)' },
    { value: newCount / total, color: 'var(--new)' }
  ];

  let cumulative = 0;
  const segments = fractions
    .filter((f) => f.value > 0)
    .map((f, idx) => {
      const dash = f.value * circumference;
      const gap = circumference - dash;
      const offset = -cumulative * circumference;
      cumulative += f.value;
      return (
        <circle
          key={idx}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={f.color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={offset}
          strokeLinecap="butt"
        />
      );
    });

  const valueText = `${masteredPercent} Prozent sicher: ${masteredCount} sicher, ${learningCount} im Lernen, ${newCount} neu`;

  return (
    <div className="deck-donut" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={valueText}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--surface-muted)"
          strokeWidth={stroke}
        />
        {segments}
      </svg>
      <span className="deck-donut-label" aria-hidden="true">
        <strong>{masteredPercent}</strong>
        <span className="deck-donut-unit">%</span>
      </span>
    </div>
  );
}
