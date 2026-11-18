/**
 * Resolve API root for local, LAN, and separate-host deploys.
 *
 * - VITE_API_URL set → use it (build-time / .env)
 * - VITE_API_URL="" → same-origin relative `/api` (reverse proxy)
 * - unset → same hostname as the page, port 3010 (LAN / split ports)
 */
export function getApiRoot() {
  const configured = import.meta.env.VITE_API_URL;

  if (configured !== undefined && configured !== null) {
    const trimmed = String(configured).trim();
    if (trimmed === '' || trimmed === '/') return '';
    return trimmed.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.hostname) {
    const { protocol, hostname } = window.location;
    const apiPort = import.meta.env.VITE_API_PORT || '3010';
    return `${protocol}//${hostname}:${apiPort}`;
  }

  return 'http://localhost:3010';
}

export function getApiBase() {
  const root = getApiRoot();
  return root ? `${root}/api` : '/api';
}
