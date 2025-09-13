// Like Button
document.querySelector("#like-btn")?.addEventListener("click", function () {
  const postId = this.dataset.post;
  fetch(`/likes/toggle/${postId}/`, {
    method: "POST",
    headers: {
      "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      document.querySelector("#like-count").textContent = data.count;
      this.classList.toggle("btn-danger", data.liked);
      this.classList.toggle("btn-outline-danger", !data.liked);
    });
});

// Comment Form
document.querySelector("#comment-form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const postId = this.dataset.post;
  const formData = new FormData(this);

  fetch(`/comments/add/${postId}/`, {
    method: "POST",
    body: formData,
    headers: {
      "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.error) {
        const newComment = `
          <div class="comment border p-2 mb-2">
            <strong>${data.author}</strong>
            <p>${data.content}</p>
            <small class="text-muted">${data.created_at}</small>
          </div>
        `;
        document.querySelector("#comments-container").insertAdjacentHTML("afterbegin", newComment);
        this.reset();
      }
    });
});
