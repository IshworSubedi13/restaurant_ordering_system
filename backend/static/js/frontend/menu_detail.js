const API_BASE_URL = "http://127.0.0.1:5000/api/v1";
const BACKEND_BASE_URL = "http://127.0.0.1:5000";

function authHeaders(extra = {}) {
  const accessToken = localStorage.getItem("access_token");
  console.log("Token from localStorage (menu_detail):", accessToken);

  if (!accessToken) return extra;
  return {
    Authorization: `Bearer ${accessToken}`,
    ...extra,
  };
}

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

// function for fetching the review and according to the menu item
async function fetchReviewsForItem(itemId) {
  const res = await fetch(`${API_BASE_URL}/reviews/`);

  if (!res.ok) {
    console.error("Failed to fetch reviews", res.status);
    return [];
  }

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

  return filtered.map((review) => {
    const name = review.user?.name || "Anonymous";
    const initials = name
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const numericRating = Number(review.rating) || 0;

    return {
      id: review.id,
      userName: name,
      rating: numericRating,
      comment: review.comment || "",
      date: review.created_at,
      userInitials: initials,
    };
  });
}

function calculateRatingStats(reviews) {
  if (reviews.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const total = reviews.length;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = sum / total;

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((review) => {
    distribution[review.rating]++;
  });

  return {
    average: Math.round(average * 10) / 10,
    total,
    distribution,
  };
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

  const imageUrl = item.image?.startsWith("/static")
    ? `${BACKEND_BASE_URL}${item.image}`
    : item.image;

  const preparationTime = item.preparationTime || "N/A";
  const spicyLevel = item.spicyLevel || "Not specified";
  const allergensText = (item.allergens || []).join(", ") || "None";
  const ingredientsList = (item.ingredients || [])
    .map((ingredient) => `<li>${ingredient}</li>`)
    .join("");

  container.innerHTML = `
    <div class="item-image">
      <img src="${imageUrl}" alt="${item.name}">
    </div>
    <div class="item-info">
      <span class="item-category">${item?.category?.name || ""}</span>
      <h1 class="item-name">${item.name}</h1>
      <div class="item-price">€${item.price.toFixed(2)}</div>
      <p class="item-description">${item.description || ""}</p>

      <div class="order-controls">
        <div class="quantity-section">
          <span class="quantity-label">Quantity:</span>
          <div class="quantity-controls">
            <button class="quantity-btn minus">-</button>
            <span class="quantity-display">1</span>
            <button class="quantity-btn plus">+</button>
          </div>
        </div>
        <button class="add-to-cart-btn" data-id="${item.id}">
          <i class="fas fa-shopping-cart"></i>
          Add to Cart - €${item.price.toFixed(2)}
        </button>
      </div>

      <div class="nutritional-info">
        <h3>Details</h3>
        <div class="nutrition-grid">
          <div class="nutrition-item">
            <span class="nutrition-value">${preparationTime}</span>
            <span class="nutrition-label">Prep Time</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-value">${spicyLevel}</span>
            <span class="nutrition-label">Spice Level</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-value">${allergensText}</span>
            <span class="nutrition-label">Allergens</span>
          </div>
        </div>
      </div>

      <div class="ingredients">
        <h3>Ingredients</h3>
        <ul>
          ${ingredientsList}
        </ul>
      </div>
    </div>
  `;

  addEventListeners(item);
  renderReviews(item.id);
  renderRelatedItems(item?.category?.name, item.id);
}

async function renderReviews(itemId) {
  const reviews = await fetchReviewsForItem(itemId);
  const stats = calculateRatingStats(reviews);

  const ratingSummary = document.getElementById("rating-summary");
  ratingSummary.innerHTML = `
    <div class="average-rating">
      <div class="rating-number">${stats.average}</div>
      <div class="rating-stars">${getStarRating(stats.average)}</div>
      <div class="total-reviews">${stats.total} reviews</div>
    </div>
    <div class="rating-bars">
      ${[5, 4, 3, 2, 1]
        .map(
          (rating) => `
        <div class="rating-bar">
          <span class="rating-label">${rating} ★</span>
          <div class="rating-progress">
            <div class="rating-progress-fill" style="width: ${
              stats.total > 0
                ? (stats.distribution[rating] / stats.total) * 100
                : 0
            }%"></div>
          </div>
          <span class="rating-count">${stats.distribution[rating]}</span>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  const reviewsList = document.getElementById("reviews-list");
  if (reviews.length === 0) {
    reviewsList.innerHTML =
      '<p class="no-reviews">No reviews yet. Be the first to review this item!</p>';
  } else {
    reviewsList.innerHTML = reviews
      .map(
        (review) => `
        <div class="review-item">
          <div class="review-header">
            <div class="reviewer-info">
              <div class="reviewer-avatar">${review.userInitials}</div>
              <div>
                <div class="reviewer-name">${review.userName}</div>
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
}

function addEventListeners(item) {
  let quantity = 1;
  const quantityDisplay = document.querySelector(".quantity-display");
  const addToCartBtn = document.querySelector(".add-to-cart-btn");

  function updatePrice() {
    const totalPrice = item.price * quantity;
    addToCartBtn.innerHTML = `
      <i class="fas fa-shopping-cart"></i>
      Add to Cart - €${totalPrice.toFixed(2)}
    `;
  }

  document.querySelector(".quantity-btn.plus").addEventListener("click", () => {
    quantity++;
    quantityDisplay.textContent = quantity;
    updatePrice();
  });

  document
    .querySelector(".quantity-btn.minus")
    .addEventListener("click", () => {
      if (quantity > 1) {
        quantity--;
        quantityDisplay.textContent = quantity;
        updatePrice();
      }
    });

  addToCartBtn.addEventListener("click", () => {
    addToCart(item, quantity);
    showNotification(`${quantity} ${item.name} added to cart!`);
  });
}

function addToCart(item, quantity) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find((c) => c.id === item.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    const imageUrl = item.image?.startsWith("/static")
      ? `${BACKEND_BASE_URL}${item.image}`
      : item.image;

    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      image: imageUrl,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  console.log("Cart updated:", cart);
}

// For review model adding section

let currentRating = 0;

function openReviewModal() {
  document.getElementById("review-modal").style.display = "flex";
  currentRating = 0;
  resetStarRating();
}

function closeReviewModal() {
  document.getElementById("review-modal").style.display = "none";
  document.getElementById("review-form").reset();
}

function resetStarRating() {
  const stars = document.querySelectorAll(".star");
  stars.forEach((star) => star.classList.remove("active"));
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
        } else {
          s.classList.remove("active");
        }
      });
    });

    star.addEventListener("mouseover", () => {
      const rating = parseInt(star.dataset.rating);
      stars.forEach((s, index) => {
        if (index < rating) {
          s.style.color = "#ffc107";
        } else {
          s.style.color = "#ddd";
        }
      });
    });

    star.addEventListener("mouseout", () => {
      stars.forEach((s, index) => {
        if (index < currentRating) {
          s.style.color = "#ffc107";
        } else {
          s.style.color = "#ddd";
        }
      });
    });
  });
}

// for posting the review

async function createReview(itemId, rating, comment) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("You must log in to submit a review.");
    throw new Error("No token in localStorage");
  }

  const res = await fetch(`${API_BASE_URL}/reviews/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ menu_id: itemId, rating, comment }),
  });

  const text = await res.text();
  console.log("Review POST status:", res.status);
  console.log("Review POST body:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { msg: text };
  }

  if (res.status === 401 && data.msg === "Token has expired") {
    alert("Your session has expired. Please log in again.");
    localStorage.removeItem("access_token");
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
    throw new Error("Token expired");
  }

  if (!res.ok) {
    throw new Error(`Failed to create review: ${res.status} ${text}`);
  }

  return data;
}

