document.querySelectorAll("aside.sidebar a").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll("aside.sidebar a").forEach(a => a.classList.remove("active"));
        link.classList.add("active");

        const section = link.dataset.section;
        document.getElementById("section-title").innerText = section.charAt(0).toUpperCase() + section.slice(1);
        loadContent(section);
    });
});

async function loadContent(section){
    const html = await fetch(`pages/${section}.html`).then(r => r.text());
    document.getElementById("content").innerHTML = html;
    if(section === "order"){
        loadOrdersPage();
    }
    if(section === "menu"){
        loadMenuPage();
    }
    if(section === "user"){
        loadUsersPage();
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


const Users = [
  {
    user_id: 1,
    name: "John Doe",
    email: "john@example.com"
  },
  {
    user_id: 2,
    name: "Jane Smith",
    email: "jane@example.com"
  },
  {
    user_id: 3,
    name: "Michael Brown",
    email: "michael@example.com"
  }
]

function loadUsersPage(){
  const tbody = document.getElementById("users-body")
  tbody.innerHTML = Users.map(user => `
    <tr>
      <td>${user.user_id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td class="actions">
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </td>
    </tr>
  `).join("")
}