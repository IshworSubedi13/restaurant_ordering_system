# Restaurant Ordering System

## Project Overview

This project is a restaurant ordering web application which provide a user-friendly interface for displaying food menus, managing orders, and handling administrative tasks.
This project is done as a part of course studies of Full Stack Web Development (TX00FT04-3002).

**Tech Stack:**
- **Front-end:** HTML, CSS, JavaScript 
- **Back-end:** Python, Flask  
- **Database:** MongoDB (via Mongoengine)  
- **Architecture:** RESTful API  

---
### Application Idea

The project is a Restaurant Menu & Ordering System designed to digitize the dining experience. Its core idea is to provide a centralized platform where customers can:
* View daily menus and highlights easily.
* Check prices and dietary information for each menu item.
* Place orders for pick-up efficiently.
* Leave reviews and provide feedback on menu items.

At the same time, the system allows restaurant staff and administrators to:
* Manage menu items, categories, and specials.
* Handle orders and track order status.
* Publish announcements or updates.
* Analyze user feedback and generate statistics.
This system combines modern web technologies to create a responsive, secure, and user-friendly application for both front-end users (customers) and back-end users (restaurant staff/admins).
---
### Audience
#### Primary Audience:
* Customers who want to browse menus, place orders for pick-up, and view daily specials.
#### Secondary Audience:
* Restaurant staff and administrators who need an efficient way to manage menus, orders, and customer interactions.
#### Additional Users:
* Tourists or new visitors who need menu information and directions.

---

### Purpose of the Project

This project was created to:

* Make food ordering in restaurants faster and more convenient.
* Be available online 24/7 so that customers can see menus and order anytime they want.
* Provide clear information about menu items, including prices and dietary restrictions.
* Allow restaurant staff to efficiently manage orders, menus, and daily specials.
* Collect customer feedback through reviews to improve service and menu offerings.

---

### Features

* Home page displaying restaurant information and today’s highlighted menu.
* Admin login and secure admin panel for managing the system.
* Add, edit, and remove menu items, including prices and descriptions.
* Menu displayed dynamically using a self-made JSON API.
* Customer login and registration system.
* Shopping cart for selecting and managing orders.
* Order management system for admins to view, update, and track orders.
* Todays special menu on home page.
* A clean dashboard for admin where admin can track all the activities.
* Logged in User can add, edit and delete review to the menu.
* User can manage their order such as they can see their order history and track orders, even cancel the order if not preparing.
* Responsive and adaptive layout for all devices.
* Multilingual support (Finnish/English).
* Professionally structured and commented code with RESTful architecture.
* Deployed online with full front-end and back-end functionality.

---

### Future Improvements

This project can be expanded in many ways:

* Filter menu items by dietary restrictions, meal type, or price range.
* Online Payment Integration
* Order Notifications
* Mobile App Version
* Integration with External Services like hsl planner, wolt and foodora.

---

## Setup Environment Variables

Create a `.env` file at the root of your project with the following content:

```dotenv
MONGO_URI=your-mongodb-uri
JWT_SECRET_KEY=your-secret-key
DEBUG=True
FLASK_RELOADER=False
FLASK_DEBUG=False

```

**Notes:**

* Keep the `.env` file private.

In your `config.py`:

```python
from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    DEBUG = os.getenv("DEBUG", "True") == "True"

```

---

## How to Use

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/restaurant-menu.git
cd restaurant-menu
```

2. **Set up a virtual environment**
```bash
python -m venv venv
# Activate the virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Run the application**
```bash
python app.py
```

5. **Access the website**
Open your browser at: `http://127.0.0.1:5000`  

---

## requirements.txt

Example dependencies for the project:

```
Flask==3.1.2
flask-jwt-extended==4.7.1
mongoengine==0.29.1
pymongo==4.15.3
python-dotenv==1.1.1
Werkzeug==3.1.3
Flask-Cors==6.0.1
gunicorn==23.0.0
```

## API Endpoints

### Authentication
- `POST api/v1/auth/register` - Register a new user
- `POST api/v1/auth/login` - Login and receive JWT access token

### Categories
- `GET api/v1/categories/` - List all categories (admin only)
- `GET api/v1/categories/all` - List all categories (public)
- `GET api/v1/categories/<category_id>` - Get category by ID (admin only)
- `POST api/v1/categories/` - Create new category (admin only)
- `PUT api/v1/categories/<category_id>` - Update category (admin only)
- `DELETE api/v1/categories/<category_id>` - Delete category (admin only)
- `GET api/v1/categories/name/<name>` - Get category by name (admin only)

### Menu
- `GET api/v1/menus/` - List all menus (admin only)
- `GET api/v1/menus/all` - List all menus (public)
- `POST api/v1/menus/` - Create new menu item (admin only)
- `PUT api/v1/menus/<menu_id>` - Update menu item (admin only)
- `DELETE api/v1/menus/<menu_id>` - Delete menu item (admin only)
- `GET api/v1/menus/specials` - Get today's specials

### Orders
- `POST api/v1/orders/` - Create a new order
- `GET api/v1/orders/` - Get all orders (admin sees all, user sees own)
- `GET api/v1/orders/<order_id>` - Get order by ID
- `PUT api/v1/orders/<order_id>` - Update order (admin only)
- `DELETE api/v1/orders/<order_id>` - Delete order (admin only)
- `POST api/v1/orders/<order_id>/cancel` - Cancel order (user)
- `GET api/v1/orders/total_orders` - Total orders (admin only)
- `GET api/v1/orders/total_revenue` - Total revenue (admin only)

### Reviews
- `POST api/v1/reviews/` - Create a review
- `GET api/v1/reviews/` - List all reviews
- `GET api/v1/reviews/<review_id>` - Get review by ID
- `PUT api/v1/reviews/<review_id>` - Update review (owner only)
- `DELETE api/v1/reviews/<review_id>` - Delete review (owner or admin)
- `GET api/v1/reviews/review_stats` - Review statistics (admin only)

### Users
- `GET api/v1/users/` - List all users (admin only)
- `GET api/v1/users/<user_id>` - Get user by ID (admin only)
- `GET api/v1/users/count` - Total customers (admin only)

---
### Visit Website
[Click here to view the live site](https://restaurant-ordering-system-8i7d.onrender.com)
Testing For admin:
username: admin@gmail.com
password: admin123

## Project Contributors

- **Ishwor Subedi** 
- **Sujan BK Barali** 
- **Roshan Poudel**
- **Kishan Bhuva**

---
### Feedback
Use metropolia gmail to access the form
[For students](https://docs.google.com/forms/d/e/1FAIpQLSdfI4xUrcaJaJQKCe4NsBc1_p88TSG1T0357VdJrm32TQu1tA/viewform)
