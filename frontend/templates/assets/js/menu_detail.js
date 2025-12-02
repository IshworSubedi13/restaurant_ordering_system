const menuItems = [
    {
        id: 1,
        name: "Garlic Bread",
        category: "starters",
        price: 4.50,
        description: "Freshly baked bread with garlic butter and herbs, perfectly toasted to golden perfection. Served warm with a side of marinara sauce for dipping.",
        image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        ingredients: ["Artisan bread", "Garlic butter", "Fresh herbs", "Parmesan cheese", "Marinara sauce"],
        allergens: ["Gluten", "Dairy"],
        preparationTime: "10-15 minutes",
        spicyLevel: "Mild"
    },
    {
        id: 2,
        name: "Bruschetta",
        category: "starters",
        price: 5.90,
        description: "Toasted bread topped with fresh tomatoes, garlic, basil, and extra virgin olive oil. A classic Italian appetizer bursting with fresh flavors.",
        image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        ingredients: ["Ciabatta bread", "Roma tomatoes", "Fresh basil", "Garlic", "Extra virgin olive oil", "Balsamic glaze"],
        allergens: ["Gluten"],
        preparationTime: "10 minutes",
        spicyLevel: "Mild"
    },
    {
        id: 3,
        name: "Margherita Pizza",
        category: "mains",
        price: 12.90,
        description: "Classic pizza with tomato sauce, fresh mozzarella, and basil leaves. Simple, authentic, and absolutely delicious.",
        image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        ingredients: ["Pizza dough", "San Marzano tomatoes", "Fresh mozzarella", "Basil leaves", "Extra virgin olive oil"],
        allergens: ["Gluten", "Dairy"],
        preparationTime: "15-20 minutes",
        spicyLevel: "Mild"
    }
];

// Sample Reviews Data
const sampleReviews = {
    1: [
        {
            id: 1,
            userName: "Sarah Johnson",
            rating: 5,
            comment: "Absolutely delicious! The garlic bread was perfectly crispy and the marinara sauce was amazing. Will definitely order again!",
            date: "2024-01-15",
            userInitials: "SJ"
        },
        {
            id: 2,
            userName: "Mike Chen",
            rating: 4,
            comment: "Great flavor and good portion size. Could use a bit more garlic for my taste, but overall very good.",
            date: "2024-01-10",
            userInitials: "MC"
        },
        {
            id: 3,
            userName: "Emma Davis",
            rating: 5,
            comment: "Best garlic bread I've ever had! The herbs were fresh and the bread was perfectly toasted. Highly recommend!",
            date: "2024-01-08",
            userInitials: "ED"
        }
    ],
    2: [
        {
            id: 1,
            userName: "Alex Rodriguez",
            rating: 4,
            comment: "Fresh and flavorful bruschetta. The tomatoes were perfectly ripe and the balsamic glaze added a nice touch.",
            date: "2024-01-12",
            userInitials: "AR"
        }
    ],
    3: [
        {
            id: 1,
            userName: "Lisa Wang",
            rating: 5,
            comment: "Authentic Italian pizza! The crust was perfect and the ingredients were top quality. Will be coming back for more!",
            date: "2024-01-14",
            userInitials: "LW"
        }
    ]
};

// Get item ID from URL parameters
function getItemIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    return id || 1; // Default to first item if no ID provided
}

// Get reviews for current item
function getReviewsForItem(itemId) {
    return sampleReviews[itemId] || [];
}

// Calculate rating statistics
function calculateRatingStats(reviews) {
    if (reviews.length === 0) {
        return {
            average: 0,
            total: 0,
            distribution: {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
        };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;

    const distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    reviews.forEach(review => {
        distribution[review.rating]++;
    });

    return {
        average: Math.round(average * 10) / 10,
        total,
        distribution
    };
}

// Render item details
function renderItemDetails() {
    const itemId = getItemIdFromURL();
    const item = menuItems.find(menuItem => menuItem.id === itemId);
    const container = document.getElementById('item-details');

    if (!item) {
        container.innerHTML = '<div class="error">Item not found</div>';
        return;
    }

    container.innerHTML = `
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-info">
                    <span class="item-category">${item.category}</span>
                    <h1 class="item-name">${item.name}</h1>
                    <div class="item-price">€${item.price.toFixed(2)}</div>
                    <p class="item-description">${item.description}</p>

                    <div class="order-controls">
                        <div class="quantity-section">
                            <span class="quantity-label">Quantity:</span>
                            <div class="quantity-controls">
                                <button class="quantity-btn minus">-</button>
                                <span class="quantity-display">1</span>
                                <button class="quantity-btn plus">+</button>
                            </div>
                        </div>
                        <button class="add-to-cart-btn" data-id="${item.id}">
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart - €${item.price.toFixed(2)}
                        </button>
                    </div>

                    <div class="nutritional-info">
                        <h3>Details</h3>
                        <div class="nutrition-grid">
                            <div class="nutrition-item">
                                <span class="nutrition-value">${item.preparationTime}</span>
                                <span class="nutrition-label">Prep Time</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-value">${item.spicyLevel}</span>
                                <span class="nutrition-label">Spice Level</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-value">${item.allergens.join(', ')}</span>
                                <span class="nutrition-label">Allergens</span>
                            </div>
                        </div>
                    </div>

                    <div class="ingredients">
                        <h3>Ingredients</h3>
                        <ul>
                            ${item.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;

    // Add event listeners
    addEventListeners(item);
    renderReviews(item.id);
    renderRelatedItems(item.category, item.id);
}

// Render reviews section
function renderReviews(itemId) {
    const reviews = getReviewsForItem(itemId);
    const stats = calculateRatingStats(reviews);

    // Render rating summary
    const ratingSummary = document.getElementById('rating-summary');
    ratingSummary.innerHTML = `
                <div class="average-rating">
                    <div class="rating-number">${stats.average}</div>
                    <div class="rating-stars">${getStarRating(stats.average)}</div>
                    <div class="total-reviews">${stats.total} reviews</div>
                </div>
                <div class="rating-bars">
                    ${[5, 4, 3, 2, 1].map(rating => `
                        <div class="rating-bar">
                            <span class="rating-label">${rating} ★</span>
                            <div class="rating-progress">
                                <div class="rating-progress-fill" style="width: ${stats.total > 0 ? (stats.distribution[rating] / stats.total) * 100 : 0}%"></div>
                            </div>
                            <span class="rating-count">${stats.distribution[rating]}</span>
                        </div>
                    `).join('')}
                </div>
            `;

    // Render reviews list
    const reviewsList = document.getElementById('reviews-list');
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to review this item!</p>';
    } else {
        reviewsList.innerHTML = reviews.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <div class="reviewer-avatar">${review.userInitials}</div>
                                <div>
                                    <div class="reviewer-name">${review.userName}</div>
                                    <div class="review-date">${formatDate(review.date)}</div>
                                </div>
                            </div>
                            <div class="review-rating">${getStarRating(review.rating)}</div>
                        </div>
                        <div class="review-content">${review.comment}</div>
                    </div>
                `).join('');
    }
}

