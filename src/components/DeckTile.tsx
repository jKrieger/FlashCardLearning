import { Link } from 'react-router-dom';
import type { Deck, DeckStats } from '../domain/types';
import ProgressBar from './ProgressBar';
import { cardWord } from '../util/format';

interface Props {
  deck: Deck;
  stats: DeckStats;
}

export default function DeckTile({ deck, stats }: Props) {
  return (
    <Link to={`/decks/${deck.id}`} className="deck-tile">
      <div className="deck-tile-head">
        <h3>{deck.name}</h3>
        {deck.description && <p className="deck-tile-desc">{deck.description}</p>}
      </div>
      <ProgressBar stats={stats} showLabels={false} />
      <div className="deck-tile-foot">
        <span>{cardWord(stats.total)}</span>
        <span>{stats.masteredCount} sicher</span>
        <span>{stats.newCount} neu</span>
      </div>
    </Link>
  );
}
