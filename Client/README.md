# E-Commerce Platform Client

This is the frontend React application for the E-Commerce Platform, built with React, TypeScript, and Tailwind CSS.

## Features

- **Product Management**: Browse, search, filter, and sort products by category and price
- **User Authentication**: Register, login, and profile management
- **Shopping Cart**: Add, remove, and update product quantities
- **Checkout Process**: Secure payment processing with Stripe
- **Order Management**: View order history and status
- **Admin Dashboard**: Manage products, orders, and users (Admin only)
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see main project README)

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build files will be available in the `dist` directory.

To preview the production build locally:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

```
src/
  ├── assets/          # Static assets like images and icons
  ├── components/      # Reusable React components
  │   ├── cart/        # Cart-related components
  │   ├── checkout/    # Checkout-related components
  │   ├── layout/      # Layout components like Header and Footer
  │   └── products/    # Product-related components
  ├── context/         # React context providers
  ├── pages/           # Page components
  │   ├── account/     # User account pages
  │   ├── admin/       # Admin dashboard pages
  │   ├── auth/        # Authentication pages
  │   ├── cart/        # Shopping cart page
  │   ├── checkout/    # Checkout and order confirmation pages
  │   ├── home/        # Homepage
  │   ├── info/        # Informational pages (About, Contact, etc.)
  │   └── products/    # Product listing and detail pages
  ├── services/        # API service functions
  ├── types/           # TypeScript type definitions
  ├── App.tsx          # Main App component with routing
  ├── main.tsx         # Application entry point
  └── index.css        # Global CSS styles
```

## Key Technologies

- **React**: JavaScript library for building user interfaces
- **TypeScript**: Adds static typing to JavaScript
- **React Router**: Declarative routing for React applications
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: Promise-based HTTP client
- **Stripe JS**: Library for integrating with Stripe payment processing
- **Vite**: Build tool and development server

## API Integration

The frontend integrates with the backend API using the service files in the `services` directory:

- `api.ts`: Base API setup with Axios and interceptors
- `authService.ts`: User authentication and profile management
- `productService.ts`: Product listing, details, and management
- `orderService.ts`: Order creation and management
- `paymentService.ts`: Payment processing with Stripe

## Authentication

JWT-based authentication is implemented using token storage in localStorage. The token is automatically included in all API requests via Axios interceptors.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License
