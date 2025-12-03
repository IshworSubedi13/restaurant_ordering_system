const API_BASE_URL = "http://127.0.0.1:5000/api/v1";
const token = localStorage.getItem("access_token");
const BACKEND_BASE_URL = "http://127.0.0.1:5000";

// to open the  menu details page
function openMenuDetail(item) {
  console.log("Opening menu detail for:", item);
  localStorage.setItem("selectedMenu", JSON.stringify(item));
  window.location.href = "./menu_detail.html";
}

let cart = [];
let menuItems = [];

const menuCategoriesContainer = document.querySelector(".menu-categories");
const menuItemsContainer = document.getElementById("menu-items");
const cartItemsContainer = document.getElementById("cart-items");
const cartCountElement = document.getElementById("cart-count");
const cartTotalElement = document.getElementById("cart-total");
const checkoutButton = document.getElementById("checkout-btn");
const orderModal = document.getElementById("order-modal");
const closeModalButton = document.getElementById("close-modal");

// Helpers
function slugify(text) {
  return text.trim().toLowerCase().replace(/\s+/g, "-");
}

// Fetch categories from API
// async function fetchCategories() {
//   const res = await fetch(`${API_BASE_URL}/categories/all`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch categories");
//   }

//   return await res.json();
// }

// render the category from the backend
async function fetchCategories() {
  const res = await fetch(`${API_BASE_URL}/categories/all`);

  const responseText = await res.text();
  if (!res.ok) {
    console.error("Status:", res.status);
    console.error("Response body:", responseText);
    throw new Error("Failed to fetch categories");
  }

  return JSON.parse(responseText);
}

async function initCategories() {
  try {
    const categories = await fetchCategories();

    // Clear existing category buttons
    menuCategoriesContainer.innerHTML = "";

    // Add "All" category manually
    const allBtn = document.createElement("button");
    allBtn.className = "category-btn active";
    allBtn.dataset.category = "all";
    allBtn.textContent = "All";
    menuCategoriesContainer.appendChild(allBtn);

    // Add categories from backend
    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "category-btn";
      btn.dataset.category = slugify(cat.name);
      btn.textContent = cat.name;
      menuCategoriesContainer.appendChild(btn);
    });

    // Attach click listeners to category buttons
    const buttons = document.querySelectorAll(".category-btn");

    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        buttons.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        renderMenuItems(this.dataset.category);
      });
    });
  } catch (error) {
    console.error(error);
    menuCategoriesContainer.innerHTML =
      "<p class='error'>Error loading categories</p>";
  }
}

