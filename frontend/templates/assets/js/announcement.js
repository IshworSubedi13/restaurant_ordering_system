function openPopup() {
  document.getElementById("popup-overlay").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup-overlay").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("popup-overlay");
  const closeBtn = document.getElementById("popup-close");

  // setTimeout for to set the time to make popup the annuncement box
  setTimeout(openPopup, 600);

  closeBtn.addEventListener("click", closePopup);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePopup();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
  });
});
