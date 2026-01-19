# E-Commerce Platform

A full-featured e-commerce platform with product management, cart functionality, and secure payment processing using Stripe API integration.

## Project Structure

```
E-Commerce_Platform/
├── Client/                    # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── cart/          # Cart-related components
│   │   │   ├── checkout/      # Checkout components
│   │   │   ├── common/        # Shared components (Loading, etc.)
│   │   │   ├── error/         # Error handling components
│   │   │   ├── layout/        # Layout components (Header, Footer)
│   │   │   ├── orders/        # Order-related components
│   │   │   ├── products/      # Product-related components
│   │   │   └── index.ts       # Barrel exports
│   │   ├── config/            # Configuration files
│   │   │   └── api.config.ts  # API configuration
│   │   ├── constants/         # Application constants
│   │   │   ├── index.ts       # Shared constants
│   │   │   └── routes.ts      # Route path constants
│   │   ├── context/           # React Context providers
│   │   │   └── CartContext.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts     # Authentication hook
│   │   │   ├── useCart.ts     # Cart context hook
│   │   │   ├── useDebounce.ts # Debounce hook
│   │   │   ├── useLocalStorage.ts # LocalStorage hook
│   │   │   └── index.ts       # Barrel exports
│   │   ├── pages/             # Page components
│   │   │   ├── account/       # User account pages
│   │   │   ├── admin/         # Admin dashboard pages
│   │   │   ├── auth/          # Authentication pages
│   │   │   ├── cart/          # Cart page
│   │   │   ├── checkout/      # Checkout pages
│   │   │   ├── error/         # Error pages
│   │   │   ├── home/          # Home page
│   │   │   ├── info/          # Static info pages
│   │   │   ├── orders/        # Order pages
│   │   │   ├── products/      # Product pages
│   │   │   └── index.ts       # Barrel exports
│   │   ├── services/          # API service functions
│   │   │   └── index.ts       # Barrel exports
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Utility functions
│   │       ├── formatters.ts  # Formatting utilities
│   │       ├── validators.ts  # Validation utilities
│   │       └── invoiceGenerator.ts
│   └── public/                # Static assets
├── Server/                    # Express.js backend
│   ├── src/
│   │   ├── config/            # Configuration
│   │   │   ├── database.js    # Database connection
│   │   │   ├── cors.js        # CORS settings
│   │   │   └── security.js    # Security middleware
│   │   ├── controllers/       # Route handlers
│   │   ├── middlewares/       # Express middlewares
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API route definitions
│   │   ├── validators/        # Input validation
│   │   │   ├── orderValidator.js
│   │   │   ├── productValidator.js
│   │   │   └── userValidator.js
│   │   ├── utils/             # Utility functions
│   │   │   ├── paymentValidator.js
│   │   │   └── testCardValidator.js
│   │   └── index.js           # Server entry point
│   ├── scripts/               # Utility scripts
│   │   ├── createAdmin.js     # Admin user creation
│   │   ├── seeder.js          # Database seeder
│   │   └── scraper/           # Data scraping utilities
│   └── uploads/               # File uploads directory
├── api/                       # Vercel serverless functions
├── docs/                      # Documentation
└── vercel.json                # Vercel deployment config
```

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