async function fetchMenuItems() {
  try {
    const res = await fetch(`${API_BASE_URL}/menus/all`);
    menuItems = await res.json();
    renderMenuItems("all");
  } catch (error) {
    console.error("Error fetching menu items:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetchMenuItems();
  initCategories();
  setupEventListeners();
});

function renderMenuItems(category) {
  menuItemsContainer.innerHTML = "";

  const filteredItems =
    category === "all"
      ? menuItems
      : menuItems.filter((item) => slugify(item?.category?.name) === category);

  filteredItems.forEach((item) => {
    const menuItemElement = document.createElement("div");
    menuItemElement.className = "menu-item";
    menuItemElement.dataset.id = item.id;

    menuItemElement.addEventListener("click", function () {
      openMenuDetail(item);
    });

    const imageUrl = item?.image?.startsWith("/static")
      ? `${BACKEND_BASE_URL}${item?.image}`
      : item?.image;

    menuItemElement.innerHTML = `
      <div class="item-image" style="background-image: url('${imageUrl}')">
      </div>
      <div class="item-details">
        <div class="item-header">
          <h3 class="item-name">${item?.name}</h3>
          <span class="item-price">€${item?.price.toFixed(2)}</span>
        </div>
        <p class="item-description">${item?.category?.description || ""}</p>
        <div class="item-actions">
          <div class="quantity-controls">
            <button class="quantity-btn minus">-</button>
            <span class="quantity">0</span>
            <button class="quantity-btn plus">+</button>
          </div>
          <button class="add-to-cart">Add to Cart</button>
        </div>
      </div>
    `;

    menuItemElement
      .querySelector(".item-image")
      .addEventListener("click", () => {
        openMenuDetail(item);
      });
    menuItemElement
      .querySelector(".item-name")
      .addEventListener("click", () => {
        openMenuDetail(item);
      });

    menuItemElement
      .querySelector(".item-actions")
      .addEventListener("click", (e) => {
        e.stopPropagation();
      });

    menuItemsContainer.appendChild(menuItemElement);
  });

  addMenuEventListeners();
}

// General event listeners (not category ones)
function setupEventListeners() {
  checkoutButton.addEventListener("click", function () {
    if (cart.length === 0) {
      alert("Your cart is empty. Please add some items before checking out.");
      return;
    }

    orderModal.style.display = "flex";
  });

  closeModalButton.addEventListener("click", function () {
    orderModal.style.display = "none";
    cart = [];
    updateCartDisplay();
  });
}

// Per-menu-item events (quantity + add to cart)
function addMenuEventListeners() {
  document.querySelectorAll(".quantity-btn.plus").forEach((button) => {
    button.addEventListener("click", function () {
      const menuItem = this.closest(".menu-item");
      const quantityElement = menuItem.querySelector(".quantity");
      let quantity = parseInt(quantityElement.textContent);
      quantityElement.textContent = ++quantity;
    });
  });

  document.querySelectorAll(".quantity-btn.minus").forEach((button) => {
    button.addEventListener("click", function () {
      const menuItem = this.closest(".menu-item");
      const quantityElement = menuItem.querySelector(".quantity");
      let quantity = parseInt(quantityElement.textContent);

      if (quantity > 0) {
        quantityElement.textContent = --quantity;
      }
    });
  });

  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", function (event) {
      event.stopPropagation();

      const menuItem = this.closest(".menu-item");
      const itemId = menuItem.dataset.id;
      const quantityElement = menuItem.querySelector(".quantity");
      const quantity = parseInt(quantityElement.textContent);

      if (quantity === 0) {
        alert("Please select at least 1 item");
        return;
      }

      addToCart(itemId, quantity);
      quantityElement.textContent = 0;
    });
  });
}

// Cart logic
function addToCart(itemId, quantity) {
  const menuItem = menuItems.find((item) => item.id === itemId);
  const existingItemIndex = cart.findIndex((item) => item.id === itemId);

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: quantity,
    });
  }

  updateCartDisplay();
}

function removeFromCart(itemId) {
  cart = cart.filter((item) => item.id !== itemId);
  updateCartDisplay();
}

function updateCartQuantity(itemId, newQuantity) {
  const cartItem = cart.find((item) => item.id === itemId);

  if (cartItem) {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      cartItem.quantity = newQuantity;
    }
  }

  updateCartDisplay();
}

function updateCartDisplay() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartCountElement.textContent = `${totalItems} ${
    totalItems === 1 ? "item" : "items"
  }`;

  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<div class="empty-cart">Your cart is empty</div>';
  } else {
    cart.forEach((item) => {
      const cartItemElement = document.createElement("div");
      cartItemElement.className = "cart-item";

      cartItemElement.innerHTML = `
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">€${item.price.toFixed(2)} each</div>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-controls">
            <button class="quantity-btn minus" data-id="${item.id}">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn plus" data-id="${item.id}">+</button>
          </div>
          <div class="remove-item" data-id="${item.id}">
            <i class="fas fa-trash"></i>
          </div>
        </div>
      `;

      cartItemsContainer.appendChild(cartItemElement);
    });

    // Cart item quantity +/-
    document
      .querySelectorAll(".cart-item-controls .quantity-btn.plus")
      .forEach((button) => {
        button.addEventListener("click", function () {
          const itemId = this.dataset.id;
          const cartItem = cart.find((item) => item.id === itemId);
          updateCartQuantity(itemId, cartItem.quantity + 1);
        });
      });

    document
      .querySelectorAll(".cart-item-controls .quantity-btn.minus")
      .forEach((button) => {
        button.addEventListener("click", function () {
          const itemId = this.dataset.id;
          const cartItem = cart.find((item) => item.id === itemId);
          updateCartQuantity(itemId, cartItem.quantity - 1);
        });
      });

    // Remove item
    document.querySelectorAll(".remove-item").forEach((button) => {
      button.addEventListener("click", function () {
        const itemId = this.dataset.id;
        removeFromCart(itemId);
      });
    });
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalElement.textContent = `€${total.toFixed(2)}`;
}
