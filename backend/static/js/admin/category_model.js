function initializeCategoryModal() {
    const addBtn = document.getElementById('addCategoryBtn');
    const modal = document.getElementById('addCategoryModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveCategoryBtn');
    const categoryForm = document.getElementById('categoryForm');
    const categoryName = document.getElementById('categoryName');
    const categoryDescription = document.getElementById('categoryDescription');

    let editingId = null;

    addBtn.addEventListener('click', () => {
        editingId = null;
        saveBtn.textContent = "Save Category";
        modal.style.display = 'flex';
        categoryForm.reset();
    });

    function closeModal() {
        modal.style.display = 'none';
        categoryForm.reset();
        editingId = null;
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    window.addEventListener('click', event => {
        if (event.target === modal) closeModal();
    });

    saveBtn.addEventListener('click', () => {
        const name = categoryName.value.trim();
        const description = categoryDescription.value.trim();

        if (!name) {
            alert("Category name is required");
            return;
        }

        const payload = { name, description };

        if (editingId) {
            updateCategory(editingId, payload, closeModal);
        } else {
            saveCategory(payload, closeModal);
        }
    });

    window.startEditCategory = function (id, name, description) {
        editingId = id;
        saveBtn.textContent = "Update Category";
        categoryName.value = name;
        categoryDescription.value = description ?? "";
        modal.style.display = 'flex';
    };

    window.deleteCategory = function (id) {
        if (!confirm("Are you sure you want to delete this category?")) return;
        deleteCategoryFromBackend(id);
    };
}

function saveCategory(category, closeModal) {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token) return alert("Unauthorized. Please log in.");
    if (!user || user.role.toLowerCase() !== "admin")
        return alert("Only admin can create categories.");

    fetch('/api/v1/categories/', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(category)
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) return alert(data.error);
        if (typeof loadCategoryPage === "function") loadCategoryPage();
        closeModal();
    })
    .catch(() => alert("Failed to save category"));
}

function updateCategory(id, category, closeModal) {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token) return alert("Unauthorized.");
    if (!user || user.role.toLowerCase() !== "admin")
        return alert("Only admin can update categories.");

    fetch(`/api/v1/categories/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(category)
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) return alert(data.error);
        if (typeof loadCategoryPage === "function") loadCategoryPage();
        closeModal();
    })
    .catch(() => alert("Failed to update category"));
}

function deleteCategoryFromBackend(id) {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token) return alert("Unauthorized.");
    if (!user || user.role.toLowerCase() !== "admin")
        return alert("Only admin can delete categories.");

    fetch(`/api/v1/categories/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) return alert(data.error);
        if (typeof loadCategoryPage === "function") loadCategoryPage();
    })
    .catch(() => alert("Failed to delete category"));
}

window.initializeCategoryModal = initializeCategoryModal;
