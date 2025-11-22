async function loadCustomerCount() {
    const countDiv = document.getElementById("total-customers");
    if (!countDiv) {
        console.error("Element with id 'total-customers' not found");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("No token found in localStorage");
        countDiv.innerText = "Login required";
        return;
    }

    try {
        const response = await fetch("/api/v1/users/count", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        console.log("API response:", data);

        if (response.ok && data.total_customers !== undefined) {
            countDiv.innerText = data.total_customers;
        } else if (data.error) {
            countDiv.innerText = "Error loading count";
            console.error("API Error:", data.error);
        } else {
            countDiv.innerText = "Unknown error";
            console.error("Unexpected API response:", data);
        }
    } catch (err) {
        console.error("Network error:", err);
        countDiv.innerText = "Network error";
    }
}

// Run after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, loading customer count...");
    loadCustomerCount();
});
