const API_BASE_URL = "http://127.0.0.1:5000/api/v1";
const BACKEND_BASE_URL = "http://127.0.0.1:5000";

// Debug helper
function debugLocalStorage() {
  console.log("=== LocalStorage Debug ===");
  console.log("All localStorage items:");
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`${key}: ${localStorage.getItem(key)}`);
  }
  console.log("=== End Debug ===");
}

// Get token with debugging
function getToken() {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  console.log("Token found:", token ? "Yes" : "No");
  if (token) {
    console.log("Token (first 20 chars):", token.substring(0, 20) + "...");
  }
  return token;
}

// to open the menu details page
function openMenuDetail(item) {
  console.log("Opening menu detail for:", item);
  localStorage.setItem("selectedMenu", JSON.stringify(item));
  window.location.href = "/product/menu_detail";
}

let cart = [];
let menuItems = [];

const menuCategoriesContainer = document.querySelector(".menu-categories");
const menuItemsContainer = document.getElementById("menu-items");
const cartItemsContainer = document.getElementById("cart-items");
const cartCountElement = document.getElementById("cart-count");
const cartTotalElement = document.getElementById("cart-total");
const checkoutButton = document.getElementById("checkout-btn");

// Helpers
function slugify(text) {
  return text.trim().toLowerCase().replace(/\s+/g, "-");
}

// Fetch categories from API
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

// OrderConfirmation class
class OrderConfirmation {
    constructor() {
        this.modal = document.getElementById('orderConfirmationModal');
        if (this.modal) {
            this.init();
        }
    }

    init() {
        // Set up event listeners for modal buttons
        document.getElementById('continue-shopping-btn')?.addEventListener('click', () => {
            this.close();
            window.location.href = '/product';
        });

        document.getElementById('view-orders-btn')?.addEventListener('click', () => {
            this.close();
            window.location.href = '/orders';
        });

        document.getElementById('close-modal-btn')?.addEventListener('click', () => {
            this.close();
        });

        // Close when clicking outside modal
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display === 'flex') {
                this.close();
            }
        });
    }

    show(orderData, cartItems) {
        if (!this.modal) return;

        console.log("OrderConfirmation.show() called with orderData:", orderData);
        console.log("Cart items for modal:", cartItems);

        // Update modal content with order data and cart items
        this.updateModalContent(orderData, cartItems);

        // Show the modal
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Add animation class
        setTimeout(() => {
            const modalContent = this.modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.add('show');
            }
        }, 10);
    }

    close() {
        if (!this.modal) return;

        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('show');
        }
    }

    updateModalContent(orderData, cartItems) {
        // Set order ID
        const orderIdElement = this.modal.querySelector('.order-id');
        if (orderIdElement && orderData.orderId) {
            console.log("Setting order ID element to:", orderData.orderId);
            orderIdElement.textContent = orderData.orderId;
        }

        // Set current time
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = now.toLocaleDateString();
        const timeElement = this.modal.querySelector('.order-time');
        if (timeElement) {
            timeElement.textContent = `${dateString} at ${timeString}`;
        }

        // Update cart items in summary
        this.updateCartItemsInSummary(cartItems);

        // Update total amount
        this.updateTotalAmount(cartItems);
    }

    updateCartItemsInSummary(cartItems) {
        const summaryContainer = this.modal.querySelector('.summary-items');
        if (!summaryContainer) return;

        // Clear existing content
        summaryContainer.innerHTML = '';

        // Add cart items
        let cartItemsHTML = '';

        if (cartItems && cartItems.length > 0) {
            console.log("Displaying cart items:", cartItems);
            cartItems.forEach(item => {
                const itemTotal = (item.price * item.quantity).toFixed(2);
                cartItemsHTML += `
                    <div class="summary-item">
                        <span>${item.name} × ${item.quantity}</span>
                        <span class="amount">€${itemTotal}</span>
                    </div>
                `;
            });
        } else {
            console.log("No cart items to display");
            cartItemsHTML = '<div class="summary-item">No items</div>';
        }

        // Add total row
        cartItemsHTML += `
            <div class="summary-divider"></div>
            <div class="summary-item total">
                <strong>Total Amount</strong>
                <strong class="amount total-amount" id="total-amount">€0.00</strong>
            </div>
        `;

        summaryContainer.innerHTML = cartItemsHTML;
    }

    updateTotalAmount(cartItems) {
        // Format currency as Euros
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-EU', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2
            }).format(amount);
        };

        // Calculate total from cart items
        let total = 0;
        if (cartItems && cartItems.length > 0) {
            total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }

        // Update total
        const totalElement = document.getElementById('total-amount');
        if (totalElement) {
            const formattedTotal = formatCurrency(total);
            totalElement.textContent = formattedTotal;
            console.log("Setting total to:", formattedTotal);

            // Add animation
            totalElement.style.transform = 'scale(1.1)';
            totalElement.style.color = '#e67e22';
            totalElement.style.transition = 'all 0.3s ease';

            setTimeout(() => {
                totalElement.style.transform = 'scale(1)';
            }, 500);
        }
    }
}

