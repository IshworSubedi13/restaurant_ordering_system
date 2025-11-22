document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");
    const loginBtn = document.getElementById("login-btn");
    const btnText = document.getElementById("btn-text");
    const btnLoading = document.getElementById("btn-loading");

    // Auto-redirect if already logged in
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
        if (storedUser.role === "admin") {
            window.location.href = "/admin-dashboard";
        } else {
            window.location.href = "/dashboard";
        }
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorMessage.textContent = "";
        successMessage.textContent = "";

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        btnText.style.display = "none";
        btnLoading.style.display = "inline-block";

        try {
            const response = await fetch("/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("user", JSON.stringify(data.user));

                successMessage.textContent = "Login successful! Redirecting...";
                successMessage.style.display = "block";

                setTimeout(() => {
                    if (data.user.role === "admin") {
                        window.location.href = "/admin-dashboard";
                    } else {
                        window.location.href = "/dashboard";
                    }
                }, 1000);
            } else {
                const msg = data.error || data.message || data.detail || "Invalid email or password.";
                errorMessage.textContent = msg;
                errorMessage.style.display = "block";
            }
        } catch (err) {
            console.error("Network error:", err);
            errorMessage.textContent = "Network error. Please try again.";
        } finally {
            btnText.style.display = "inline";
            btnLoading.style.display = "none";
        }
    });
});

