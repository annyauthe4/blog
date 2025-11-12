// =========================
// AUTH EVENT LISTENERS
// =========================
document.addEventListener("submit", function (e) {
  // LOGIN
  if (e.target.id === "login-form") {
    e.preventDefault();
    loginUser(
      e.target.username.value,
      e.target.password.value
    );
  }

  // REGISTER
  if (e.target.id === "register-form") {
    e.preventDefault();
    registerUser(e.target);
  }
});

// LOGOUT
document.addEventListener("click", function (e) {
  if (e.target.id === "logoutBtn") {
    logoutUser();
  }
});


// =========================
// LOGIN FUNCTION
// =========================
async function loginUser(username, password) {
  try {
    const res = await fetch(`${API_BASE}token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      alert("Invalid credentials.");
      return;
    }

    const data = await res.json();

    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);

    updateNavbarAuthState();
    redirect("/"); // ✅ Correct route (your homepage)
  } catch (error) {
    console.error("Login error:", error);
  }
}


// =========================
// REGISTER FUNCTION
// Supports profile picture!
// =========================
async function registerUser(form) {
  const formData = new FormData(form);
  
  try {
    const res = await fetch(`${API_BASE}users/register/`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("Registration failed.");
      return;
    }

    alert("Registration successful! Please log in.");
    redirect("/login/");
  } catch (error) {
    console.error("Registration error:", error);
  }
}


// =========================
// LOGOUT
// =========================
function logoutUser() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  updateNavbarAuthState();
  redirect("/");
}
