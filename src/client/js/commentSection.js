const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtn = document.querySelectorAll(".video__comment__delete-btn");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  const span2 = document.createElement("span");
  span2.className = "video__comment__delete-btn";
  span2.innerText = "❌";
  span.innerText = ` ${text}`;
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "" || text.trim() === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
    textarea.value = "";
  }
};

const handleDelete = async (event) => {
  const comment = event.target.parentNode.parentNode;
  const commentId = comment.dataset.id;
  const videoId = videoContainer.dataset.id;

  const isDelete = confirm("정말 삭제하시겠어요?");
  if (isDelete) {
    const response = await fetch(`/api/comments/${commentId}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoId }),
    });
    if (response.status === 201) {
      event.target.parentNode.remove();
    }
  } else {
    return;
  }
};

const handleEnter = async (event) => {
  const { key } = event;
  if (key === "Enter") {
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    event.preventDefault();
    if (text === "" || text.trim() === "") {
      return;
    }
    const response = await fetch(`/api/videos/${videoId}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    if (response.status === 201) {
      textarea.value = "";
      const { newCommentId } = await response.json();
      addComment(text, newCommentId);
    }
  }
};
if (form) {
  form.addEventListener("submit", handleSubmit);
  window.addEventListener("keydown", handleEnter);
}

for (let i = 0; i < deleteBtn.length; i++) {
  deleteBtn[i].addEventListener("click", handleDelete);
}
