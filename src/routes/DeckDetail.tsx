import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteDeck, getDeck, updateDeck } from '../db/decks';
import { deleteCard, listCards } from '../db/cards';
import { computeDeckStats } from '../domain/stats';
import { getCardStatus } from '../domain/algorithm';
import type { Card, Deck, DeckStats } from '../domain/types';
import DeckDonut from '../components/DeckDonut';
import ConfirmDialog from '../components/ConfirmDialog';
import { exportDeck, triggerDownload } from '../util/jsonIO';
import { useDocumentTitle } from '../util/title';
import { cardWord } from '../util/format';

type ConfirmState =
  | { kind: 'idle' }
  | { kind: 'deleteDeck' }
  | { kind: 'deleteCard'; cardId: string; preview: string };

export default function DeckDetail() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<DeckStats | null>(null);
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [confirm, setConfirm] = useState<ConfirmState>({ kind: 'idle' });

  useDocumentTitle(deck?.name);

  async function refresh() {
    if (!deckId) return;
    const d = await getDeck(deckId);
    if (!d) {
      navigate('/');
      return;
    }
    const c = await listCards(deckId);
    setDeck(d);
    setCards(c);
    setStats(computeDeckStats(c));
    setName(d.name);
    setDescription(d.description ?? '');
  }

  useEffect(() => {
    refresh();
  }, [deckId]);

  if (!deck || !stats) return <p>Lade …</p>;

  async function onSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!deck) return;
    await updateDeck(deck.id, { name, description });
    setEditName(false);
    await refresh();
  }

  async function performDeleteDeck() {
    if (!deck) return;
    await deleteDeck(deck.id);
    navigate('/');
  }

  async function performDeleteCard(id: string) {
    await deleteCard(id);
    setConfirm({ kind: 'idle' });
    await refresh();
  }

  async function onExport() {
    if (!deck) return;
    const { filename, blob } = await exportDeck(deck.id);
    triggerDownload(filename, blob);
  }

  const hasCards = cards.length > 0;

  return (
    <div className="deck-detail">
      <header className="page-header page-header-row">
        <Link to="/" className="btn btn-ghost btn-sm" aria-label="Zurück zur Stapel-Übersicht">
          ← Stapel
        </Link>
        <div className="page-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setEditName(true)}>Umbenennen</button>
          <button className="btn btn-ghost btn-sm" onClick={onExport}>Exportieren</button>
          <button
            className="btn btn-ghost btn-sm text-danger"
            onClick={() => setConfirm({ kind: 'deleteDeck' })}
          >
            Löschen
          </button>
        </div>
      </header>

      {editName ? (
        <form onSubmit={onSaveName} className="form-card">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Beschreibung
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Worum geht's?"
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Speichern</button>
            <button type="button" className="btn" onClick={() => setEditName(false)}>Abbrechen</button>
          </div>
        </form>
      ) : (
        <div className="deck-summary">
          <DeckDonut stats={stats} size={120} stroke={12} />
          <div>
            <h1>{deck.name}</h1>
            {deck.description && <p className="muted">{deck.description}</p>}
            <p className="deck-summary-meta">
              {cardWord(cards.length)} · {stats.masteredCount} sicher · {stats.learningCount} im Lernen · {stats.newCount} neu
            </p>
          </div>
        </div>
      )}

      {hasCards ? (
        <div className="deck-actions">
          <Link to={`/decks/${deck.id}/study`} className="btn btn-primary btn-block">Lernen starten</Link>
        </div>
      ) : (
        <div className="empty-state empty-state-inline">
          <p>Noch keine Karten. Tippe auf das <strong>+</strong> unten, um die erste Karte anzulegen.</p>
        </div>
      )}

      {hasCards && (
        <>
          <h2 className="section-title">Karten ({cardWord(cards.length)})</h2>
          <ul className="card-list">
            {cards.map((card) => {
              const status = getCardStatus(card);
              return (
                <li key={card.id} className="card-list-item">
                  <div className="card-list-text">
                    <div className="card-list-front">{card.front}</div>
                    <div className="card-list-back">{card.back}</div>
                    <div className="card-list-meta">
                      <span className={`badge badge-${status}`}>
                        {status === 'new' ? 'neu' : status === 'learning' ? 'im Lernen' : 'sicher'}
                      </span>
                      <span className="muted small">{card.correctCount}✓ · {card.wrongCount}✗</span>
                    </div>
                  </div>
                  <div className="card-list-actions">
                    <Link
                      to={`/decks/${deck.id}/cards/${card.id}/edit`}
                      className="btn btn-ghost btn-sm"
                      aria-label="Karte bearbeiten"
                    >
                      ✎
                    </Link>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-danger"
                      aria-label="Karte löschen"
                      onClick={() => setConfirm({ kind: 'deleteCard', cardId: card.id, preview: card.front.slice(0, 60) })}
                    >
                      🗑
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={confirm.kind === 'deleteDeck'}
        title="Stapel löschen?"
        description={`„${deck.name}" und alle ${cardWord(cards.length)} darin werden unwiderruflich gelöscht.`}
        confirmLabel="Stapel löschen"
        danger
        onConfirm={performDeleteDeck}
        onCancel={() => setConfirm({ kind: 'idle' })}
      />

      <ConfirmDialog
        open={confirm.kind === 'deleteCard'}
        title="Karte löschen?"
        description={confirm.kind === 'deleteCard' ? `„${confirm.preview}" wird unwiderruflich gelöscht.` : undefined}
        confirmLabel="Karte löschen"
        danger
        onConfirm={() => confirm.kind === 'deleteCard' && performDeleteCard(confirm.cardId)}
        onCancel={() => setConfirm({ kind: 'idle' })}
      />
    </div>
  );
}
