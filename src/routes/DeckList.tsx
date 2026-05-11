import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createDeck, listDecks } from '../db/decks';
import { listCards } from '../db/cards';
import { computeDeckStats } from '../domain/stats';
import type { Deck, DeckStats } from '../domain/types';
import DeckTile from '../components/DeckTile';
import { useDocumentTitle } from '../util/title';
import { DATA_CHANGED_EVENT } from '../App';

interface DeckRow {
  deck: Deck;
  stats: DeckStats;
}

export default function DeckList() {
  useDocumentTitle('Deine Stapel');
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState<DeckRow[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    const decks = await listDecks();
    const enriched = await Promise.all(
      decks.map(async (deck) => ({
        deck,
        stats: computeDeckStats(await listCards(deck.id))
      }))
    );
    setRows(enriched);
  }

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(DATA_CHANGED_EVENT, handler);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, handler);
  }, []);

  // FAB triggers form via ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowForm(true);
      const params = new URLSearchParams(searchParams);
      params.delete('new');
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (showForm) nameInputRef.current?.focus();
  }, [showForm]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createDeck({ name, description });
    setName('');
    setDescription('');
    setShowForm(false);
    await refresh();
  }

  if (rows === null) return <p>Lade …</p>;

  return (
    <div className="decklist">
      <header className="page-header">
        <h1>Deine Stapel</h1>
      </header>

      {showForm && (
        <form className="form-card" onSubmit={onCreate}>
          <label>
            Name
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. OIDC/OAuth2"
              required
            />
          </label>
          <label>
            Beschreibung (optional)
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Worum geht's?"
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Anlegen</button>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Abbrechen</button>
          </div>
        </form>
      )}

      {rows.length === 0 ? (
        <div className="empty-state">
          <h2>Noch keine Stapel</h2>
          <p>Tippe auf das <strong>+</strong> unten, um deinen ersten Stapel anzulegen — oder importiere oben einen JSON-Export.</p>
        </div>
      ) : (
        <ul className="deck-list">
          {rows.map(({ deck, stats }) => (
            <li key={deck.id}>
              <DeckTile deck={deck} stats={stats} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
