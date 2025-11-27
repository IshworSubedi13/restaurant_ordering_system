// Initialize the menu modal
function initializeMenuModal() {
    const addBtn = document.getElementById("addMenuBtn");
    const modal = document.getElementById("addMenuModal");
    const closeBtn = document.getElementById("closeModalBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const menuForm = document.getElementById("menuForm");

    const menuName = document.getElementById("menuName");
    const menuPrice = document.getElementById("menuPrice");
    const menuCategory = document.getElementById("menuCategory");
    const menuAvailable = document.getElementById("menuAvailable");
    const menuImage = document.getElementById("menuImage");

    let editingId = null;

    // eplace save button to remove old event listeners
    const oldSaveBtn = document.getElementById("saveMenuBtn");
    const saveBtn = oldSaveBtn.cloneNode(true);
    oldSaveBtn.parentNode.replaceChild(saveBtn, oldSaveBtn);

    // Replace add button to avoid duplicate listeners
    const oldAddBtn = document.getElementById("addMenuBtn");
    const newAddBtn = oldAddBtn.cloneNode(true);
    oldAddBtn.parentNode.replaceChild(newAddBtn, oldAddBtn);

    // Open modal for adding
    newAddBtn.addEventListener("click", async () => {
        editingId = null;
        saveBtn.textContent = "Save Menu";
        menuForm.reset();
        await populateMenuCategories();
        modal.style.display = "flex";
    });

    // Close modal function
    function closeModal() {
        modal.style.display = "none";
        menuForm.reset();
        editingId = null;
    }

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);

    window.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });

    // Save / Update
    saveBtn.addEventListener("click", () => {
        const name = menuName.value.trim();
        const price = menuPrice.value.trim();
        const category_id = menuCategory.value;
        const imageFile = menuImage.files[0];

        if (!name || !price || !category_id) {
            alert("Name, price, and category are required.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("category_id", category_id);
        formData.append("available", menuAvailable.checked ? "true" : "false");

        if (imageFile) formData.append("image", imageFile);

        if (editingId) updateMenu(editingId, formData, closeModal);
        else saveMenu(formData, closeModal);
    });

    // Edit menu
    window.startEditMenu = async function (id, name, price, category_id, available) {
        editingId = id;
        saveBtn.textContent = "Update Menu";

        menuName.value = name;
        menuPrice.value = price;
        menuAvailable.checked = available == true || available == "true";

        await populateMenuCategories(category_id);

        modal.style.display = "flex";
    };

    // Delete menu
    window.deleteMenu = async function (id) {
        if (!confirm("Are you sure you want to delete this menu item?")) return;

        const token = localStorage.getItem("token");

        const res = await fetch(`/api/v1/menus/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.error) alert(data.error);

        if (typeof loadMenuPage === "function") loadMenuPage();
    };
}

// Fetch categories for menu modal
async function populateMenuCategories(selectedId = null) {
    const select = document.getElementById("menuCategory");
    select.innerHTML = "<option>Loading...</option>";

    const token = localStorage.getItem("token");

    try {
        const res = await fetch("/api/v1/categories/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const categories = await res.json();

        if (!Array.isArray(categories)) {
            select.innerHTML = "<option value=''>No categories found</option>";
            return;
        }

        select.innerHTML = categories
            .map(
                (cat) => `
            <option value="${cat.id}" ${selectedId === cat.id ? "selected" : ""}>
                ${cat.name}
            </option>
        `
            )
            .join("");
    } catch (err) {
        console.error(err);
        select.innerHTML = "<option value=''>Failed to load categories</option>";
    }
}

// Save menu
function saveMenu(formData, closeModal) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) return alert("Unauthorized.");
    if (!user || user.role.toLowerCase() !== "admin")
        return alert("Only admin can create menu items.");

    fetch("/api/v1/menus/", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) return alert(data.error);
            if (typeof loadMenuPage === "function") loadMenuPage();
            closeModal();
        })
        .catch(() => alert("Failed to save menu"));
}

// Update menu
function updateMenu(id, formData, closeModal) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) return alert("Unauthorized.");
    if (!user || user.role.toLowerCase() !== "admin")
        return alert("Only admin can update menu items.");

    fetch(`/api/v1/menus/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) return alert(data.error);
            if (typeof loadMenuPage === "function") loadMenuPage();
            closeModal();
        })
        .catch(() => alert("Failed to update menu"));
}

window.initializeMenuModal = initializeMenuModal;
