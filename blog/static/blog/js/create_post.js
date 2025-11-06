// POST CREATION SCRIPT
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("access_token");
    const form = document.getElementById("post-form");
    const warning = document.getElementById("login-warning");

    // Check authentication
    if (!token) {
        warning.classList.remove("d-none");
        return;
    }

    // Show form
    form.classList.remove("d-none");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const title = document.getElementById("post-title").value;
        const content = document.getElementById("post-content").value;
        const imageInput = document.getElementById("post-image");

        // Build multipart form data (required for image upload)
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);

        if (imageInput.files.length > 0) {
            formData.append("pics", imageInput.files[0]);
        }

        try {
            const response = await fetch(`${API_BASE}posts/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                alert("Error: " + JSON.stringify(errData));
                return;
            }

            const data = await response.json();
            document.getElementById("post-success").classList.remove("d-none");

            // Redirect user to the new post
            setTimeout(() => {
                window.location.href = `/post/${data.id}/`;
            }, 1500);

        } catch (error) {
            console.error("Create post error:", error);
            alert("An unexpected error occurred while creating the post.");
        }
    });
});
