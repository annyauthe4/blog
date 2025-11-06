async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    alert("Login failed.");
    return;
  }

  const data = await res.json();
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);

  alert("Login successful!");

  updateNavbarAuthState();
  window.location.href = "/";
}

async function registerUser(username, email, password) {
  await fetch(`${API_BASE}users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  alert("Registration successful. You can now login.");
  window.location.href = "/login/";
}

function logoutUser() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  updateNavbarAuthState();
  window.location.reload();
}
