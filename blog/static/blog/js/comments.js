async function loadComments(postId) {
  const res = await fetch(`${API_BASE}posts/${postId}/comments/`);
  const comments = await res.json();

  const list = document.getElementById("comment-list");
  list.innerHTML = "";

  comments.forEach(c => {
    list.insertAdjacentHTML("beforeend", `
      <li class="list-group-item">${c.author.username}: ${c.content}</li>
    `);
  });
}

async function submitComment(postId, content) {
  await fetch(`${API_BASE}posts/${postId}/comments/`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  });

  loadComments(postId);
}
