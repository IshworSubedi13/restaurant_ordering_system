const API_BASE_URL = 'http://127.0.0.1:5000/api/v1';

function openPopup() {
  document.getElementById("popup-overlay").style.display = "flex";
  fetch(`${API_BASE_URL}/menus/specials`)
    .then(res => res.json())
    .then(data => {
      const popupContent = document.querySelector('.popup-body');
      if (data.specials && data.specials.length > 0) {
        popupContent.innerHTML = `
          <ul>
            ${data.specials.map(item => `
              <li>
                <span>${item.name}</span>
                <span class="price">$${item.price.toFixed(2)}</span>
              </li>
            `).join('')}
          </ul>
        `;
      }
    })
    .catch(err => {
      console.error('Error loading specials:', err);
    });
}

function closePopup() {
  document.getElementById("popup-overlay").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("popup-overlay");
  const closeBtn = document.getElementById("popup-close");
  const todayMenuBtn = document.getElementById("today-menu-btn");

  todayMenuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openPopup();
  });

  // Auto-open after 600ms
  setTimeout(openPopup, 600);

  closeBtn.addEventListener("click", closePopup);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePopup();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
  });
});