async function handleReviewSubmission(event) {
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

  const itemId = currentItem.id;

  try {
    await createReview(itemId, currentRating, comment);
    closeReviewModal();
    await renderReviews(itemId);
    showNotification("Thank you for your review!");
  } catch (err) {
    console.error(err);
    alert("Sorry, something went wrong while saving your review.");
  }
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// to render the related items
async function renderRelatedItems(categoryName, currentItemId) {
  const allItems = await fetchAllMenus();

  const relatedItems = allItems
    .filter(
      (item) =>
        item?.category?.name === categoryName && item.id !== currentItemId
    )
    .slice(0, 3);

  const container = document.getElementById("related-items");

  if (relatedItems.length === 0) {
    container.innerHTML = "<p>No related items found.</p>";
    return;
  }

  container.innerHTML = relatedItems
    .map(
      (item) => `
        <div class="related-item" onclick="viewItem('${item.id}')">
          <div class="related-item-image">
            <img src="${
              item.image.startsWith("/static")
                ? BACKEND_BASE_URL + item.image
                : item.image
            }" alt="${item.name}">
          </div>
          <div class="related-item-info">
            <h3 class="related-item-name">${item.name}</h3>
            <div class="related-item-price">€${item.price.toFixed(2)}</div>
          </div>
        </div>
      `
    )
    .join("");
}

function viewItem(itemId) {
  fetchAllMenus().then((allItems) => {
    const item = allItems.find((i) => i.id === itemId);
    if (!item) return;
    localStorage.setItem("selectedMenu", JSON.stringify(item));
    window.location.href = "./menu_detail.html";
  });
}

function goBack() {
  window.history.back();
}

document.addEventListener("DOMContentLoaded", () => {
  renderItemDetails();
  setupStarRating();
  document
    .getElementById("review-form")
    .addEventListener("submit", handleReviewSubmission);
});

document.addEventListener("click", (event) => {
  const modal = document.getElementById("review-modal");
  if (event.target === modal) {
    closeReviewModal();
  }
});
