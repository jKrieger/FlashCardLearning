import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { getDeck } from '../db/decks';
import { listCards, saveCard } from '../db/cards';
import { applyAnswer, pickNextCard } from '../domain/algorithm';
import { computeDeckStats } from '../domain/stats';
import type { Card, Deck, DeckStats } from '../domain/types';
import FlipCard from '../components/FlipCard';
import ProgressBar from '../components/ProgressBar';
import { useDocumentTitle } from '../util/title';

export default function Study() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<DeckStats | null>(null);
  const [current, setCurrent] = useState<Card | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [sessionSeen, setSessionSeen] = useState(0);
  const [sessionRight, setSessionRight] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [announce, setAnnounce] = useState('');
  const flipCardRef = useRef<HTMLButtonElement>(null);

  useDocumentTitle(deck ? `Lernen: ${deck.name}` : 'Lernen');

  useEffect(() => {
    (async () => {
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
      setCurrent(pickNextCard(c, []));
      setFlipped(false);
    })();
  }, [deckId, navigate]);

  async function answer(correct: boolean) {
    if (!current) return;
    const updated = applyAnswer(current, correct);
    await saveCard(updated);

    const nextCards = cards.map((c) => (c.id === updated.id ? updated : c));
    const nextRecent = [...recentIds, updated.id].slice(-5);
    const nextStats = computeDeckStats(nextCards);

    setCards(nextCards);
    setStats(nextStats);
    setRecentIds(nextRecent);
    setSessionSeen((n) => n + 1);
    if (correct) setSessionRight((n) => n + 1);
    else setSessionWrong((n) => n + 1);
    setAnnounce(
      `${correct ? 'Richtig' : 'Falsch'} markiert. Fortschritt: ${nextStats.masteredPercent} Prozent sicher.`
    );

    setCurrent(pickNextCard(nextCards, nextRecent));
    setFlipped(false);
    setTimeout(() => flipCardRef.current?.focus(), 0);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        navigate(`/decks/${deckId}`);
        return;
      }
      if (!flipped && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setFlipped(true);
        return;
      }
      if (flipped) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          void answer(true);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          void answer(false);
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setFlipped(false);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!deck || !stats) return <p>Lade …</p>;

  if (cards.length === 0) {
    return (
      <div className="study-empty">
        <h1>Lernen: {deck.name}</h1>
        <p>Dieser Stapel hat noch keine Karten.</p>
        <Link to={`/decks/${deck.id}/cards/new`} className="btn btn-primary">Erste Karte anlegen</Link>
        <Link to={`/decks/${deck.id}`} className="btn">Zurück zum Stapel</Link>
      </div>
    );
  }

  return (
    <div className="study">
      <div className="study-head">
        <Link to={`/decks/${deck.id}`} className="btn btn-ghost btn-sm btn-icon-text" aria-label={`Zurück zu ${deck.name}`}>
          <ArrowLeft size={18} aria-hidden="true" />
          <span>{deck.name}</span>
        </Link>
        <output className="study-session" aria-live="polite">
          {sessionSeen} gesehen · {sessionRight} richtig · {sessionWrong} falsch
        </output>
      </div>

      <h1 className="sr-only">Lernen: {deck.name}</h1>

      <ProgressBar stats={stats} />

      {stats.masteredPercent === 100 && (
        <div className="alert alert-success" role="status">
          Alle Karten in diesem Stapel sind sicher! Du kannst weiterlernen oder pausieren.
        </div>
      )}

      {current ? (
        <>
          <FlipCard
            ref={flipCardRef}
            front={current.front}
            back={current.back}
            flipped={flipped}
            onFlip={() => setFlipped((v) => !v)}
          />
          {flipped ? (
            <>
              <div className="study-actions">
                <button className="btn btn-wrong btn-icon-text" onClick={() => answer(false)}>
                  <X size={20} aria-hidden="true" strokeWidth={2.5} />
                  <span>Falsch</span>
                </button>
                <button className="btn btn-right btn-icon-text" onClick={() => answer(true)}>
                  <Check size={20} aria-hidden="true" strokeWidth={2.5} />
                  <span>Richtig</span>
                </button>
              </div>
              <p className="study-hint muted">
                Tipp: <kbd>←</kbd> falsch · <kbd>→</kbd> richtig · <kbd>Esc</kbd> zurück
              </p>
            </>
          ) : (
            <p className="study-hint muted">
              <kbd>Leertaste</kbd> oder Klick zum Umdrehen
            </p>
          )}
        </>
      ) : (
        <p>Keine Karte verfügbar.</p>
      )}

      <div className="sr-only" aria-live="polite" aria-atomic="true">{announce}</div>
    </div>
  );
}
