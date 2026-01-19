# Development Guide

This guide provides instructions for developing and contributing to the E-Commerce Platform.

## Prerequisites

- Node.js v18.x or higher
- MongoDB (local or Atlas)
- Stripe Account for payment processing
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd E-Commerce_Platform
```

### 2. Install Dependencies

Install root dependencies:

```bash
npm install
```

This will install dependencies for both Client and Server workspaces.

### 3. Environment Setup

Create `.env` file in the Server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/e-commerce
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Create `.env` file in the Client directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### 4. Start Development Servers

Run both client and server concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:client  # Start React frontend
npm run dev:server  # Start Express backend
```

## Project Structure

### Client (React + TypeScript + Vite)

- `src/components/` - Reusable UI components
- `src/config/` - Configuration files
- `src/constants/` - Application constants
- `src/context/` - React Context providers
- `src/hooks/` - Custom React hooks
- `src/pages/` - Page components
- `src/services/` - API service functions
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions

### Server (Express + MongoDB)

- `src/config/` - Configuration (database, CORS, security)
- `src/controllers/` - Route handlers
- `src/middlewares/` - Express middlewares
- `src/models/` - Mongoose models
- `src/routes/` - API route definitions
- `src/validators/` - Input validation
- `src/utils/` - Utility functions

## Coding Standards

### TypeScript/React (Client)

- Use functional components with hooks
- Use TypeScript for type safety
- Follow the existing folder structure
- Use barrel exports (`index.ts`) for cleaner imports
- Use custom hooks for reusable logic
- Keep components small and focused

### JavaScript/Express (Server)

- Use async/await for asynchronous operations
- Validate input data using validators
- Handle errors consistently
- Use environment variables for configuration
- Follow RESTful API conventions

## Available Scripts

### Root

- `npm run dev` - Start both client and server
- `npm run dev:client` - Start client only
- `npm run dev:server` - Start server only

### Client

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Server

- `npm run dev` - Start with nodemon
- `npm run start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm run create-admin` - Create admin user

## Database Setup

### Seeding Data

```bash
cd Server
npm run seed
```

### Creating Admin User

```bash
cd Server
npm run create-admin
```

## Testing

### Test Cards (Stripe)

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

Use any future expiry date and any 3-digit CVC.

## Deployment

The project is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

See `vercel.json` for deployment configuration.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure code follows existing patterns
4. Test your changes thoroughly
5. Create a pull request

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Try using IP address instead of `localhost`

### Stripe Payment Issues

- Verify API keys are correct
- Use test mode keys in development
- Check browser console for Stripe.js errors

### CORS Issues

- Ensure CLIENT_URL is set correctly
- Check for trailing slashes in URLs
