const TOKEN_KEY = 'adminToken';
const USER_KEY = 'adminUsername';

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminSession(token, username) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, username);
}

export function clearAdminSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getStoredUsername() {
  return sessionStorage.getItem(USER_KEY);
}
