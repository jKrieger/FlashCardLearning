import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createCard, getCard, updateCardContent } from '../db/cards';
import { getDeck, touchDeck } from '../db/decks';
import { useDocumentTitle } from '../util/title';

export default function CardEditor() {
  const { deckId, cardId } = useParams<{ deckId: string; cardId?: string }>();
  const navigate = useNavigate();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [loading, setLoading] = useState(true);
  const [deckName, setDeckName] = useState('');

  const pageTitle = cardId ? 'Karte bearbeiten' : 'Neue Karte';
  useDocumentTitle(pageTitle);

  useEffect(() => {
    (async () => {
      if (!deckId) return;
      const deck = await getDeck(deckId);
      if (!deck) {
        navigate('/');
        return;
      }
      setDeckName(deck.name);
      if (cardId) {
        const card = await getCard(cardId);
        if (!card) {
          navigate(`/decks/${deckId}`);
          return;
        }
        setFront(card.front);
        setBack(card.back);
      }
      setLoading(false);
    })();
  }, [deckId, cardId, navigate]);

  if (loading) return <p>Lade …</p>;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!deckId) return;
    if (!front.trim() || !back.trim()) return;
    if (cardId) {
      await updateCardContent(cardId, { front, back });
    } else {
      await createCard({ deckId, front, back });
    }
    await touchDeck(deckId);
    navigate(`/decks/${deckId}`);
  }

  return (
    <div className="card-editor">
      <Link to={`/decks/${deckId}`} className="btn btn-ghost btn-sm btn-icon-text" aria-label={`Zurück zu ${deckName}`}>
        <ArrowLeft size={18} aria-hidden="true" />
        <span>{deckName}</span>
      </Link>
      <h1>{pageTitle}</h1>
      <form onSubmit={onSubmit} className="form-card">
        <label>
          Vorderseite (Frage)
          <textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            rows={4}
            placeholder="z.B. Wie lange ist ein ID Token in der Regel gültig?"
            required
            autoFocus
          />
        </label>
        <label>
          Rückseite (Antwort)
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            rows={4}
            placeholder="z.B. 5–15 Minuten"
            required
          />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">{cardId ? 'Speichern' : 'Anlegen'}</button>
          <Link to={`/decks/${deckId}`} className="btn">Abbrechen</Link>
        </div>
      </form>
    </div>
  );
}
