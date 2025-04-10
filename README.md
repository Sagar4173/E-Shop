# E-Commerce Platform

A full-featured e-commerce platform with product management, cart functionality, and secure payment processing using Stripe API integration.

## Features

- **Product Management**: Browse, search, filter, and sort products by category and price
- **User Authentication**: Register, login, and profile management
- **Shopping Cart**: Add, remove, and update product quantities
- **Checkout Process**: Secure payment processing with Stripe
- **Order Management**: View order history and status
- **Admin Dashboard**: Manage products, orders, and users (Admin only)
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Frontend

- React (with Vite)
- TypeScript
- Tailwind CSS
- React Router DOM
- Axios
- Stripe JS

### Backend

- Node.js
- Express
- MongoDB
- JSON Web Tokens
- Stripe API

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Stripe Account for payment processing

### Backend Setup

1. Navigate to the Server directory:

   ```
   cd Server
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the Server directory with the following variables:

   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/e-commerce
   JWT_SECRET=your_jwt_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the Client directory:

   ```
   cd Client
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the Client directory with the following variables:

   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

4. Start the development server:

   ```
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get a product by ID
- `POST /api/products` - Create a new product (Admin)
- `PUT /api/products/:id` - Update a product (Admin)
- `DELETE /api/products/:id` - Delete a product (Admin)

### Users

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Orders

- `POST /api/orders` - Create a new order
- `GET /api/orders/myorders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Payments

- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Handle Stripe webhook events

## Deployment

This application can be deployed on platforms like Heroku, Vercel, Netlify, or AWS.

## License

MIT
