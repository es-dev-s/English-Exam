const PORTAL_KEY = 'selectedPortal';

export const PORTALS = {
  CANDIDATE: 'candidate',
  ADMIN: 'admin',
};

export function getSelectedPortal() {
  return sessionStorage.getItem(PORTAL_KEY);
}

export function setSelectedPortal(portal) {
  sessionStorage.setItem(PORTAL_KEY, portal);
}

export function clearSelectedPortal() {
  sessionStorage.removeItem(PORTAL_KEY);
}

export function clearCandidateSession() {
  sessionStorage.removeItem('candidate');
  sessionStorage.removeItem('lastResult');
}

export function switchPortal() {
  clearSelectedPortal();
  clearCandidateSession();
}
