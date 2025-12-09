const API_BASE_URL = 'http://127.0.0.1:5000/api/v1';
const currentOrdersContainer = document.getElementById('current-orders');
const orderHistoryContainer = document.getElementById('order-history');
const loadingElement = document.getElementById('loading');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');

document.addEventListener('DOMContentLoaded', function() {
    setupTabs();
    setupLogout();
    checkAuthentication();
});

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const tab = this.dataset.tab;

            if (tab === 'current') {
                currentOrdersContainer.style.display = 'grid';
                orderHistoryContainer.style.display = 'none';
            } else if (tab === 'history') {
                currentOrdersContainer.style.display = 'none';
                orderHistoryContainer.style.display = 'grid';
            }
        });
    });
}
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }
        });
    }
}
function checkAuthentication() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const userData = JSON.parse(user);
        if (userData.name) {
            document.querySelector('.page-title h1').textContent = `${userData.name}'s Orders`;
        }
        loadOrders();
    } catch (error) {
        console.error('Error parsing user data:', error);
        showError('Invalid user data. Please login again.');
    }
}

// Load orders from API
async function loadOrders() {
    const token = localStorage.getItem('token');

    if (!token) {
        showError('Please login to view your orders');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showError('Session expired. Please login again.');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        if (!response.ok) {
            throw new Error(`Failed to load orders: ${response.status}`);
        }

        const orders = await response.json();
        console.log('Orders loaded:', orders);

        showLoading(false);

        if (orders.length === 0) {
            showEmptyState('No orders found', 'Start ordering to see your orders here');
            return;
        }

        renderOrders(orders);

    } catch (error) {
        console.error('Error loading orders:', error);
        showLoading(false);
        showError(error.message || 'Failed to load orders. Please try again.');
    }
}

function showLoading(show) {
    if (show) {
        loadingElement.style.display = 'block';
        errorState.style.display = 'none';
        currentOrdersContainer.style.display = 'none';
        orderHistoryContainer.style.display = 'none';
    } else {
        loadingElement.style.display = 'none';
    }
}

function renderOrders(orders) {
    currentOrdersContainer.innerHTML = '';
    orderHistoryContainer.innerHTML = '';

    orders.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));

    const currentOrders = orders.filter(order => {
        const status = (order.status || 'pending').toLowerCase();
        return status !== 'completed' && status !== 'cancelled';
    });

    const historyOrders = orders.filter(order => {
        const status = (order.status || 'pending').toLowerCase();
        return status === 'completed' || status === 'cancelled';
    });

    if (currentOrders.length > 0) {
        currentOrders.forEach(order => {
            currentOrdersContainer.appendChild(createOrderCard(order));
        });
    } else {
        currentOrdersContainer.innerHTML = createEmptyState(
            'No Current Orders',
            'You don\'t have any active orders.',
            'fa-clipboard-check',
            'Start Ordering'
        );
    }

    if (historyOrders.length > 0) {
        historyOrders.forEach(order => {
            orderHistoryContainer.appendChild(createOrderCard(order));
        });
    } else {
        orderHistoryContainer.innerHTML = createEmptyState(
            'No Order History',
            'You haven\'t placed any orders yet.',
            'fa-history',
            'Start Ordering'
        );
    }

    currentOrdersContainer.style.display = 'grid';
    orderHistoryContainer.style.display = 'none';
}

function createEmptyState(title, message, icon, buttonText) {
    return `
        <div class="empty-state">
            <i class="fas ${icon}"></i>
            <h3>${title}</h3>
            <p>${message}</p>
            <a href="product.html" class="btn-start-order">${buttonText}</a>
        </div>
    `;
}

