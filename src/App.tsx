import { useRef, useState } from 'react';
import { Link, Route, Routes, useMatch, useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import DeckList from './routes/DeckList';
import DeckDetail from './routes/DeckDetail';
import Study from './routes/Study';
import CardEditor from './routes/CardEditor';
import Info from './routes/Info';
import BottomNav from './components/BottomNav';
import { importDeckFromFile } from './util/jsonIO';

export const DATA_CHANGED_EVENT = 'flashcards:dataChanged';

function ImportButton() {
  const ref = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Hide on immersive routes
  const studyMatch = useMatch('/decks/:deckId/study');
  const newCardMatch = useMatch('/decks/:deckId/cards/new');
  const editCardMatch = useMatch('/decks/:deckId/cards/:cardId/edit');
  if (studyMatch || newCardMatch || editCardMatch) return null;

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      await importDeckFromFile(file);
      window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT));
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import fehlgeschlagen');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-icon btn-sm"
        onClick={() => ref.current?.click()}
        aria-label="JSON-Stapel importieren"
        title="JSON importieren"
      >
        <Upload size={18} aria-hidden="true" />
      </button>
      <input
        ref={ref}
        type="file"
        accept="application/json,.json"
        onChange={onChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      {error && (
        <div className="toast toast-error" role="alert">
          {error}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setError(null)}
            aria-label="Fehlermeldung schließen"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <div className="app">
      <a className="skip-link" href="#main">Zum Hauptinhalt springen</a>
      <header className="app-header">
        <Link to="/" className="app-title">Karteikarten</Link>
        <ImportButton />
      </header>
      <main id="main" className="app-main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<DeckList />} />
          <Route path="/info" element={<Info />} />
          <Route path="/decks/:deckId" element={<DeckDetail />} />
          <Route path="/decks/:deckId/study" element={<Study />} />
          <Route path="/decks/:deckId/cards/new" element={<CardEditor />} />
          <Route path="/decks/:deckId/cards/:cardId/edit" element={<CardEditor />} />
          <Route path="*" element={<p>Seite nicht gefunden.</p>} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
