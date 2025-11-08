// DOM Elements
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const mobileOverlay = document.getElementById('mobile-overlay');
function toggleSidebar() {
    sidebar.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
}
function closeSidebar() {
    sidebar?.classList.remove('active');
    mobileOverlay?.classList.remove('active');
}
window.closeSidebar = closeSidebar;

function initToggle() {
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeSidebar);
    }
}
document.addEventListener('DOMContentLoaded', initToggle);