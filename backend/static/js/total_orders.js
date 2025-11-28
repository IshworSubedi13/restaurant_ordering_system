async function loadTotalOrders() {
    const ordersDiv = document.getElementById("total-orders"); // div to show total orders
    if (!ordersDiv) {
        console.error("Element with id 'total-orders' not found");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("No token found in localStorage");
        ordersDiv.innerText = "Login required";
        return;
    }

    try {
        const response = await fetch("/api/v1/orders/total_orders", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        console.log("API response:", data);

        if (response.ok && data.total_orders !== undefined) {
            ordersDiv.innerText = data.total_orders.toLocaleString();
        } else if (data.error) {
            ordersDiv.innerText = "Error loading orders";
            console.error("API Error:", data.error);
        } else {
            ordersDiv.innerText = "Unknown error";
            console.error("Unexpected API response:", data);
        }
    } catch (err) {
        console.error("Network error:", err);
        ordersDiv.innerText = "Network error";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, loading total orders...");
    loadTotalOrders();
});
