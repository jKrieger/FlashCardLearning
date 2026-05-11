import type { DeckStats } from '../domain/types';
import { cardWord } from '../util/format';

interface Props {
  stats: DeckStats;
  showLabels?: boolean;
}

export default function ProgressBar({ stats, showLabels = true }: Props) {
  const { total, newCount, learningCount, masteredCount, masteredPercent } = stats;
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100);
  const valueText =
    total === 0
      ? 'Keine Karten im Stapel'
      : `${masteredPercent} Prozent sicher: ${masteredCount} sicher, ${learningCount} im Lernen, ${newCount} neu`;

  return (
    <div className="progress">
      <div className="progress-header">
        <span className="progress-percent">{masteredPercent}&nbsp;%&nbsp;sicher</span>
        {showLabels && <span className="progress-counts">{cardWord(total)}</span>}
      </div>
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={masteredPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={valueText}
      >
        {total === 0 ? (
          <div className="seg seg-empty" style={{ width: '100%' }} />
        ) : (
          <>
            <div className="seg seg-mastered" style={{ width: `${pct(masteredCount)}%` }} />
            <div className="seg seg-learning" style={{ width: `${pct(learningCount)}%` }} />
            <div className="seg seg-new" style={{ width: `${pct(newCount)}%` }} />
          </>
        )}
      </div>
      {showLabels && (
        <div className="progress-legend" aria-hidden="true">
          <span><i className="dot dot-mastered" />sicher ({masteredCount})</span>
          <span><i className="dot dot-learning" />im Lernen ({learningCount})</span>
          <span><i className="dot dot-new" />neu ({newCount})</span>
        </div>
      )}
    </div>
  );
}
