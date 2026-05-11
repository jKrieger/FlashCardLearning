import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Deck, DeckStats } from '../domain/types';
import DeckDonut from './DeckDonut';
import { cardWord } from '../util/format';

interface Props {
  deck: Deck;
  stats: DeckStats;
}

export default function DeckTile({ deck, stats }: Props) {
  const subtitle =
    stats.total === 0
      ? 'Noch keine Karten'
      : `${stats.masteredCount} von ${stats.total} sicher · ${stats.newCount} neu`;

  return (
    <Link to={`/decks/${deck.id}`} className="deck-tile">
      <DeckDonut stats={stats} size={88} stroke={10} />
      <div className="deck-tile-body">
        <h3 className="deck-tile-name">{deck.name}</h3>
        {deck.description && <p className="deck-tile-desc">{deck.description}</p>}
        <p className="deck-tile-meta">
          <span className="deck-tile-count">{cardWord(stats.total)}</span>
          <span className="deck-tile-sub">{subtitle}</span>
        </p>
      </div>
      <ChevronRight className="deck-tile-chevron" size={22} aria-hidden="true" />
    </Link>
  );
}
