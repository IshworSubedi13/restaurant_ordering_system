// Initialize the order modal
function initializeOrderModal() {
    const addBtn = document.getElementById("addOrderBtn");
    const modal = document.getElementById("addOrderModal");
    const closeBtn = document.getElementById("closeModalBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const orderForm = document.getElementById("orderForm");

    const orderMenu = document.getElementById("orderMenu");
    const orderQuantity = document.getElementById("orderQuantity");
    const orderStatus = document.getElementById("orderStatus");

    const orderPrice = document.getElementById("orderPrice");
    const orderTotal = document.getElementById("orderTotal");

    let editingId = null;
    let menuPrices = {};

    const oldSaveBtn = document.getElementById("saveOrderBtn");
    const saveBtn = oldSaveBtn.cloneNode(true);
    oldSaveBtn.parentNode.replaceChild(saveBtn, oldSaveBtn);

    const oldAddBtn = document.getElementById("addOrderBtn");
    const newAddBtn = oldAddBtn.cloneNode(true);
    oldAddBtn.parentNode.replaceChild(newAddBtn, oldAddBtn);

    newAddBtn.addEventListener("click", async () => {
        editingId = null;
        saveBtn.textContent = "Save Order";
        orderForm.reset();
        orderStatus.value = "preparing";
        await populateOrderMenu();
        updatePriceDisplay();
        modal.style.display = "flex";
    });

    function closeModal() {
        modal.style.display = "none";
        orderForm.reset();
        editingId = null;
    }

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    window.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });

    function updatePriceDisplay() {
        const menuId = orderMenu.value;
        const quantity = parseInt(orderQuantity.value) || 1;
        const price = menuPrices[menuId] || 0;
        if (orderPrice) orderPrice.value = `$${price.toFixed(2)}`;
        if (orderTotal) orderTotal.value = `$${(price * quantity).toFixed(2)}`;
    }

    orderMenu.addEventListener("change", updatePriceDisplay);
    orderQuantity.addEventListener("input", updatePriceDisplay);

    saveBtn.addEventListener("click", async () => {
        const menuId = orderMenu.value;
        const quantity = parseInt(orderQuantity.value);
        const status = orderStatus.value;

        if (!menuId || quantity <= 0 || !status) {
            alert("Please fill all fields with valid values.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) return alert("Unauthorized");

        const payload = {
            items: [{ menu_id: menuId, quantity: quantity, ordered_price: menuPrices[menuId] }],
            status: status
        };

        const url = editingId ? `/api/v1/orders/${editingId}` : "/api/v1/orders/";
        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                alert(editingId ? "Order updated successfully" : "Order created successfully");
                closeModal();
                if (typeof loadOrdersPage === "function") loadOrdersPage();
            } else {
                alert(data.error || "Failed to save order");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to save order. Check console for details.");
        }
    });

    window.startEditOrder = async function(order) {
        editingId = order.id;
        saveBtn.textContent = "Update Order";
        await populateOrderMenu(order.items[0].menu_id);
        orderMenu.value = order.items[0].menu_id;
        orderQuantity.value = order.items[0].quantity;
        orderStatus.value = order.status;
        updatePriceDisplay();
        modal.style.display = "flex";
    };

    window.deleteOrder = async function(orderId) {
        if (!confirm("Are you sure you want to delete this order?")) return;

        const token = localStorage.getItem("token");
        if (!token) return alert("Unauthorized");

        try {
            const res = await fetch(`/api/v1/orders/${orderId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json();

            if (res.ok) {
                alert("Order deleted successfully");
                if (typeof loadOrdersPage === "function") loadOrdersPage();
            } else {
                alert(data.error || "Failed to delete order");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to delete order. Check console for details.");
        }
    };

    async function populateOrderMenu(selectedId = null) {
        const select = document.getElementById("orderMenu");
        select.innerHTML = "<option>Loading...</option>";
        menuPrices = {};

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("/api/v1/menus/", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const menus = await res.json();

            if (!Array.isArray(menus) || menus.length === 0) {
                select.innerHTML = "<option value=''>No menus found</option>";
                return;
            }

            select.innerHTML = menus
                .map(menu => {
                    menuPrices[menu.id] = menu.price; // store price
                    return `<option value="${menu.id}" ${selectedId == menu.id ? "selected" : ""}>
                                ${menu.name} - $${menu.price.toFixed(2)}
                            </option>`;
                })
                .join("");

            updatePriceDisplay();

        } catch (err) {
            console.error(err);
            select.innerHTML = "<option value=''>Failed to load menus</option>";
        }
    }
}

window.initializeOrderModal = initializeOrderModal;
