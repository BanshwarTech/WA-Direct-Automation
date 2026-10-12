import { useEffect, useState } from 'react';

export type Route = 'home' | 'send' | 'ai' | 'scripts' | 'help' | 'login' | 'register';

const ROUTES: Route[] = ['home', 'send', 'ai', 'scripts', 'help', 'login', 'register'];

// Pages that need an account
export const PROTECTED_ROUTES: Route[] = ['send', 'ai'];

// Pages only the admin (owner account) can open; hidden from everyone else
export const ADMIN_ROUTES: Route[] = ['scripts'];

export const pathFor = (route: Route) => (route === 'home' ? '/' : `/${route}`);

// Clean path routing (/send, /ai, ...). The server renders every non-API path (SSR),
// so deep links and refreshes work.
export function routeFromPath(pathname: string): Route | null {
  const slug = pathname.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
  if (slug === '') return 'home';
  return (ROUTES as string[]).includes(slug) ? (slug as Route) : null;
}

const readRoute = (): Route => routeFromPath(window.location.pathname) ?? 'home';

export function navigate(route: Route, query = '') {
  const path = pathFor(route) + query;
  if (window.location.pathname + window.location.search !== path) window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// initialRoute comes from the server-rendered URL so the first client render matches the SSR markup
export function useRoute(initialRoute: Route): Route {
  const [route, setRoute] = useState<Route>(initialRoute);

  useEffect(() => {
    // Upgrade old hash links (/#/send) to clean paths. Done after hydration: the server never sees the hash.
    const legacy = window.location.hash.match(/^#\/(\w*)/);
    if (legacy) {
      window.history.replaceState(null, '', legacy[1] ? `/${legacy[1]}` : '/');
      setRoute(readRoute());
    }

    const onChange = () => {
      setRoute(readRoute());
      window.scrollTo({ top: 0 });
    };

    // Turn plain same-origin <a href="/send"> clicks into client-side navigation (no full page reload)
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith('/api/')) return;
      const slug = url.pathname.replace(/^\/+|\/+$/g, '');
      if (slug !== '' && !(ROUTES as string[]).includes(slug)) return;
      e.preventDefault();
      navigate((slug || 'home') as Route, url.search);
    };

    window.addEventListener('popstate', onChange);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('popstate', onChange);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return route;
}
