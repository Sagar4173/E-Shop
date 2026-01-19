import { useContext, useEffect, useState } from "react";
import {
  FaBars,
  FaHeart,
  FaSearch,
  FaShoppingCart,
  FaTimes,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { getCurrentUser, isAuthenticated } from "../../services/authService";
import { getWishlistItems } from "../../services/wishlistService";
import SearchBar from "../products/SearchBar";

const Header = () => {
  const { cartItems } = useContext(CartContext) || { cartItems: [] };
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        const userData = getCurrentUser();
        setUser(userData);

        // Fetch wishlist count
        try {
          if (userData && userData._id) {
            const wishlistItems = await getWishlistItems();
            setWishlistCount(wishlistItems?.length || 0);
          }
        } catch (error) {
          console.error("Failed to fetch wishlist count:", error);
        }
      }
    };

    checkAuth();

    // Add event listener for storage changes (for wishlist updates)
    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key === "wishlist") {
        const userData = getCurrentUser();
        if (userData && userData._id) {
          try {
            const wishlistItems = await getWishlistItems();
            setWishlistCount(wishlistItems?.length || 0);
          } catch (error) {
            console.error("Failed to update wishlist count:", error);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Refresh wishlist count when navigation occurs (to catch updates)
  useEffect(() => {
    if (isAuthenticated()) {
      const userData = getCurrentUser();
      if (userData && userData._id) {
        getWishlistItems()
          .then((items) => setWishlistCount(items?.length || 0))
          .catch((error) =>
            console.error("Failed to refresh wishlist count:", error)
          );
      }
    }
  }, [location.pathname]);

  // Track scroll for header style changes
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when navigation occurs
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-2"
          : "bg-white py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-gray-900">
          <span className="text-indigo-600">E</span>-Shop
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`text-sm font-medium hover:text-indigo-600 transition-colors ${
              location.pathname === "/" ? "text-indigo-600" : "text-gray-700"
            }`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`text-sm font-medium hover:text-indigo-600 transition-colors ${
              location.pathname.includes("/products")
                ? "text-indigo-600"
                : "text-gray-700"
            }`}
          >
            Products
          </Link>
          <Link
            to="/about"
            className={`text-sm font-medium hover:text-indigo-600 transition-colors ${
              location.pathname === "/about"
                ? "text-indigo-600"
                : "text-gray-700"
            }`}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`text-sm font-medium hover:text-indigo-600 transition-colors ${
              location.pathname === "/contact"
                ? "text-indigo-600"
                : "text-gray-700"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Action Icons */}
        <div className="flex items-center space-x-4">
          {/* Search icon (desktop) */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-gray-700 hover:text-indigo-600 transition-colors focus:outline-none"
            aria-label="Search"
          >
            <FaSearch className="text-lg" />
          </button>

          {/* Wishlist icon - only show if user is logged in */}
          {user && (
            <Link
              to="/account/wishlist"
              className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
              aria-label="Wishlist"
            >
              <FaHeart className="text-lg" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse-slow">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart icon */}
          <Link
            to="/cart"
            className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
            aria-label="Cart"
          >
            <FaShoppingCart className="text-lg" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Account icon/button */}
          {user ? (
            <Link
              to="/account"
              className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
              aria-label="Account"
            >
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Login
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-indigo-600 transition-colors focus:outline-none"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaBars className="text-xl" />
            )}
          </button>
        </div>
      </div>

      {/* Search bar (expandable) */}
      {searchOpen && (
        <div className="absolute w-full bg-white py-4 px-4 shadow-lg animate-fadeIn">
          <SearchBar
            className="max-w-3xl mx-auto"
            placeholder="Search for products, brands, and more..."
            onSearch={(term) => {
              navigate(`/products?search=${encodeURIComponent(term)}`);
              setSearchOpen(false);
            }}
          />
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t animate-fadeIn">
          <nav className="flex flex-col py-4">
            <Link
              to="/"
              className={`px-4 py-3 text-sm font-medium hover:bg-gray-50 ${
                location.pathname === "/" ? "text-indigo-600" : "text-gray-800"
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`px-4 py-3 text-sm font-medium hover:bg-gray-50 ${
                location.pathname.includes("/products")
                  ? "text-indigo-600"
                  : "text-gray-800"
              }`}
            >
              Products
            </Link>
            <Link
              to="/about"
              className={`px-4 py-3 text-sm font-medium hover:bg-gray-50 ${
                location.pathname === "/about"
                  ? "text-indigo-600"
                  : "text-gray-800"
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`px-4 py-3 text-sm font-medium hover:bg-gray-50 ${
                location.pathname === "/contact"
                  ? "text-indigo-600"
                  : "text-gray-800"
              }`}
            >
              Contact
            </Link>
            {user && (
              <Link
                to="/account/wishlist"
                className="px-4 py-3 text-sm font-medium hover:bg-gray-50 flex items-center"
              >
                <FaHeart className="mr-2 text-red-500" />
                Wishlist
                {wishlistCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}
            {!user && (
              <Link
                to="/login"
                className="mx-4 mt-3 mb-1 py-2 text-sm font-medium text-center text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
