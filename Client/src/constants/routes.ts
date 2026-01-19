// Route path constants for type-safe navigation
export const ROUTES = {
  // Public routes
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDER_CONFIRMATION: "/order-confirmation",

  // Info pages
  ABOUT: "/about",
  CONTACT: "/contact",
  SHIPPING: "/shipping",
  RETURNS: "/returns",
  FAQ: "/faq",
  TERMS: "/terms",
  TRACK_ORDER: "/track-order",
  INVOICE: (id: string) => `/invoice/${id}`,

  // Auth routes
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Account routes
  ACCOUNT: "/account",
  ACCOUNT_PROFILE: "/account/profile",
  ACCOUNT_ORDERS: "/account/orders",
  ACCOUNT_ORDER_DETAIL: (id: string) => `/account/orders/${id}`,
  ACCOUNT_ADDRESSES: "/account/addresses",
  ACCOUNT_WISHLIST: "/account/wishlist",
  ACCOUNT_RETURN_REQUEST: (id: string) => `/account/orders/${id}/return`,

  // Admin routes
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_PRODUCT_NEW: "/admin/products/new",
  ADMIN_PRODUCT_EDIT: (id: string) => `/admin/products/edit/${id}`,
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_ORDER_DETAIL: (id: string) => `/admin/orders/${id}`,
  ADMIN_USERS: "/admin/users",
  ADMIN_USER_DETAIL: (id: string) => `/admin/users/${id}`,
  ADMIN_RETURNS: "/admin/returns",
  ADMIN_COUPONS: "/admin/coupons",
} as const;
