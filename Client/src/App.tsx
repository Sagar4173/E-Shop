import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import HomePage from "./pages/home/HomePage";
import ProductsPage from "./pages/products/ProductsPage";
import ProductDetailPage from "./pages/products/ProductDetailPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import OrderConfirmationPage from "./pages/checkout/OrderConfirmationPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import OrdersPage from "./pages/account/OrdersPage";
import ProfilePage from "./pages/account/ProfilePage";
import AddressesPage from "./pages/account/AddressesPage";
import ReturnRequestPage from "./pages/account/ReturnRequestPage";
import WishlistPage from "./pages/account/WishlistPage";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminProductsPage from "./pages/admin/ProductsPage";
import AdminOrdersPage from "./pages/admin/OrdersPage";
import AdminOrderDetailPage from "./pages/admin/OrderDetailPage";
import AdminUsersPage from "./pages/admin/UsersPage";
import AdminUserDetailPage from "./pages/admin/UserDetailPage";
import ProductFormPage from "./pages/admin/ProductFormPage";
import ReturnsPage from "./pages/admin/ReturnsPage";
import AboutPage from "./pages/info/AboutPage";
import ContactPage from "./pages/info/ContactPage";
import ShippingPage from "./pages/info/ShippingPage";
import ReturnPolicyPage from "./pages/info/ReturnPolicyPage";
import FAQPage from "./pages/info/FAQPage";
import TermsPage from "./pages/info/TermsPage";
import OrderDetailPage from "./pages/account/OrderDetailPage";

const App = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/order-confirmation"
            element={<OrderConfirmationPage />}
          />

          {/* Info Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/returns" element={<ReturnPolicyPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* User Account Routes */}
          <Route
            path="/account"
            element={<Navigate replace to="/account/profile" />}
          />
          <Route path="/account/orders" element={<OrdersPage />} />
          <Route path="/account/orders/:id" element={<OrderDetailPage />} />
          <Route path="/account/profile" element={<ProfilePage />} />
          <Route path="/account/addresses" element={<AddressesPage />} />
          <Route path="/account/wishlist" element={<WishlistPage />} />
          <Route
            path="/account/orders/:id/return"
            element={<ReturnRequestPage />}
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
          <Route path="/admin/products/new" element={<ProductFormPage />} />
          <Route
            path="/admin/products/edit/:id"
            element={<ProductFormPage />}
          />
          <Route path="/admin/returns" element={<ReturnsPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;
