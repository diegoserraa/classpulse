// src/services/session.js

let logoutTimer = null;

function getTokenExpiration(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function startSessionTimer() {
  const token = localStorage.getItem("token");

  if (!token) return;

  const expiration = getTokenExpiration(token);
  if (!expiration) return;

  const now = Date.now();
  const timeLeft = expiration - now;

  if (logoutTimer) {
    clearTimeout(logoutTimer);
  }

  if (timeLeft <= 0) {
    logout();
  } else {
    logoutTimer = setTimeout(() => {
      logout();
    }, timeLeft);
  }
}

export function logout() {
  localStorage.clear();
  window.location.href = "/login";
}