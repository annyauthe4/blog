async function loadPosts(page = 1) {
  const res = await fetch(`${API_BASE}posts/?page=${page}`);
  const data = await res.json();

  const container = document.getElementById("posts-container");

  data.results.forEach(post => {
    container.insertAdjacentHTML("beforeend", `
      <article class="col-12 col-md-6 p-3 shadow-sm rounded">
        <h3><a href="/post/${post.id}/">${post.title}</a></h3>
        <p>${post.content.slice(0, 150)}...</p>
      </article>
    `);
  });

  if (!data.next) document.getElementById("load-more").style.display = "none";
}

async function loadPostDetail() {
  const container = document.getElementById("post-container");
  const id = container.dataset.postId;

  const res = await fetch(`${API_BASE}posts/${id}/`);
  const post = await res.json();

  document.getElementById("post-content").innerHTML = `
    <h2>${post.title}</h2>
    <p>${post.content}</p>
  `;

  document.getElementById("like-btn").dataset.post = id;
  document.getElementById("like-count").textContent = post.likes_count;

  loadComments(id);
}

async function toggleLike(postId) {
  const res = await fetch(`${API_BASE}posts/${postId}/toggle_like/`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });

  const data = await res.json();
  document.getElementById("like-count").textContent = data.count;
}
