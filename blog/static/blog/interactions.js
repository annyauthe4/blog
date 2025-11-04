// ===== main.js =====

// Base API URL (adjust for your setup)
const API_BASE = "https://blog-1-q1d5.onrender.com/api/";

// Helper: Get stored JWT tokens from localStorage
function getAccessToken() {
  return localStorage.getItem("access_token");
}

function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

// Helper: Set Authorization header for requests
function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getAccessToken()}`
  };
}

// ========== FETCH POSTS ==========
async function loadPosts(page = 1) {
  try {
    const response = await fetch(`${API_BASE}posts/?page=${page}`);
    if (!response.ok) throw new Error("Failed to fetch posts");
    const data = await response.json();

    const postsContainer = document.getElementById("posts-container");
    data.results.forEach(post => {
      const postCard = `
        <article class="col-12 col-md-6 post-card p-3 shadow-sm rounded">
          <div class="d-flex align-items-center mb-2">
            <img src="${post.author.profile_image || '/static/images/default.jpg'}"
                 alt="${post.author.username}"
                 class="rounded-circle" style="width:50px;height:50px;">
            <div class="ms-3">
              <h3 class="mb-1">
                <a href="#" class="text-decoration-none">${post.title}</a>
              </h3>
              <small class="text-muted">
                Posted on ${new Date(post.date_posted).toLocaleDateString()} by 
                ${post.author.username}
              </small>
            </div>
          </div>
          <p>${post.content.slice(0, 150)}...</p>

          <div class="d-flex justify-content-between align-items-center">
            <button class="btn btn-outline-primary like-btn" data-post="${post.id}">
              ❤️ ${post.likes_count || 0}
            </button>
            <small class="text-muted">${post.comments_count || 0} comments</small>
          </div>
        </article>
      `;
      postsContainer.insertAdjacentHTML("beforeend", postCard);
    });

    // Handle pagination
    if (!data.next) {
      document.getElementById("load-more").style.display = "none";
    }
  } catch (err) {
    console.error("Error loading posts:", err);
  }
}

// ========== POST DETAIL HANDLER ==========
async function loadPostDetail() {
  const postContainer = document.getElementById("post-container");
  if (!postContainer) return;

  const postId = postContainer.dataset.postId;

  try {
    // Fetch post
    const postRes = await fetch(`${API_BASE}posts/${postId}/`);
    if (!postRes.ok) throw new Error("Failed to fetch post");
    const post = await postRes.json();

    // Render post content
    document.getElementById("post-content").innerHTML = `
      <div class="d-flex align-items-center mb-3">
        <img src="${post.author.profile_image || '/static/images/default.jpg'}"
             alt="${post.author.username}"
             class="rounded-circle" style="width:50px;height:50px;">
        <div class="ms-3">
          <h2 class="mb-1">${post.title}</h2>
          <small class="text-muted">Posted on ${new Date(post.date_posted).toLocaleDateString()} by ${post.author.username}</small>
        </div>
      </div>
      ${post.image ? `<img src="${post.image}" alt="${post.title}" class="w-100 rounded mb-4">` : ""}
      <p>${post.content}</p>
    `;

    // Update like count
    const likeBtn = document.getElementById("like-btn");
    likeBtn.dataset.post = post.id;
    document.getElementById("like-count").textContent = post.likes_count || 0;

    // Highlight like if user liked
    if (post.user_liked) {
      likeBtn.classList.remove("btn-outline-primary");
      likeBtn.classList.add("btn-primary");
    }

    // Load comments
    loadComments(postId);

    // Attach comment form postId
    const commentForm = document.getElementById("comment-form");
    if (commentForm) commentForm.dataset.post = post.id;

  } catch (err) {
    console.error("Error loading post:", err);
    document.getElementById("post-content").innerHTML = `<p class="text-danger text-center">Failed to load post.</p>`;
  }
}

// ===== LIKE POST =====
async function toggleLike(postId) {
  try {
    const response = await fetch(`${API_BASE}posts/${postId}/toggle_like/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({})
    });

    if (!response.ok) throw new Error("Failed to toggle like");

    const data = await response.json();
    const likeBtn = document.getElementById("like-btn");
    document.getElementById("like-count").textContent = data.likes_count;

    likeBtn.classList.toggle("btn-primary", data.liked);
    likeBtn.classList.toggle("btn-outline-primary", !data.liked);
  } catch (err) {
    console.error("Like toggle failed:", err);
  }
}

// ========== COMMENTS ==========
async function loadComments(postId) {
  try {
    const res = await fetch(`${API_BASE}posts/${postId}/comments/`);
    if (!res.ok) throw new Error("Failed to load comments");
    const data = await res.json();

    const commentList = document.getElementById("comment-list");
    commentList.innerHTML = "";

    if (data.length === 0) {
      commentList.innerHTML = `<li class="list-group-item text-center text-muted">No comments yet.</li>`;
    } else {
      data.forEach(comment => {
        commentList.insertAdjacentHTML("beforeend", `
          <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="d-flex align-items-center gap-3">
              <img src="${comment.author.profile_image || '/static/images/default.jpg'}" class="rounded-circle" style="width:40px;height:40px;">
              <div>
                <p class="fw-bold mb-1">${comment.author.username}</p>
                <p class="mb-0">${comment.content}</p>
              </div>
            </div>
            <small class="text-muted">${new Date(comment.created_at).toLocaleString()}</small>
          </li>
        `);
      });
    }

    document.getElementById("comment-count").textContent = data.length;

  } catch (err) {
    console.error("Error loading comments:", err);
  }
}

// ========== ADD COMMENT ==========
async function submitComment(postId, content) {
  try {
    const response = await fetch(`${API_BASE}posts/${postId}/comments/`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error("Failed to add comment");

    await response.json();
    loadComments(postId); // refresh comment list
  } catch (err) {
    console.error("Comment submission failed:", err);
  }
}

// Event: comment form submit
document.addEventListener("submit", function (e) {
  if (e.target.id === "comment-form") {
    e.preventDefault();
    const form = e.target;
    const postId = form.dataset.post;
    const content = form.querySelector("[name='content']").value.trim();
    if (content) {
      submitComment(postId, content);
      form.reset();
    }
  }
});

// Event: like toggle
document.addEventListener("click", function (e) {
  if (e.target.closest("#like-btn")) {
    const btn = e.target.closest("#like-btn");
    const postId = btn.dataset.post;
    toggleLike(postId, btn);
  }
});

// Load post when DOM ready
document.addEventListener("DOMContentLoaded", loadPostDetail);

// ===== LOGIN (get JWT) =====
async function loginUser(username, password) {
  try {
    const response = await fetch(`${API_BASE}token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) throw new Error("Login failed");

    const data = await response.json();
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    alert("Login successful!");
  } catch (err) {
    console.error("Login error:", err);
    alert("Invalid credentials");
  }
}

// ===== LOGOUT =====
function logoutUser() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  alert("Logged out!");
}

// ===== DOM EVENTS =====
document.addEventListener("DOMContentLoaded", function () {
  const likeBtn = document.getElementById("like-btn");
  const commentForm = document.getElementById("comment-form");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");

  if (likeBtn) {
    likeBtn.addEventListener("click", function () {
      toggleLike(likeBtn.dataset.post);
    });
  }

  if (commentForm) {
    commentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const content = document.getElementById("comment-content").value.trim();
      if (content) {
        addComment(commentForm.dataset.post, content);
        document.getElementById("comment-content").value = "";
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      loginUser(username, password);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutUser);
  }
});
