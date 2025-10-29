const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("menu-toggle");
toggle.addEventListener("click", () => {
if (window.innerWidth <= 768) {
    sidebar.classList.toggle("show");
} else {
    sidebar.classList.toggle("collapsed");
    }
});