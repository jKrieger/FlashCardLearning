import { useMatch, useNavigate, useResolvedPath } from 'react-router-dom';
import { Link } from 'react-router-dom';

type FabAction =
  | { kind: 'newDeck' }
  | { kind: 'newCard'; deckId: string }
  | null;

function useFabAction(): FabAction {
  const homeMatch = useMatch('/');
  const deckMatch = useMatch('/decks/:deckId');
  if (homeMatch) return { kind: 'newDeck' };
  const deckId = deckMatch?.params.deckId;
  if (deckMatch && deckId) return { kind: 'newCard', deckId };
  return null;
}

function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: to === '/' });
  return (
    <Link
      to={to}
      className={`bottom-nav-item ${match ? 'is-active' : ''}`}
      aria-current={match ? 'page' : undefined}
    >
      <span className="bottom-nav-icon" aria-hidden="true">{icon}</span>
      <span className="bottom-nav-label">{label}</span>
    </Link>
  );
}

export default function BottomNav() {
  const navigate = useNavigate();
  const fab = useFabAction();

  // Hide BottomNav on Study and CardEditor routes (immersive)
  const studyMatch = useMatch('/decks/:deckId/study');
  const newCardMatch = useMatch('/decks/:deckId/cards/new');
  const editCardMatch = useMatch('/decks/:deckId/cards/:cardId/edit');
  if (studyMatch || newCardMatch || editCardMatch) return null;

  function onFab() {
    if (!fab) return;
    if (fab.kind === 'newDeck') {
      navigate('/?new=1');
    } else if (fab.kind === 'newCard') {
      navigate(`/decks/${fab.deckId}/cards/new`);
    }
  }

  const fabDisabled = fab === null;
  const fabLabel =
    fab?.kind === 'newDeck'
      ? 'Neuen Stapel anlegen'
      : fab?.kind === 'newCard'
        ? 'Neue Karte hinzufügen'
        : 'Hinzufügen';

  return (
    <nav className="bottom-nav" aria-label="Hauptnavigation">
      <div className="bottom-nav-inner">
        <NavItem to="/" icon="🗂️" label="Stapel" />
        <div className="bottom-nav-spacer" aria-hidden="true" />
        <button
          type="button"
          className="bottom-nav-fab"
          onClick={onFab}
          disabled={fabDisabled}
          aria-label={fabLabel}
          title={fabLabel}
        >
          <span aria-hidden="true">+</span>
        </button>
        <div className="bottom-nav-spacer" aria-hidden="true" />
        <NavItem to="/info" icon="ℹ️" label="Info" />
      </div>
    </nav>
  );
}
