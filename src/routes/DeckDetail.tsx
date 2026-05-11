import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteDeck, getDeck, updateDeck } from '../db/decks';
import { deleteCard, listCards } from '../db/cards';
import { computeDeckStats } from '../domain/stats';
import { getCardStatus } from '../domain/algorithm';
import type { Card, Deck, DeckStats } from '../domain/types';
import ProgressBar from '../components/ProgressBar';
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
      <div className="deck-detail-head">
        {editName ? (
          <form onSubmit={onSaveName} className="form-inline">
            <label className="sr-only" htmlFor="deck-name">Name</label>
            <input
              id="deck-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label className="sr-only" htmlFor="deck-desc">Beschreibung</label>
            <input
              id="deck-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibung"
            />
            <button type="submit" className="btn btn-primary">Speichern</button>
            <button type="button" className="btn" onClick={() => setEditName(false)}>Abbrechen</button>
          </form>
        ) : (
          <>
            <div>
              <h1>{deck.name}</h1>
              {deck.description && <p className="muted">{deck.description}</p>}
            </div>
            <div className="toolbar-actions">
              <button className="btn" onClick={() => setEditName(true)}>Umbenennen</button>
              <button className="btn" onClick={onExport}>Exportieren</button>
              <button className="btn btn-danger" onClick={() => setConfirm({ kind: 'deleteDeck' })}>Löschen</button>
            </div>
          </>
        )}
      </div>

      <ProgressBar stats={stats} />

      {hasCards ? (
        <div className="deck-actions">
          <Link to={`/decks/${deck.id}/study`} className="btn btn-primary">Lernen starten</Link>
          <Link to={`/decks/${deck.id}/cards/new`} className="btn">Karte hinzufügen</Link>
        </div>
      ) : (
        <div className="empty-state empty-state-inline">
          <p>Noch keine Karten in diesem Stapel.</p>
          <div className="empty-state-actions">
            <Link to={`/decks/${deck.id}/cards/new`} className="btn btn-primary">Erste Karte anlegen</Link>
          </div>
        </div>
      )}

      {hasCards && (
        <>
          <h2 className="section-title">Karten ({cardWord(cards.length)})</h2>
          <div className="table-scroll">
            <table className="card-table">
              <thead>
                <tr>
                  <th>Frage</th>
                  <th>Antwort</th>
                  <th>Status</th>
                  <th>Richtig / Falsch</th>
                  <th>Gewicht</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => {
                  const status = getCardStatus(card);
                  return (
                    <tr key={card.id}>
                      <td data-label="Frage" className="cell-text">{card.front}</td>
                      <td data-label="Antwort" className="cell-text">{card.back}</td>
                      <td data-label="Status">
                        <span className={`badge badge-${status}`}>
                          {status === 'new' ? 'neu' : status === 'learning' ? 'im Lernen' : 'sicher'}
                        </span>
                      </td>
                      <td data-label="Richtig / Falsch">{card.correctCount} / {card.wrongCount}</td>
                      <td data-label="Gewicht">{card.weight}</td>
                      <td data-label="Aktionen" className="cell-actions">
                        <Link to={`/decks/${deck.id}/cards/${card.id}/edit`} className="btn btn-sm">Bearbeiten</Link>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setConfirm({ kind: 'deleteCard', cardId: card.id, preview: card.front.slice(0, 60) })}
                        >
                          Löschen
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
