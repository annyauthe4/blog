const API_BASE = "https://blog-1-q1d5.onrender.com/api/";

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
function redirect(url) {
  window.location.href = url;
}
