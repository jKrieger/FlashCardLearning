import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listDecks } from '../db/decks';
import { listCards } from '../db/cards';
import { useDocumentTitle } from '../util/title';

export default function Info() {
  useDocumentTitle('Info');
  const [deckCount, setDeckCount] = useState<number | null>(null);
  const [cardCount, setCardCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const decks = await listDecks();
      const cardCounts = await Promise.all(decks.map((d) => listCards(d.id).then((c) => c.length)));
      setDeckCount(decks.length);
      setCardCount(cardCounts.reduce((a, b) => a + b, 0));
    })();
  }, []);

  return (
    <div className="info-page">
      <header className="page-header">
        <h1>Info</h1>
      </header>

      <section className="info-card">
        <h2>Karteikarten</h2>
        <p className="muted">
          Lokale Karteikarten-App mit gewichteter Wiederholung. Alle Daten liegen in
          deinem Browser (IndexedDB). Du kannst Stapel jederzeit als JSON exportieren
          und auf anderen Geräten importieren.
        </p>
      </section>

      <section className="info-card">
        <h2>Stand</h2>
        <dl className="info-list">
          <div>
            <dt>Stapel</dt>
            <dd>{deckCount ?? '…'}</dd>
          </div>
          <div>
            <dt>Karten gesamt</dt>
            <dd>{cardCount ?? '…'}</dd>
          </div>
          <div>
            <dt>Speicherort</dt>
            <dd>IndexedDB (Browser)</dd>
          </div>
          <div>
            <dt>Theme</dt>
            <dd>Folgt System (hell / dunkel)</dd>
          </div>
        </dl>
      </section>

      <section className="info-card">
        <h2>Bedienung</h2>
        <ul className="info-bullets">
          <li><strong>Stapel-Übersicht</strong>: Tippe auf das <strong>+</strong> unten, um einen neuen Stapel anzulegen.</li>
          <li><strong>In einem Stapel</strong>: Das <strong>+</strong> legt eine neue Karte an.</li>
          <li><strong>Im Lernmodus</strong>: <kbd>Leertaste</kbd> dreht die Karte, <kbd>→</kbd> markiert richtig, <kbd>←</kbd> falsch, <kbd>Esc</kbd> beendet.</li>
          <li><strong>Export/Import</strong>: pro Stapel via „Exportieren" im Stapel und „JSON importieren" oben auf der Übersicht.</li>
        </ul>
      </section>

      <p className="muted small text-center">
        <Link to="/" className="btn btn-link">Zurück zu den Stapeln</Link>
      </p>
    </div>
  );
}
