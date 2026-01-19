// Pages barrel exports
// Provides clean imports for all page components

// Account pages
export {
  OrderDetailPage as AccountOrderDetailPage,
  OrdersPage as AccountOrdersPage,
  AddressesPage,
  ProfilePage,
  ReturnRequestPage,
  WishlistPage,
} from "./account";

// Admin pages
export {
  OrderDetailPage as AdminOrderDetailPage,
  OrdersPage as AdminOrdersPage,
  ProductsPage as AdminProductsPage,
  CouponsPage,
  DashboardPage,
  ProductFormPage,
  ReturnsPage,
  UserDetailPage,
  UsersPage,
} from "./admin";

// Auth pages
export * from "./auth";

// Cart pages
export * from "./cart";

// Checkout pages
export * from "./checkout";

// Error pages
export * from "./error";

// Home pages
export * from "./home";

// Info pages
export * from "./info";

// Orders pages
export * from "./orders";

// Products pages
export { ProductDetailPage, ProductsPage } from "./products";
