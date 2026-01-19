// Barrel exports for all components
// This makes importing components cleaner throughout the app

// Cart Components
export { default as CartItem } from "./cart/CartItem";
export { default as CartSummary } from "./cart/CartSummary";

// Checkout Components
export { default as CheckoutForm } from "./checkout/CheckoutForm";
export { default as OrderSummary } from "./checkout/OrderSummary";

// Common Components
export { default as Loading } from "./common/Loading";
export { default as LoadingPage } from "./common/LoadingPage";

// Error Components
export { default as ErrorBoundary } from "./error/ErrorBoundary";

// Layout Components
export { default as Footer } from "./layout/Footer";
export { default as Header } from "./layout/Header";
export { default as Layout } from "./layout/Layout";

// Order Components
export { default as OrderStatusTimeline } from "./orders/OrderStatusTimeline";

// Product Components
export { default as ProductCard } from "./products/ProductCard";
export { default as ProductList } from "./products/ProductList";
export { default as ProductReviewForm } from "./products/ProductReviewForm";
export { default as SearchBar } from "./products/SearchBar";
