import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { routeFromPath, pathFor } from './hooks/useRoute';
import { PAGE_META } from './seo';
import type { AuthState } from './auth/AuthContext';

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Server-side render for one request: full page markup plus the per-page <head> tags.
export function render(url: string, origin: string, auth: AuthState) {
  const matched = routeFromPath(url);
  const route = matched ?? 'home';
  const meta = PAGE_META[route];
  const canonical = `${origin}${pathFor(route)}`;

  const html = renderToString(
    <StrictMode>
      <App initialRoute={route} initialAuth={auth} />
    </StrictMode>
  );

  const head = [
    `<title>${escapeAttr(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
    `<link rel="canonical" href="${escapeAttr(canonical)}" />`,
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    matched ? '' : '<meta name="robots" content="noindex" />',
    route === 'login' || route === 'register' ? '<meta name="robots" content="noindex, follow" />' : '',
    // Auth state for hydration; "<" is escaped so user-provided names cannot close the script tag
    `<script>window.__AUTH__=${JSON.stringify(auth).replace(/</g, '\\u003c')}</script>`,
  ]
    .filter(Boolean)
    .join('\n    ');

  return { html, head, status: matched ? 200 : 404 };
}