function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';

    const orderDate = new Date(order.created_at || order.date || Date.now());
    const formattedDate = orderDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const orderId = order._id ? `#${order._id.substring(0, 8).toUpperCase()}` :
                      order.id ? `#${order.id}` : '#ORD000';

    const total = order.items ?
        order.items.reduce((sum, item) => sum + (item.ordered_price * item.quantity), 0) :
        order.total || 0;

    const status = order.status || 'pending';
    const statusClass = getStatusClass(status);

    let itemsHTML = '';
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            itemsHTML += `
                <div class="order-item">
                    <div class="item-info">
                        <span class="item-quantity">${item.quantity}</span>
                        <span class="item-name">${item.name || 'Menu Item'}</span>
                    </div>
                    <span class="item-price">€${(item.ordered_price || item.price || 0).toFixed(2)}</span>
                </div>
            `;
        });
    }

    let actionButtons = '';
    const statusLower = status.toLowerCase();

    if (statusLower === 'pending') {
        actionButtons = `
            <button class="action-btn btn-track" onclick="trackOrder('${orderId}', '${status}')">Track Order</button>
            <button class="action-btn btn-cancel" onclick="cancelOrder('${order._id || order.id}', '${orderId}', this)">Cancel Order</button>
        `;
    } else if (statusLower === 'preparing' || statusLower === 'ready') {
        actionButtons = `
            <button class="action-btn btn-track" onclick="trackOrder('${orderId}', '${status}')">Track Order</button>
            <button class="action-btn btn-cancel" disabled style="opacity:0.5; cursor:not-allowed;">Cannot Cancel</button>
        `;
    } else if (statusLower === 'completed' || statusLower === 'delivered') {
        actionButtons = `
            <button class="action-btn btn-reorder" onclick="reorder('${order._id || order.id}')">Reorder</button>
            <button class="action-btn btn-track" onclick="trackOrder('${orderId}', '${status}')">View Details</button>
        `;
    } else if (statusLower === 'cancelled') {
        actionButtons = `
            <button class="action-btn btn-reorder" onclick="reorder('${order._id || order.id}')">Reorder</button>
            <button class="action-btn btn-track" onclick="trackOrder('${orderId}', '${status}')">View Details</button>
        `;
    }

    orderCard.innerHTML = `
        <div class="order-header">
            <div>
                <div class="order-id">${orderId}</div>
                <div class="order-date">${formattedDate}</div>
            </div>
            <div class="order-status ${statusClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</div>
        </div>
        <div class="order-items">
            ${itemsHTML}
        </div>
        <div class="order-summary">
            <div class="order-total">Total: €${total.toFixed(2)}</div>
            <div class="order-actions">
                ${actionButtons}
            </div>
        </div>
    `;

    return orderCard;
}

function getStatusClass(status) {
    const statusLower = (status || '').toLowerCase();
    const statusMap = {
        'pending': 'status-pending',
        'preparing': 'status-preparing',
        'ready': 'status-ready',
        'delivered': 'status-delivered',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
    };
    return statusMap[statusLower] || 'status-pending';
}

// Cancel order function
async function cancelOrder(orderId, orderDisplayId, cancelButton) {
    if (!confirm(`Are you sure you want to cancel order ${orderDisplayId}? This action cannot be undone.`)) {
        return;
    }

    const token = localStorage.getItem('token');
    const orderCard = cancelButton.closest('.order-card');

    if (!token) {
        alert('Please login to cancel order');
        return;
    }

    try {
        orderCard.classList.add('cancelling');
        cancelButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelling...';
        cancelButton.disabled = true;

        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            alert(`Order ${orderDisplayId} has been cancelled successfully.`);
            const statusElement = orderCard.querySelector('.order-status');
            statusElement.textContent = 'Cancelled';
            statusElement.className = 'order-status status-cancelled';
            const orderActions = orderCard.querySelector('.order-actions');
            orderActions.innerHTML = `
                <button class="action-btn btn-reorder" onclick="reorder('${orderId}')">Reorder</button>
            `;

            setTimeout(() => {
                loadOrders();
            }, 1000);

        } else {
            if (response.status === 403) {
                alert('You can only cancel your own orders.');
            } else if (response.status === 400) {
                alert(result.error || 'This order cannot be cancelled. Only pending orders can be cancelled.');
            } else {
                alert(result.error || 'Failed to cancel order. Please try again.');
            }
            orderCard.classList.remove('cancelling');
            cancelButton.innerHTML = 'Cancel Order';
            cancelButton.disabled = false;
        }

    } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Network error. Please check your connection and try again.');
        orderCard.classList.remove('cancelling');
        cancelButton.innerHTML = 'Cancel Order';
        cancelButton.disabled = false;
    }
}

function trackOrder(orderId, status) {
    alert(`Order ${orderId}\nStatus: ${status}\nEstimated delivery: 25-35 minutes`);
}

function reorder(orderId) {
    if (confirm('Add all items from this order to your cart?')) {
        alert('Items added to cart! Redirecting to checkout...');
        window.location.href = 'product.html';
    }
}

function showError(message) {
    loadingElement.style.display = 'none';
    errorMessage.textContent = message;
    errorState.style.display = 'block';
}

// Auto-refresh current orders every 30 seconds
setInterval(() => {
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab && activeTab.dataset.tab === 'current') {
        loadOrders();
    }
}, 30000);

function goBack() {
  window.history.back();
}