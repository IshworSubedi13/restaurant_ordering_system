const menuItems = [
            {
                id: 1,
                name: "Garlic Bread",
                category: "starters",
                price: 4.50,
                description: "Freshly baked bread with garlic butter and herbs",
                image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            },
            {
                id: 2,
                name: "Bruschetta",
                category: "starters",
                price: 5.90,
                description: "Toasted bread topped with tomatoes, garlic, and basil",
                image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            },
            {
                id: 3,
                name: "Margherita Pizza",
                category: "mains",
                price: 12.90,
                description: "Classic pizza with tomato sauce, mozzarella, and basil",
                image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            },
            {
                id: 4,
                name: "Spaghetti Carbonara",
                category: "mains",
                price: 14.50,
                description: "Pasta with eggs, cheese, pancetta, and black pepper",
                image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            },
            {
                id: 5,
                name: "Grilled Salmon",
                category: "mains",
                price: 16.90,
                description: "Fresh salmon fillet with lemon butter sauce and vegetables",
                image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            },
            {
                id: 6,
                name: "Tiramisu",
                category: "desserts",
                price: 6.50,
                description: "Classic Italian dessert with coffee-soaked ladyfingers",
                image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            },
            {
                id: 7,
                name: "Chocolate Lava Cake",
                category: "desserts",
                price: 7.90,
                description: "Warm chocolate cake with a molten chocolate center",
                image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            },
            {
                id: 8,
                name: "House Red Wine",
                category: "drinks",
                price: 5.50,
                description: "Glass of our finest house red wine",
                image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            },
            {
                id: 9,
                name: "Fresh Lemonade",
                category: "drinks",
                price: 3.90,
                description: "Homemade lemonade with fresh mint",
                image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            }
        ];

        let cart = [];

        const menuItemsContainer = document.getElementById('menu-items');
        const cartItemsContainer = document.getElementById('cart-items');
        const cartCountElement = document.getElementById('cart-count');
        const cartTotalElement = document.getElementById('cart-total');
        const checkoutButton = document.getElementById('checkout-btn');
        const categoryButtons = document.querySelectorAll('.category-btn');
        const orderModal = document.getElementById('order-modal');
        const closeModalButton = document.getElementById('close-modal');

        document.addEventListener('DOMContentLoaded', function() {
            renderMenuItems('all');
            setupEventListeners();
        });

        function renderMenuItems(category) {
            menuItemsContainer.innerHTML = '';

            const filteredItems = category === 'all'
                ? menuItems
                : menuItems.filter(item => item.category === category);

            filteredItems.forEach(item => {
                const menuItemElement = document.createElement('div');
                menuItemElement.className = 'menu-item';
                menuItemElement.dataset.id = item.id;

                menuItemElement.innerHTML = `
                    <div class="item-image" style="background-image: url('${item.image}')">
                    </div>
                    <div class="item-details">
                        <div class="item-header">
                            <h3 class="item-name">${item.name}</h3>
                            <span class="item-price">€${item.price.toFixed(2)}</span>
                        </div>
                        <p class="item-description">${item.description}</p>
                        <div class="item-actions">
                            <div class="quantity-controls">
                                <button class="quantity-btn minus">-</button>
                                <span class="quantity">0</span>
                                <button class="quantity-btn plus">+</button>
                            </div>
                            <button class="add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                `;

                menuItemsContainer.appendChild(menuItemElement);
            });

            addMenuEventListeners();
        }

        function setupEventListeners() {
            categoryButtons.forEach(button => {
                button.addEventListener('click', function() {
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    renderMenuItems(this.dataset.category);
                });
            });

            checkoutButton.addEventListener('click', function() {
                if (cart.length === 0) {
                    alert('Your cart is empty. Please add some items before checking out.');
                    return;
                }

                orderModal.style.display = 'flex';
            });

            closeModalButton.addEventListener('click', function() {
                orderModal.style.display = 'none';
                cart = [];
                updateCartDisplay();
            });
        }

        function addMenuEventListeners() {
            document.querySelectorAll('.quantity-btn.plus').forEach(button => {
                button.addEventListener('click', function() {
                    const menuItem = this.closest('.menu-item');
                    const itemId = parseInt(menuItem.dataset.id);
                    const quantityElement = menuItem.querySelector('.quantity');
                    let quantity = parseInt(quantityElement.textContent);
                    quantityElement.textContent = ++quantity;
                });
            });

            document.querySelectorAll('.quantity-btn.minus').forEach(button => {
                button.addEventListener('click', function() {
                    const menuItem = this.closest('.menu-item');
                    const itemId = parseInt(menuItem.dataset.id);
                    const quantityElement = menuItem.querySelector('.quantity');
                    let quantity = parseInt(quantityElement.textContent);

                    if (quantity > 0) {
                        quantityElement.textContent = --quantity;
                    }
                });
            });
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    const menuItem = this.closest('.menu-item');
                    const itemId = parseInt(menuItem.dataset.id);
                    const quantityElement = menuItem.querySelector('.quantity');
                    const quantity = parseInt(quantityElement.textContent);

                    if (quantity === 0) {
                        alert('Please select at least 1 item');
                        return;
                    }

                    addToCart(itemId, quantity);
                    quantityElement.textContent = 0;
                });
            });
        }

        function addToCart(itemId, quantity) {
            const menuItem = menuItems.find(item => item.id === itemId);

            const existingItemIndex = cart.findIndex(item => item.id === itemId);

            if (existingItemIndex !== -1) {
                cart[existingItemIndex].quantity += quantity;
            } else {
                cart.push({
                    id: menuItem.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity: quantity
                });
            }

            updateCartDisplay();
        }

        function removeFromCart(itemId) {
            cart = cart.filter(item => item.id !== itemId);
            updateCartDisplay();
        }

        function updateCartQuantity(itemId, newQuantity) {
            const cartItem = cart.find(item => item.id === itemId);

            if (cartItem) {
                if (newQuantity <= 0) {
                    removeFromCart(itemId);
                } else {
                    cartItem.quantity = newQuantity;
                }
            }

            updateCartDisplay();
        }

        function updateCartDisplay() {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;

            cartItemsContainer.innerHTML = '';

            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            } else {
                cart.forEach(item => {
                    const cartItemElement = document.createElement('div');
                    cartItemElement.className = 'cart-item';

                    cartItemElement.innerHTML = `
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">€${item.price.toFixed(2)} each</div>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                            </div>
                            <div class="remove-item" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </div>
                        </div>
                    `;

                    cartItemsContainer.appendChild(cartItemElement);
                });

                document.querySelectorAll('.cart-item-controls .quantity-btn.plus').forEach(button => {
                    button.addEventListener('click', function() {
                        const itemId = parseInt(this.dataset.id);
                        const cartItem = cart.find(item => item.id === itemId);
                        updateCartQuantity(itemId, cartItem.quantity + 1);
                    });
                });

                document.querySelectorAll('.cart-item-controls .quantity-btn.minus').forEach(button => {
                    button.addEventListener('click', function() {
                        const itemId = parseInt(this.dataset.id);
                        const cartItem = cart.find(item => item.id === itemId);
                        updateCartQuantity(itemId, cartItem.quantity - 1);
                    });
                });

                document.querySelectorAll('.remove-item').forEach(button => {
                    button.addEventListener('click', function() {
                        const itemId = parseInt(this.dataset.id);
                        removeFromCart(itemId);
                    });
                });
            }

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotalElement.textContent = `€${total.toFixed(2)}`;
        }