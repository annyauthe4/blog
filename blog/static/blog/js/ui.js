function updateNavbarAuthState() {
  const token = getAccessToken();

  const show = id => document.getElementById(id).classList.remove("d-none");
  const hide = id => document.getElementById(id).classList.add("d-none");

  if (token) {
    show("createPostLink");
    show("profileLink");
    show("logoutBtn");
    hide("loginLink");
    hide("registerLink");
  } else {
    hide("createPostLink");
    hide("profileLink");
    hide("logoutBtn");
    show("loginLink");
    show("registerLink");
  }
}

/* Mobile toggle */
document.getElementById("mobile-toggle")?.addEventListener("click", () => {
  document.getElementById("mobile-menu").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
});

/* Initialize navbar on load */
document.addEventListener("DOMContentLoaded", updateNavbarAuthState);
