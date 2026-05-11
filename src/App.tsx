import { Link, Route, Routes } from 'react-router-dom';
import DeckList from './routes/DeckList';
import DeckDetail from './routes/DeckDetail';
import Study from './routes/Study';
import CardEditor from './routes/CardEditor';

export default function App() {
  return (
    <div className="app">
      <a className="skip-link" href="#main">Zum Hauptinhalt springen</a>
      <header className="app-header">
        <Link to="/" className="app-title">Karteikarten</Link>
      </header>
      <main id="main" className="app-main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<DeckList />} />
          <Route path="/decks/:deckId" element={<DeckDetail />} />
          <Route path="/decks/:deckId/study" element={<Study />} />
          <Route path="/decks/:deckId/cards/new" element={<CardEditor />} />
          <Route path="/decks/:deckId/cards/:cardId/edit" element={<CardEditor />} />
          <Route path="*" element={<p>Seite nicht gefunden.</p>} />
        </Routes>
      </main>
    </div>
  );
}