// Global orderModal instance
let orderModalInstance = null;

// Function to get or create the order modal instance
function getOrderModal() {
    if (!orderModalInstance && document.getElementById('orderConfirmationModal')) {
        orderModalInstance = new OrderConfirmation();
    }
    return orderModalInstance;
}

// Function to show order confirmation
function showOrderConfirmation(orderData, cartItems) {
    try {
        const modal = getOrderModal();

        if (!modal) {
            // Fallback to simple alert if modal doesn't exist
            alert(`Order placed successfully! Order ID: ${orderData.id || orderData.order_number || 'N/A'}`);

            // Clear cart
            cart = [];
            updateCartDisplay();

            // Redirect to home after 2 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }

        // Extract order ID from the response
        let orderId = '';

        // Try different possible fields for order ID
        if (orderData.id) {
            // If it's a MongoDB ObjectId or similar
            orderId = `#${orderData.id.substring(0, 8).toUpperCase()}`;
        } else if (orderData._id) {
            // MongoDB _id field
            orderId = `#${orderData._id.substring(0, 8).toUpperCase()}`;
        } else if (orderData.order_number) {
            // Direct order number
            orderId = `#${orderData.order_number}`;
        } else if (orderData.order_id) {
            // order_id field
            orderId = `#${orderData.order_id}`;
        } else {
            // Fallback to timestamp
            orderId = '#ORD' + Date.now().toString().substring(9, 13);
        }

        console.log("Order data received:", orderData);
        console.log("Extracted order ID:", orderId);

        // Prepare data for modal
        const modalData = {
            orderId: orderId,
            paymentMethod: 'cod'
        };

        console.log("Showing order confirmation with cart items:", cartItems);

        // Show the modal with cart items
        modal.show(modalData, cartItems);

    } catch (error) {
        console.error('Error showing order confirmation:', error);
        // Fallback to simple alert
        alert(`Order placed successfully! Order ID: ${orderData.id || orderData.order_number || 'N/A'}`);

        // Clear cart
        cart = [];
        updateCartDisplay();

        // Redirect to home after 2 seconds
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    }
}

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

// General event listeners - FIXED VERSION
function setupEventListeners() {
  checkoutButton.addEventListener("click", async function () {
    console.log("=== Checkout Clicked ===");
    console.log("Current cart:", cart);

    if (cart.length === 0) {
      alert("Your cart is empty. Please add some items before checking out.");
      return;
    }

    const token = getToken();

    if (!token) {
      console.error("No token found, redirecting to login");
      alert("Please login to place an order.");

      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `/login?redirect=${currentUrl}`;
      return;
    }

    // Test token first
    console.log("Testing token validity...");
    const isValid = await testToken(token);
    if (!isValid) {
      alert("Your session has expired. Please login again.");

      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");

      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `/login?redirect=${currentUrl}`;
      return;
    }

    // Create payload - This is what gets saved to database
    const payload = {
      items: cart.map(item => ({
        menu_id: item.id,
        quantity: item.quantity,
        ordered_price: item.price
      })),
      status: "pending"
    };

    console.log("Sending payload to backend:", payload);

    try {
      checkoutButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      checkoutButton.disabled = true;

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log("Response status:", response.status);

      const responseText = await response.text();
      console.log("Raw response text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed response data:", data);
      } catch {
        console.error("Failed to parse JSON, raw response:", responseText);
        data = { error: "Invalid JSON response" };
      }

      if (response.ok) {
        console.log("Order created successfully in database:", data);
        console.log("Cart items that were saved to database:", cart);

        // IMPORTANT: Save cart items before clearing
        const savedCartItems = [...cart]; // Create a copy of current cart

        // Clear cart from UI only
        cart = [];
        updateCartDisplay();

        // Show confirmation modal with the saved cart items
        showOrderConfirmation(data, savedCartItems);

        // Update order count if function exists
        if (typeof loadOrderCount === 'function') {
          loadOrderCount();
        }

      } else {
        console.error("Order failed. Status:", response.status, "Data:", data);

        if (response.status === 401) {
          // Token invalid
          localStorage.removeItem("token");
          localStorage.removeItem("access_token");
          alert("Your session has expired. Please login again.");

          const currentUrl = encodeURIComponent(window.location.href);
          window.location.href = `/login?redirect=redirect_url)`;
        } else {
          alert(data.error || data.message || `Failed with status ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error: " + error.message);
    } finally {
      checkoutButton.innerHTML = "Proceed to Checkout";
      checkoutButton.disabled = false;
    }
  });
}

// Test token validity
async function testToken(token) {
  try {
    // Try to fetch user's orders - this requires authentication
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    console.log("Token test response status:", response.status);
    return response.status === 200 || response.status === 404; // 404 is OK if no orders yet
  } catch (error) {
    console.error("Token test error:", error);
    return false;
  }
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

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  debugLocalStorage();
  fetchMenuItems();
  initCategories();
  setupEventListeners();

  // Initialize order modal if it exists
  getOrderModal();
});