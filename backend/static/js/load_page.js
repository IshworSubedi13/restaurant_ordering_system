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

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
}

const sectionLoaders = {
    dashboard: () => {
    if (typeof loadCustomerCount === "function") loadCustomerCount();
    if (typeof loadActivity === "function") loadActivity();
    },
    user: () => { if (typeof loadUsersPage === "function") loadUsersPage(); },
    order: () => { if (typeof loadOrdersPage === "function") loadOrdersPage(); },
    menu: () => { if (typeof loadMenuPage === "function") loadMenuPage(); },
    review: () => { if (typeof loadReviewsPage === "function") loadReviewsPage(); }
};


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

const Orders = [
  {
    order_id: "1",
    user_id: "1",
    menu_items: [
      { name: "Pizza", qty: 1 },
      { name: "Burger", qty: 2 }
    ],
    status: "Delivered"
  },
  {
    order_id: "2",
    user_id: "2",
    menu_items: [
      { name: "Coke", qty: 1 }
    ],
    status: "Pending"
  }
];

function loadOrdersPage() {
    const tbody = document.getElementById("orders-body");

    tbody.innerHTML = Orders.map(order => `
        <tr>
          <td>${order.order_id}</td>
          <td>${order.user_id}</td>
          <td>${order.menu_items.map(item => `${item.name} (x${item.qty})`).join(", ")}</td>
          <td>${order.status}</td>
          <td class="actions">
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>
          </td>
        </tr>
    `).join("");
}

const menus = [
  {
    menu_id: 1,
    name: "Cheese Burger",
    category_id: 3,
    price: 5.99,
    available: true,
    image: "https://thumbs.dreamstime.com/b/close-up-four-cheese-pizza-slice-close-up-shot-four-cheese-pizza-perfectly-melted-cheese-stretchy-gooey-ready-327216466.jpg"
  },
  {
    menu_id: 2,
    name: "Large Fries",
    category_id: 2,
    price: 2.49,
    available: true,
    image: "https://img.freepik.com/free-vector/crispy-golden-french-fries-illustration_1308-167222.jpg?semt=ais_hybrid&w=740&q=80"
  },
  {
    menu_id: 3,
    name: "Milkshake",
    category_id: 4,
    price: 3.75,
    available: false,
    image: "https://img.freepik.com/free-photo/high-angle-assortment-desserts-with-straws-chocolate_23-2148603243.jpg?semt=ais_hybrid&w=740&q=80"
  }
]

function loadMenuPage(){
  const body = document.getElementById("menu-body")
  body.innerHTML = menus.map(menu => `
    <tr>
      <td>${menu.menu_id}</td>
      <td>${menu.name}</td>
      <td>${menu.category_id}</td>
      <td>${menu.price.toFixed(2)}</td>
      <td>${menu.available ? "TRUE" : "FALSE"}</td>
      <td><img src="${menu.image}" width="50" height="50"></td>
      <td class="actions">
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </td>
    </tr>
  `).join("")
}

// Load users
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

document.addEventListener("DOMContentLoaded", () => {
    const defaultSection = "dashboard";
    const defaultLink = document.querySelector(`aside.sidebar a[data-section="${defaultSection}"]`);

    if (defaultLink) {
        document.querySelectorAll("aside.sidebar a").forEach(a => a.classList.remove("active"));
        defaultLink.classList.add("active");

        const sectionTitle = document.getElementById("section-title");
        if(sectionTitle) sectionTitle.innerText = defaultSection.charAt(0).toUpperCase() + defaultSection.slice(1);
        loadContent(defaultSection);
    }
});
