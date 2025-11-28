// Adds click event listeners to all sidebar links to handle section switching and active class toggling
document.querySelectorAll("aside.sidebar a").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll("aside.sidebar a").forEach(a => a.classList.remove("active"));
        link.classList.add("active");

        const section = link.dataset.section;
        const sectionTitle = document.getElementById("section-title");
        if(sectionTitle) sectionTitle.innerText = section.charAt(0).toUpperCase() + section.slice(1);
        loadContent(section);
        if (window.innerWidth <= 1024) {
            closeSidebar();
        }
    });
});
// Closes the sidebar and the mobile overlay (for responsive view)
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
}
// Object mapping each section to its respective loader function
const sectionLoaders = {
    dashboard: () => {
    if (typeof loadCustomerCount === "function") loadCustomerCount();
    if (typeof loadActivity === "function") loadActivity();
    if (typeof loadTotalRevenue === "function") loadTotalRevenue();
    if (typeof loadTotalOrders === "function") loadTotalOrders();
    },
    user: () => { if (typeof loadUsersPage === "function") loadUsersPage(); },
    order: () => { if (typeof loadOrdersPage === "function") loadOrdersPage(); },
    menu: () => { if (typeof loadMenuPage === "function") loadMenuPage(); },
    review: () => { if (typeof loadReviewsPage === "function") loadReviewsPage(); },
    category: () => { if (typeof loadCategoryPage === "function") loadCategoryPage(); }
};

// Loads HTML content of a specific section and calls the corresponding loader
async function loadContent(section){
    const contentDiv = document.getElementById("content");
    if (!contentDiv) return;
    try {
        const response = await fetch(`/admin/${section}`);
        if (!response.ok) {
            contentDiv.innerHTML = `<p>Error loading ${section} page</p>`;
            return;
        }
        const html = await response.text();
        contentDiv.innerHTML = html;
        sectionLoaders[section]?.();
    } catch (error) {
        console.error("Error loading content:", error);
        contentDiv.innerHTML = `<p>Error loading ${section} page</p>`;
        return;
    }
}

// Load orders into the orders table
async function loadOrdersPage() {
    const tbody = document.getElementById("orders-body");
    if (!tbody) return;

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
        tbody.innerHTML = "<tr><td colspan='5'>Unauthorized</td></tr>";
        return;
    }

    tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    try {
    const res = await fetch("/api/v1/orders/", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();

    tbody.innerHTML = data.length
        ? data.map(order => {
            const itemsStr = order.items
                .map(i => `${i.name} (x${i.quantity}) @ $${i.ordered_price.toFixed(2)}`)
                .join("<br>");
            const total = order.total_price.toFixed(2);

            return `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.user.name}</td>
                    <td>${itemsStr}</td>
                    <td>$${total}</td>
                    <td>${order.status}</td>
                    <td class="actions">
                        ${user.role === "admin" ? `
                            <button class="edit" onclick='startEditOrder(${JSON.stringify(order).replace(/'/g,"\\'")})'>Edit</button>
                            <button class="delete" onclick="deleteOrder('${order.id}')">Delete</button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join("")
        : "<tr><td colspan='6'>No orders found</td></tr>";

        loadOrderModalScript();

    } catch (err) {
        console.error(err);
        tbody.innerHTML = "<tr><td colspan='5'>Failed to load orders</td></tr>";
    }
}
function loadOrderModalScript() {
    if (window.orderModalScriptLoaded) {
        if (typeof initializeOrderModal === 'function') initializeOrderModal();
        return;
    }

    const script = document.createElement('script');
    script.src = '/static/js/order_modal.js';
    script.defer = true;

    script.onload = function() {
        window.orderModalScriptLoaded = true;
        if (typeof initializeOrderModal === 'function') initializeOrderModal();
    };

    script.onerror = function() {
        console.error('Failed to load order modal script');
    };

    document.head.appendChild(script);
}


