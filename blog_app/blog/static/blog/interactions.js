function getCSRFToken() {
  return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

document.addEventListener("DOMContentLoaded", function() {
  // Like button
  const likeBtn = document.getElementById("like-btn");
  if (likeBtn) {
    likeBtn.addEventListener("click", function() {
      const postId = likeBtn.dataset.post;

      fetch(`/likes/toggle/${postId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({}), // even empty body required for POST
      })
      .then(res => res.json())
      .then(data => {
        document.getElementById("like-count").textContent = data.likes_count;

        if (data.liked) {
          likeBtn.classList.remove("btn-outline-primary");
          likeBtn.classList.add("btn-primary");
        } else {
          likeBtn.classList.remove("btn-primary");
          likeBtn.classList.add("btn-outline-primary");
        }
      })
      .catch((err) => console.error("Like toggle failed:", err));
    });
  }

  // Comment form
  const commentForm = document.getElementById("comment-form");
  if (commentForm) {
    commentForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const formData = new FormData(commentForm);

      fetch(`/posts/${commentForm.dataset.post}/comments/add/`, {
        method: "POST",
        body: formData,
        headers: { "X-CSRFToken": getCSRFToken() }
      })
      .then(res => res.json())
      .then(data => {
        console.log(data, 'twale')
        // document.getElementById("comment-count").textContent = data.comments_count;

        // const newComment = `
        //   <li class="list-group-item d-flex justify-content-between align-items-start">
        //         <div>
        //                 <strong>${data.user}</strong>
        //                 <p>${data.content}</p>
        //         </div>
        //         <small class="text-muted">${data.created_at}</small>
        //   </li>`;
        // document.getElementById("comment-list").insertAdjacentHTML("afterbegin", newComment);

        commentForm.value = '';
        location.reload(); document.getElementById("comment-list").scrollIntoView({ behavior: "smooth" });
        
      })
      .catch((err) => console.error("Comment submission failed:", err));
    });
  }
});
