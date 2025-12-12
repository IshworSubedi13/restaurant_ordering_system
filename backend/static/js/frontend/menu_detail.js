const API_BASE_URL = `${window.location.origin}/api/v1`;
//const BACKEND_BASE_URL = "http://127.0.0.1:5000";

let currentUser = null;
let userReview = null;
let currentRating = 0;
let isEditMode = false;
let editingReviewId = null;

function getSelectedMenu() {
  const raw = localStorage.getItem("selectedMenu");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function fetchAllMenus() {
  const res = await fetch(`${API_BASE_URL}/menus/all`);
  return await res.json();
}

function getCurrentUser() {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    currentUser = user;
    return user;
  } catch {
    return null;
  }
}

async function fetchReviewsForItem(itemId) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/`);
    if (!res.ok) return [];

    const allReviews = await res.json();
    const filtered = allReviews.filter((review) => {
      const nestedId = review.menu && review.menu.id;
      const flatId = review.menu_id;
      const directId = review.menu;
      return (
        String(nestedId) === String(itemId) ||
        String(flatId) === String(itemId) ||
        String(directId) === String(itemId)
      );
    });

    const user = getCurrentUser();
    userReview = null;

    return filtered.map((review) => {
      const name = review.user?.name || "Anonymous";
      const initials = name.substring(0, 2).toUpperCase();
      const numericRating = Number(review.rating) || 0;

      const isOwnReview =
        user && review.user && String(review.user.id) === String(user.id);

      if (isOwnReview) {
        userReview = {
          id: review.id,
          rating: numericRating,
          comment: review.comment || "",
        };
      }

      return {
        id: review.id,
        userId: review.user?.id,
        userName: name,
        rating: numericRating,
        comment: review.comment || "",
        date: review.created_at,
        userInitials: initials,
        isOwnReview,
      };
    });
  } catch {
    return [];
  }
}

function getStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return "★".repeat(fullStars) + (halfStar ? "½" : "") + "☆".repeat(emptyStars);
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

async function renderItemDetails() {
  const item = getSelectedMenu();
  const container = document.getElementById("item-details");

  if (!item) {
    container.innerHTML =
      "<div class='error'>No menu item selected. Go back to the menu.</div>";
    return;
  }

  const imageUrl = item?.image?.startsWith("/static")
    ? item?.image
    : item?.image;

  container.innerHTML = `
    <div class="item-image">
      <img src="${imageUrl}" alt="${item.name}">
    </div>
    <div class="item-info">
      <span class="item-category">${item?.category?.name || ""}</span>
      <h1 class="item-name">${item.name}</h1>
      <div class="item-price">€${item.price.toFixed(2)}</div>
      <p class="item-description">${item.description || ""}</p>
    </div>
  `;

  await renderReviews(item.id);
}

async function renderReviews(itemId) {
  const reviews = await fetchReviewsForItem(itemId);

  const addReviewBtn = document.querySelector(".add-review-btn");
  if (addReviewBtn) {
    const token = localStorage.getItem("token");

    if (token) {
      if (userReview) {
        addReviewBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Your Review';
      } else {
        addReviewBtn.innerHTML = '<i class="fas fa-plus"></i> Add Review';
      }
      addReviewBtn.onclick = openReviewModal;
    } else {
      addReviewBtn.onclick = () => {
        alert("Please login to write a review");
        window.location.href = "/login";
      };
    }
  }

  const reviewsList = document.getElementById("reviews-list");

  if (reviews.length === 0) {
    reviewsList.innerHTML = `
      <div class="no-reviews">
        <p>No reviews yet. ${
          localStorage.getItem("token")
            ? "Be the first to review this item!"
            : "Log in to write a review."
        }</p>
        ${
          localStorage.getItem("token")
            ? '<button class="write-first-review-btn" onclick="openReviewModal()">Write First Review</button>'
            : '<a href="/login" class="login-to-review">Log in to review</a>'
        }
      </div>
    `;
    return;
  }

  reviewsList.innerHTML = reviews
    .map(
      (review) => `
      <div class="review-item">
        <div class="review-header">
          <div class="reviewer-info">
            <div class="reviewer-avatar">${review.userInitials}</div>
            <div>
              <div class="reviewer-name">
                ${review.userName}
                ${
                  review.isOwnReview
                    ? `
                  <span class="review-actions-inline">
                    <button class="icon-btn edit-icon" onclick="editReview('${review.id}')">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete-icon" onclick="deleteReview('${review.id}')">
                      <i class="fas fa-trash"></i>
                    </button>
                  </span>`
                    : ""
                }
              </div>
              <div class="review-date">${formatDate(review.date)}</div>
            </div>
          </div>
          <div class="review-rating">
            ${getStarRating(review.rating)}
            <span class="review-rating-number">(${review.rating}/5)</span>
          </div>
        </div>
        <div class="review-content">${review.comment}</div>
      </div>
    `
    )
    .join("");
}

function openReviewModal() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to write a review");
    window.location.href = "/login";
    return;
  }

  const modal = document.getElementById("review-modal");
  const formTitle = modal.querySelector("h3");
  const submitBtn = modal.querySelector(".submit-review-btn");
  const textarea = modal.querySelector("textarea");

  if (userReview) {
    isEditMode = true;
    editingReviewId = userReview.id;
    formTitle.textContent = "Edit Your Review";
    submitBtn.textContent = "Update Review";
    currentRating = userReview.rating;
    textarea.value = userReview.comment;
  } else {
    isEditMode = false;
    editingReviewId = null;
    formTitle.textContent = "Write a Review";
    submitBtn.textContent = "Submit Review";
    currentRating = 0;
    textarea.value = "";
  }

  const stars = document.querySelectorAll(".star");
  stars.forEach((star, index) => {
    if (index < currentRating) {
      star.classList.add("active");
      star.style.color = "#ffc107";
    } else {
      star.classList.remove("active");
      star.style.color = "#ddd";
    }
  });

  modal.style.display = "flex";
}

function closeReviewModal() {
  document.getElementById("review-modal").style.display = "none";
  document.getElementById("review-form").reset();
  resetStarRating();
  isEditMode = false;
  editingReviewId = null;
}

function resetStarRating() {
  const stars = document.querySelectorAll(".star");
  stars.forEach((star) => {
    star.classList.remove("active");
    star.style.color = "#ddd";
  });
  currentRating = 0;
}

function setupStarRating() {
  const stars = document.querySelectorAll(".star");
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const rating = parseInt(star.dataset.rating);
      currentRating = rating;

      stars.forEach((s, index) => {
        if (index < rating) {
          s.classList.add("active");
          s.style.color = "#ffc107";
        } else {
          s.classList.remove("active");
          s.style.color = "#ddd";
        }
      });
    });
  });
}

function editReview(reviewId) {
  const reviewsList = document.querySelectorAll(".review-item");
  reviewsList.forEach((reviewItem) => {
    const editBtn = reviewItem.querySelector(".edit-icon");
    if (editBtn && editBtn.onclick.toString().includes(reviewId)) {
      const comment = reviewItem.querySelector(".review-content").textContent;
      const rating = parseInt(
        reviewItem
          .querySelector(".review-rating-number")
          .textContent.match(/\d+/)[0]
      );

      userReview = {
        id: reviewId,
        rating,
        comment,
      };
      openReviewModal();
      return;
    }
  });
}

async function deleteReview(reviewId) {
  if (!confirm("Are you sure you want to delete your review?")) return;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to delete your review");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete review");

    showNotification("Review deleted successfully");
    const item = getSelectedMenu();
    if (item) await renderReviews(item.id);
  } catch (error) {
    alert("Failed to delete review");
  }
}

async function updateReview(reviewId, rating, comment) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to update your review");
    return;
  }

  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment }),
  });

  return await response.json();
}

async function createReview(itemId, rating, comment) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must log in to submit a review.");
    throw new Error("No token");
  }

  const payload = { menu_id: itemId, rating, comment };
  console.log("POST review:", payload);

  const res = await fetch(`${API_BASE_URL}/reviews/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Session expired. Please login again.");
    window.location.href = "/login";
    throw new Error("Token expired");
  }

  const text = await res.text();
  console.log("POST /reviews status:", res.status);
  console.log("POST /reviews response:", text);

  if (!res.ok) {
    throw new Error(text || `Request failed (${res.status})`);
  }

  return JSON.parse(text);
}

