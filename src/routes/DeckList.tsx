import { useEffect, useRef, useState } from 'react';
import { createDeck, listDecks } from '../db/decks';
import { listCards } from '../db/cards';
import { computeDeckStats } from '../domain/stats';
import type { Deck, DeckStats } from '../domain/types';
import DeckTile from '../components/DeckTile';
import { importDeckFromFile } from '../util/jsonIO';
import { useDocumentTitle } from '../util/title';

interface DeckRow {
  deck: Deck;
  stats: DeckStats;
}

export default function DeckList() {
  useDocumentTitle('Deine Stapel');
  const [rows, setRows] = useState<DeckRow[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createDeck({ name, description });
    setName('');
    setDescription('');
    setShowForm(false);
    await refresh();
  }

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      await importDeckFromFile(file);
      await refresh();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import fehlgeschlagen');
    } finally {
      e.target.value = '';
    }
  }

  if (rows === null) return <p>Lade …</p>;

  return (
    <div className="decklist">
      <div className="decklist-toolbar">
        <h1>Deine Stapel</h1>
        <div className="toolbar-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Importieren
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={onImport}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Abbrechen' : 'Neuer Stapel'}
          </button>
        </div>
      </div>

      {importError && <div className="alert alert-error" role="alert">{importError}</div>}

      {showForm && (
        <form className="form-card" onSubmit={onCreate}>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. OIDC/OAuth2"
              autoFocus
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
          <p>Lege deinen ersten Karteikartenstapel an — oder importiere einen vorhandenen JSON-Export.</p>
          <div className="empty-state-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>Neuen Stapel anlegen</button>
            <button className="btn" onClick={() => fileInputRef.current?.click()}>JSON importieren</button>
          </div>
        </div>
      ) : (
        <div className="deck-grid">
          {rows.map(({ deck, stats }) => (
            <DeckTile key={deck.id} deck={deck} stats={stats} />
          ))}
        </div>
      )}
    </div>
  );
}
