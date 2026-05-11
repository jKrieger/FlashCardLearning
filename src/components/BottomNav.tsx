import { Link, useMatch, useNavigate, useResolvedPath } from 'react-router-dom';
import { Info as InfoIcon, Layers, Plus } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

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

function NavItem({ to, icon: Icon, label }: { to: string; icon: IconType; label: string }) {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: to === '/' });
  return (
    <Link
      to={to}
      className={`bottom-nav-item ${match ? 'is-active' : ''}`}
      aria-current={match ? 'page' : undefined}
    >
      <Icon size={22} aria-hidden="true" strokeWidth={2} />
      <span className="bottom-nav-label">{label}</span>
    </Link>
  );
}

export default function BottomNav() {
  const navigate = useNavigate();
  const fab = useFabAction();

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
        <NavItem to="/" icon={Layers} label="Stapel" />
        <div className="bottom-nav-spacer" aria-hidden="true" />
        <button
          type="button"
          className="bottom-nav-fab"
          onClick={onFab}
          disabled={fabDisabled}
          aria-label={fabLabel}
          title={fabLabel}
        >
          <Plus size={26} aria-hidden="true" strokeWidth={2.5} />
        </button>
        <div className="bottom-nav-spacer" aria-hidden="true" />
        <NavItem to="/info" icon={InfoIcon} label="Info" />
      </div>
    </nav>
  );
}
