async function loadTotalRevenue() {
    const revenueDiv = document.getElementById("total-revenue");
    if (!revenueDiv) {
        console.error("Element with id 'total-revenue' not found");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("No token found in localStorage");
        revenueDiv.innerText = "Login required";
        return;
    }

    try {
        const response = await fetch("/api/v1/orders/total_revenue", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        console.log("API response:", data);

        if (response.ok && data.total_revenue !== undefined) {
            revenueDiv.innerText = `€${data.total_revenue.toLocaleString()}`;
        } else if (data.error) {
            revenueDiv.innerText = "Error loading revenue";
            console.error("API Error:", data.error);
        } else {
            revenueDiv.innerText = "Unknown error";
            console.error("Unexpected API response:", data);
        }
    } catch (err) {
        console.error("Network error:", err);
        revenueDiv.innerText = "Network error";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, loading total revenue...");
    loadTotalRevenue();
});