async function handleReviewSubmission(event) {
  console.log("handleReviewSubmission fired");
  event.preventDefault();

  if (currentRating === 0) {
    alert("Please select a rating");
    return;
  }

  const comment = event.target.querySelector("textarea").value.trim();
  if (!comment) {
    alert("Please write a review");
    return;
  }

  const currentItem = getSelectedMenu();
  if (!currentItem) return;

  try {
    if (isEditMode && editingReviewId) {
      await updateReview(editingReviewId, currentRating, comment);
      showNotification("Review updated!");
    } else {
      console.log("createReview called", {
        itemId: currentItem.id,
        rating: currentRating,
        comment,
      });
      await createReview(currentItem.id, currentRating, comment);
      showNotification("Thank you for your review!");
    }

    closeReviewModal();
    await renderReviews(currentItem.id);
  } catch (err) {
    console.error(err);
    alert(err.message || "Something went wrong");
  }
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function goBack() {
  window.location.href = "../product";
}

document.addEventListener("DOMContentLoaded", () => {
  renderItemDetails();
  setupStarRating();
  document
    .getElementById("review-form")
    .addEventListener("submit", handleReviewSubmission);
});

// inline css
const iconStyle = document.createElement("style");
iconStyle.textContent = `
  .review-actions-inline {
    display: inline-flex;
    gap: 8px;
    margin-left: 8px;
  }
  .icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 3px;
  }
  .edit-icon { color: #3498db; }
  .edit-icon:hover { background: #3498db; color: #fff; }
  .delete-icon { color: #e74c3c; }
  .delete-icon:hover { background: #e74c3c; color: #fff; }
  .icon-btn i { font-size: 14px; }
`;
document.head.appendChild(iconStyle);

window.editReview = editReview;
window.deleteReview = deleteReview;
window.openReviewModal = openReviewModal;
window.closeReviewModal = closeReviewModal;
window.goBack = goBack;
