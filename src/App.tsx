import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import DeckList from './routes/DeckList';
import DeckDetail from './routes/DeckDetail';
import Study from './routes/Study';
import CardEditor from './routes/CardEditor';
import Login from './routes/Login';
import ProtectedRoute from './auth/ProtectedRoute';
import { useAuth } from './auth/AuthContext';
import OfflineBanner from './components/OfflineBanner';

function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  async function onLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="user-menu">
      <span className="user-email" title={user.email ?? ''}>{user.email}</span>
      <button type="button" className="btn btn-sm" onClick={onLogout}>
        Abmelden
      </button>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <a className="skip-link" href="#main">Zum Hauptinhalt springen</a>
      <header className="app-header">
        <Link to="/" className="app-title">Karteikarten</Link>
        <UserMenu />
      </header>
      <OfflineBanner />
      <main id="main" className="app-main" tabIndex={-1}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DeckList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/decks/:deckId"
            element={
              <ProtectedRoute>
                <DeckDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/decks/:deckId/study"
            element={
              <ProtectedRoute>
                <Study />
              </ProtectedRoute>
            }
          />
          <Route
            path="/decks/:deckId/cards/new"
            element={
              <ProtectedRoute>
                <CardEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/decks/:deckId/cards/:cardId/edit"
            element={
              <ProtectedRoute>
                <CardEditor />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<p>Seite nicht gefunden.</p>} />
        </Routes>
      </main>
    </div>
  );
}
