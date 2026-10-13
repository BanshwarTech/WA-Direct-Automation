import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import { routeFromPath } from './hooks/useRoute';
import type { AuthState } from './auth/AuthContext';

declare global {
  interface Window {
    __AUTH__?: AuthState;
  }
}
import './index.css';

// The server already rendered this page; hydrate it with the same route so the markup matches
hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <App
      initialRoute={routeFromPath(window.location.pathname) ?? 'home'}
      initialAuth={window.__AUTH__ ?? { user: null, registrationOpen: true, plansEnabled: false }}
    />
  </StrictMode>
);
