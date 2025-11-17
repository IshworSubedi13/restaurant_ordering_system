document.addEventListener("DOMContentLoaded", () => {
    const sidebarLogoutBtn = document.getElementById("sidebar-logout-btn");

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
        window.location.href = "/logout";
    }
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/logout";
        });
    }
});
