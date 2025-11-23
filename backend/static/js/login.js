document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");
    const btnText = document.getElementById("btn-text");
    const btnLoading = document.getElementById("btn-loading");

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
        const redirectUrl = storedUser.role === "admin" ? "/admin-dashboard" : "/dashboard";
        window.location.href = redirectUrl;
        return;
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

                const redirectUrl = data.user.role === "admin" ? "/admin-dashboard" : "/dashboard";
                window.location.href = redirectUrl;

            } else {
                const msg = data.error || data.message || "Invalid email or password.";
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
