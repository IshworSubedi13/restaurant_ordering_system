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
    if(section === "users"){
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
loadOrdersPage();


