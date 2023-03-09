const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
let commentCount = document.getElementById("video__comments-counting");
let commentLength = document.querySelectorAll(".video__comment").length;
const headerProfile = document.querySelector("#header__profile");

let tempComment;
let idNum;

const addComment = (text, id) => {
  const newNode = headerProfile.cloneNode(true);
  idNum++;
  newNode.id = "copyNode" + idNum;
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const commentText = document.createElement("span");
  commentText.className = "comment__text";
  const deleteBtn = document.createElement("span");
  deleteBtn.className = "video__comment__delete-btn";
  deleteBtn.innerText = "❌";
  const editBtn = document.createElement("span");
  editBtn.className = "video__comment__update-btn";
  editBtn.innerText = "✏️";
  commentText.innerText = ` ${text}`;
  newComment.appendChild(newNode);
  newComment.appendChild(commentText);
  newComment.appendChild(editBtn);
  newComment.appendChild(deleteBtn);
  videoComments.prepend(newComment);
  getComment();
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

const handleDeleteComment = async (event) => {
  const commentId = event.target.parentNode.dataset.id;

  const isDelete = confirm("정말 삭제하시겠어요?");
  if (isDelete) {
    const response = await fetch(`/api/comments/${commentId}/delete`, {
      method: "DELETE",
    });
    if (response.status === 201) {
      event.target.parentNode.remove();
      getComment();
    }
  }
};

const getComment = () => {
  const comments = document.querySelectorAll(".video__comment");
  if (comments.length !== 0) {
    comments.forEach((comment) => {
      if (comment.querySelector(".video__comment__update-btn")) {
        const btnUpdate = comment.querySelector(".video__comment__update-btn");
        const btnDelete = comment.querySelector(".video__comment__delete-btn");
        btnDelete.addEventListener("click", handleDeleteComment);
        btnUpdate.addEventListener("click", handleEditCommentBtn);
      }
    });
    commentLength = document.querySelectorAll(".video__comment").length;
    commentCount.innerText = `댓글 ${commentLength}개`;
  } else {
    commentCount.innerText = "댓글 0개";
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
      textarea.value = "";
    }
  }
};

const handleEditCommentBtn = async (event) => {
  event.target.innerText = "💾";
  const commentText = event.target.parentNode.querySelector(".comment__text");
  tempComment = commentText.innerText;
  commentText.classList.add("edit-line");
  commentText.contentEditable = true;
  event.target.removeEventListener("click", handleEditCommentBtn);
  event.target.addEventListener("click", handleEditComment);
};

const handleEditComment = async (event) => {
  const commentId = event.target.parentNode.dataset.id;
  const commentText = event.target.parentNode.querySelector(".comment__text");
  const text = commentText.innerText.trim();

  if (text === "" || text.trim() === "") {
    alert("한글자 이상 입력되어야 합니다.");
    commentText.innerText = tempComment;
    event.target.innerText = "✏️";
    commentText.classList.remove("edit-line");
    commentText.contentEditable = false;
    event.target.removeEventListener("click", handleEditComment);
    event.target.addEventListener("click", handleEditCommentBtn);
    getComment();
    return;
  }
  const isUpdate = confirm("정말 수정하시겠어요?");
  if (isUpdate) {
    const response = await fetch(`/api/comments/${commentId}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    if (response.status === 201) {
      event.target.innerText = "✏️";
      commentText.classList.remove("edit-line");
      commentText.contentEditable = false;
      event.target.removeEventListener("click", handleEditComment);
      event.target.addEventListener("click", handleEditCommentBtn);
      getComment();
    }
  } else {
    commentText.innerText = tempComment;
    event.target.innerText = "✏️";
    commentText.classList.remove("edit-line");
    commentText.contentEditable = false;
    event.target.removeEventListener("click", handleEditComment);
    event.target.addEventListener("click", handleEditCommentBtn);
    getComment();
  }
};

const regExpSpace = (str) => {
  const pattern = /^\s+|\s+$/g;
  if (str.match(pattern)) {
    return true;
  } else {
    return false;
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
  window.addEventListener("keydown", handleEnter);
}

window.addEventListener("DOMContentLoaded", getComment);
