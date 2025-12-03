// sample of a review dummy data
const sampleReviews = {
  1: [
    {
      id: 1,
      userName: "Sarah Johnson",
      rating: 5,
      comment:
        "Absolutely delicious! The garlic bread was perfectly crispy and the marinara sauce was amazing. Will definitely order again!",
      date: "2024-01-15",
      userInitials: "SJ",
    },
    {
      id: 2,
      userName: "Mike Chen",
      rating: 4,
      comment:
        "Great flavor and good portion size. Could use a bit more garlic for my taste, but overall very good.",
      date: "2024-01-10",
      userInitials: "MC",
    },
    {
      id: 3,
      userName: "Emma Davis",
      rating: 5,
      comment:
        "Best garlic bread I've ever had! The herbs were fresh and the bread was perfectly toasted. Highly recommend!",
      date: "2024-01-08",
      userInitials: "ED",
    },
  ],
  2: [
    {
      id: 1,
      userName: "Alex Rodriguez",
      rating: 4,
      comment:
        "Fresh and flavorful bruschetta. The tomatoes were perfectly ripe and the balsamic glaze added a nice touch.",
      date: "2024-01-12",
      userInitials: "AR",
    },
  ],
  3: [
    {
      id: 1,
      userName: "Lisa Wang",
      rating: 5,
      comment:
        "Authentic Italian pizza! The crust was perfect and the ingredients were top quality. Will be coming back for more!",
      date: "2024-01-14",
      userInitials: "LW",
    },
  ],
};

const API_BASE_URL = "http://127.0.0.1:5000/api/v1";
const BACKEND_BASE_URL = "http://127.0.0.1:5000";

// read the menu items from the product page which is saved in it
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

// reviewing the current item
function getReviewsForItem(itemId) {
  return sampleReviews[itemId] || [];
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

// Render item details from localStorage

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

// Review function

function renderReviews(itemId) {
  const reviews = getReviewsForItem(itemId);
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
            <div class="review-rating">${getStarRating(review.rating)}</div>
          </div>
          <div class="review-content">${review.comment}</div>
        </div>
      `
      )
      .join("");
  }
}

// function for the cart and the quantity means price

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

// storing the cart to the localstorage
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

// Review model

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

function handleReviewSubmission(event) {
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

  const newReview = {
    id: Date.now(),
    userName: "You",
    rating: currentRating,
    comment: comment,
    date: new Date().toISOString().split("T")[0],
    userInitials: "Y",
  };

  const itemId = currentItem.id;
  if (!sampleReviews[itemId]) {
    sampleReviews[itemId] = [];
  }
  sampleReviews[itemId].unshift(newReview);

  closeReviewModal();
  renderReviews(itemId);
  showNotification("Thank you for your review!");
}

// time to rende the notification message to display on the screen

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// rendering the related item and viewing them
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
  // view the related item when clicked to the item
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

//review and star button function handler for the rendering

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
