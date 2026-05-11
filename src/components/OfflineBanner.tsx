import { useOnline } from '../hooks/useOnline';

export default function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className="offline-banner" role="status" aria-live="polite">
      <span aria-hidden="true">⚠️</span>
      <span>Offline — du kannst nur lesen. Änderungen funktionieren wieder, sobald die Verbindung zurück ist.</span>
    </div>
  );
}