// Loads menus into the menu table using API call and checks for admin access
async function loadMenuPage() {
    const body = document.getElementById("menu-body");
    if (!body) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const addBtn = document.getElementById("addMenuBtn");

    if (!token) {
        body.innerHTML = "<tr><td colspan='7'>Unauthorized (no token)</td></tr>";
        loadMenuModalScript();
        return;
    }

    if (!user || user.role.toLowerCase() !== "admin") {
        body.innerHTML = "<tr><td colspan='7'>Unauthorized (admin only)</td></tr>";
        if (addBtn) addBtn.style.display = "none";
        loadMenuModalScript();
        return;
    }

    if (addBtn) addBtn.style.display = "inline-flex";

    body.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";

    try {
        const response = await fetch("/api/v1/menus/", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {
            body.innerHTML = `<tr><td colspan='7'>Error: ${data.error || "Failed to load menus"}</td></tr>`;
            loadMenuModalScript();
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            body.innerHTML = "<tr><td colspan='7'>No menu items found</td></tr>";
        } else {
            body.innerHTML = data.map(menu => `
                <tr>
                    <td>${menu.id}</td>
                    <td>${menu.name}</td>
                    <td>${menu.category.name}</td>
                    <td>${menu.price}</td>
                    <td>${menu.available ? "Yes" : "No"}</td>
                    <td>${menu.image ? `<img src="${menu.image}" alt="${menu.name}" style="height:50px;">` : ""}</td>
                    <td class="actions">
                        <button class="edit" onclick="startEditMenu('${menu.id}','${menu.name}',${menu.price},'${menu.category.id}',${menu.available})">Edit</button>
                        <button class="delete" onclick="deleteMenu('${menu.id}')">Delete</button>
                    </td>
                </tr>
            `).join("");
        }
        loadMenuModalScript();

    } catch (error) {
        console.error("Error fetching menus:", error);
        body.innerHTML = "<tr><td colspan='7'>Network Error. Please try again.</td></tr>";
        loadMenuModalScript();
    }
}

// Loads the menu modal script dynamically to initialize modal functionality
function loadMenuModalScript() {
    if (window.menuModalScriptLoaded) {
        if (typeof initializeMenuModal === 'function') {
            initializeMenuModal();
        }
        return;
    }

    const script = document.createElement('script');
    script.src = '/static/js/menu_modal.js';

    script.onload = function() {
        window.menuModalScriptLoaded = true;
        if (typeof initializeMenuModal === 'function') {
            initializeMenuModal();
        }
    };

    script.onerror = function() {
        console.error('Failed to load menu modal script');
    };

    document.head.appendChild(script);
}


// Loads categories into the category table using API call and checks for admin access
async function loadCategoryPage() {
    const body = document.getElementById("category-body");
    if (!body) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const addBtn = document.getElementById("addCategoryBtn");

    if (!token) {
        body.innerHTML = "<tr><td colspan='4'>Unauthorized (no token)</td></tr>";
        loadCategoryModalScript();
        return;
    }

    if (!user || user.role.toLowerCase() !== "admin") {
        body.innerHTML = "<tr><td colspan='4'>Unauthorized (admin only)</td></tr>";
        if (addBtn) addBtn.style.display = "none";
        loadCategoryModalScript();
        return;
    }

    if (addBtn) addBtn.style.display = "inline-flex";

    body.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

    try {
        const response = await fetch("/api/v1/categories/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            body.innerHTML = `<tr><td colspan='4'>Error: ${data.error || "Failed to load categories"}</td></tr>`;
            loadCategoryModalScript();
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            body.innerHTML = "<tr><td colspan='4'>No categories found</td></tr>";
        } else {
            body.innerHTML = data.map(category => `
                <tr>
                    <td>${category.id || category.category_id}</td>
                    <td>${category.name}</td>
                    <td>${category.description || ""}</td>
                    <td class="actions">
                        <button class="edit" onclick="startEditCategory('${category.id}', '${category.name}', '${category.description || ""}')">Edit</button>
                        <button class="delete" onclick="deleteCategory('${category.id}')">Delete</button>
                    </td>
                </tr>
            `).join("");
        }

        // Always initialize modal, even if table is empty
        loadCategoryModalScript();

    } catch (error) {
        console.error("Error fetching categories:", error);
        body.innerHTML = "<tr><td colspan='4'>Network Error. Please try again.</td></tr>";
        loadCategoryModalScript();
    }
}

// Loads the category modal script dynamically to initialize modal functionality
function loadCategoryModalScript() {
    if (window.categoryModalScriptLoaded) {
        if (typeof initializeCategoryModal === 'function') {
            initializeCategoryModal();
        }
        return;
    }

    const script = document.createElement('script');
    script.src = '/static/js/category_model.js';

    script.onload = function() {
        window.categoryModalScriptLoaded = true;
        if (typeof initializeCategoryModal === 'function') {
            initializeCategoryModal();
        }
    };

    script.onerror = function() {
        console.error('Failed to load category modal script');
    };

    document.head.appendChild(script);
}

// Loads users table using API and checks for admin access
async function loadUsersPage(){
  const tbody = document.getElementById("users-body")
  if (!tbody) return;

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const role = user?.role?.toLowerCase();
  if (!token) {
        tbody.innerHTML = "<tr><td colspan='4'>Unauthorized (no token)</td></tr>";
        return;
    }
  if (!user || user.role !== "admin") {
        tbody.innerHTML = "<tr><td colspan='4'>Unauthorized (admin only)</td></tr>";
        return;
    }

  tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";
  try {
        const response = await fetch("/api/v1/users/", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            tbody.innerHTML = `<tr><td colspan='4'>Error: ${data.error || "Failed to load users"}</td></tr>`;
            return;
        }

        if (!data || data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4'>No users found</td></tr>";
            return;
        }
        tbody.innerHTML = data.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td class="actions">
                    <button class="edit" data-id="${user.user_id}">Edit</button>
                    <button class="delete" data-id="${user.user_id}">Delete</button>
                </td>
            </tr>
        `).join("");
    } catch (error) {
        console.error("Error fetching users:", error);
        tbody.innerHTML = `<tr><td colspan='4'>Error: Network error.Please try again</td></tr>`;
        return;
    }
}


const Reviews = [
  {
    review_id: 1,
    name: "Ram",
    menu_name: "Cheese Burger",
    comment: "Very juicy and tasty!",
    rating: 5
  },
  {
    review_id: 2,
    name: "Roshan",
    menu_name: "Milkshake",
    comment: "Too sweet for me.",
    rating: 3
  },
  {
    review_id: 3,
    name: "Sujan",
    menu_name: "Large Fries",
    comment: "Crispy perfection.",
    rating: 4
  }
]
// Loads reviews into the reviews table (mock data for demo)
function loadReviewsPage(){
  const tbody = document.getElementById("reviews-body")

  tbody.innerHTML = Reviews.map(r => `
    <tr>
      <td>${r.review_id}</td>
      <td>${r.name}</td>
      <td>${r.menu_name}</td>
      <td>${r.comment}</td>
      <td>${r.rating}</td>
      <td class="actions">
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </td>
    </tr>
  `).join("")
}
// Initializes default section on DOMContentLoaded (sets dashboard as default)
document.addEventListener("DOMContentLoaded", () => {
    const defaultSection = "dashboard";
    const defaultLink = document.querySelector(`aside.sidebar a[data-section="${defaultSection}"]`);

    if (defaultLink) {
        document.querySelectorAll("aside.sidebar a").forEach(a => a.classList.remove("active"));
        defaultLink.classList.add("active");

        const sectionTitle = document.getElementById("section-title");
        if(sectionTitle) sectionTitle.innerText = defaultSection.charAt(0).toUpperCase() + defaultSection.slice(1);
        loadContent(defaultSection);
        sectionLoaders[defaultSection]?.();
    }
});
