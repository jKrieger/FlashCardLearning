import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useDocumentTitle } from '../util/title';
import { isSupabaseConfigured } from '../api/supabase';

type Mode = 'signin' | 'signup' | 'reset';

interface LocationState {
  from?: { pathname?: string };
}

export default function Login() {
  const { session, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useDocumentTitle(
    mode === 'signin' ? 'Anmelden' : mode === 'signup' ? 'Registrieren' : 'Passwort zurücksetzen'
  );

  if (session) {
    const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/';
    return <Navigate to={redirectTo} replace />;
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        navigate('/', { replace: true });
      } else if (mode === 'signup') {
        const { needsConfirmation } = await signUp(email, password);
        if (needsConfirmation) {
          setInfo(
            'Konto angelegt. Bitte bestätige zuerst deine E-Mail-Adresse über den Link, den wir dir geschickt haben.'
          );
        } else {
          navigate('/', { replace: true });
        }
      } else {
        await resetPassword(email);
        setInfo('Wir haben dir eine E-Mail zum Zurücksetzen deines Passworts geschickt.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aktion fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  }

  const submitLabel =
    mode === 'signin' ? 'Einloggen' : mode === 'signup' ? 'Registrieren' : 'Link senden';

  return (
    <div className="login">
      <h1>Karteikarten</h1>

      {!isSupabaseConfigured && (
        <div className="alert alert-error" role="alert">
          Supabase ist nicht konfiguriert. Lege eine <code>.env</code>-Datei mit{' '}
          <code>VITE_SUPABASE_URL</code> und <code>VITE_SUPABASE_ANON_KEY</code> an und starte den
          Dev-Server neu.
        </div>
      )}

      <div className="tabs" role="tablist" aria-label="Anmelde-Modus">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          className={`tab ${mode === 'signin' ? 'is-active' : ''}`}
          onClick={() => switchMode('signin')}
        >
          Anmelden
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          className={`tab ${mode === 'signup' ? 'is-active' : ''}`}
          onClick={() => switchMode('signup')}
        >
          Registrieren
        </button>
      </div>

      <form onSubmit={onSubmit} className="form-card" noValidate>
        <label>
          E-Mail
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>

        {mode !== 'reset' && (
          <label>
            Passwort
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
        )}

        {mode === 'signup' && (
          <p className="muted small">
            Mit der Registrierung beginnst du frisch. Falls du bereits Karten lokal angelegt hast,
            kannst du sie unter „Exportieren" sichern, bevor du dich einloggst.
          </p>
        )}

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
        {info && (
          <div className="alert alert-success" role="status">
            {info}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? '…' : submitLabel}
        </button>

        <div className="login-links">
          {mode === 'signin' ? (
            <button type="button" className="btn btn-link" onClick={() => switchMode('reset')}>
              Passwort vergessen?
            </button>
          ) : (
            <button type="button" className="btn btn-link" onClick={() => switchMode('signin')}>
              Zurück zur Anmeldung
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