// Get star rating HTML
function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

// Format date
function formatDate(dateString) {
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Add event listeners for quantity controls
function addEventListeners(item) {
    let quantity = 1;
    const quantityDisplay = document.querySelector('.quantity-display');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');

    // Update price when quantity changes
    function updatePrice() {
        const totalPrice = item.price * quantity;
        addToCartBtn.innerHTML = `
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart - €${totalPrice.toFixed(2)}
                `;
    }

    // Plus button
    document.querySelector('.quantity-btn.plus').addEventListener('click', () => {
        quantity++;
        quantityDisplay.textContent = quantity;
        updatePrice();
    });

    // Minus button
    document.querySelector('.quantity-btn.minus').addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            quantityDisplay.textContent = quantity;
            updatePrice();
        }
    });

    // Add to cart button
    addToCartBtn.addEventListener('click', () => {
        addToCart(item.id, quantity);
        showNotification(`${quantity} ${item.name} added to cart!`);
    });
}

// Add to cart function
function addToCart(itemId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === itemId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        const item = menuItems.find(menuItem => menuItem.id === itemId);
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: quantity,
            image: item.image
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart updated:', cart);
}

// Review modal functions
let currentRating = 0;

function openReviewModal() {
    document.getElementById('review-modal').style.display = 'flex';
    currentRating = 0;
    resetStarRating();
}

function closeReviewModal() {
    document.getElementById('review-modal').style.display = 'none';
    document.getElementById('review-form').reset();
}

function resetStarRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => star.classList.remove('active'));
}

function setupStarRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            currentRating = rating;

            // Update star display
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });

        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.style.color = '#ffc107';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });

        star.addEventListener('mouseout', () => {
            stars.forEach((s, index) => {
                if (index < currentRating) {
                    s.style.color = '#ffc107';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });
    });
}

// Handle review submission
function handleReviewSubmission(event) {
    event.preventDefault();

    if (currentRating === 0) {
        alert('Please select a rating');
        return;
    }

    const comment = event.target.querySelector('textarea').value.trim();
    if (!comment) {
        alert('Please write a review');
        return;
    }

    // In a real app, you would send this to your backend
    const newReview = {
        id: Date.now(),
        userName: "You",
        rating: currentRating,
        comment: comment,
        date: new Date().toISOString().split('T')[0],
        userInitials: "Y"
    };

    const itemId = getItemIdFromURL();
    if (!sampleReviews[itemId]) {
        sampleReviews[itemId] = [];
    }
    sampleReviews[itemId].unshift(newReview);

    closeReviewModal();
    renderReviews(itemId);
    showNotification('Thank you for your review!');
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Render related items
function renderRelatedItems(category, currentItemId) {
    const relatedItems = menuItems
        .filter(item => item.category === category && item.id !== currentItemId)
        .slice(0, 3);

    const container = document.getElementById('related-items');

    if (relatedItems.length === 0) {
        container.innerHTML = '<p>No related items found.</p>';
        return;
    }

    container.innerHTML = relatedItems.map(item => `
                <div class="related-item" onclick="viewItem(${item.id})">
                    <div class="related-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="related-item-info">
                        <h3 class="related-item-name">${item.name}</h3>
                        <div class="related-item-price">€${item.price.toFixed(2)}</div>
                    </div>
                </div>
            `).join('');
}

// View item function
function viewItem(itemId) {
    window.location.href = `?id=${itemId}`;
}

// Go back function
function goBack() {
    window.history.back();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    renderItemDetails();
    setupStarRating();

    // Add review form submission handler
    document.getElementById('review-form').addEventListener('submit', handleReviewSubmission);
});

// Close modal when clicking outside
document.addEventListener('click', (event) => {
    const modal = document.getElementById('review-modal');
    if (event.target === modal) {
        closeReviewModal();
    }
});