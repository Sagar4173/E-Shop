import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaStar,
  FaShoppingCart,
  FaRegStar,
  FaHeart,
  FaRegHeart,
  FaCheck,
  FaShippingFast,
  FaTag,
  FaCalendarAlt,
  FaBoxOpen,
  FaTruck,
  FaClock,
  FaCheckCircle,
  FaTrash,
  FaCreditCard,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import {
  getProductById,
  getProductReviews,
} from "../../services/productService";
import { Product, Review } from "../../types";
import { CartContext } from "../../context/CartContext";
import { isAuthenticated } from "../../services/authService";
import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "../../services/wishlistService";
import ProductReviewForm from "../../components/products/ProductReviewForm";

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isUserAuthenticated, setIsUserAuthenticated] =
    useState<boolean>(false);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);
  const [wishlistAnimation, setWishlistAnimation] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [itemInCart, setItemInCart] = useState<boolean>(false);

  // Refs for timeout cleanup to prevent memory leaks
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const wishlistAnimationTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const { addToCart, removeFromCart, cartItems } = useContext(CartContext) || {
    addToCart: () => console.error("CartContext not available"),
    removeFromCart: () => console.error("CartContext not available"),
    cartItems: [],
  };

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (cartAnimationTimeoutRef.current)
        clearTimeout(cartAnimationTimeoutRef.current);
      if (wishlistAnimationTimeoutRef.current)
        clearTimeout(wishlistAnimationTimeoutRef.current);
    };
  }, []);

  // Helper function to show toast with auto-hide
  const showToastMessage = useCallback(
    (message: string, type: "success" | "error") => {
      // Clear any existing toast timeout
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      setToastMessage(message);
      setToastType(type);
      setShowToast(true);

      // Auto-hide toast after 3 seconds
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    },
    [],
  );

  useEffect(() => {
    // Check if user is authenticated
    setIsUserAuthenticated(isAuthenticated());
  }, []);

  // Check if product is already in cart
  useEffect(() => {
    if (product && cartItems) {
      const existingItem = cartItems.find(
        (item) => item.id === product._id || item._id === product._id,
      );
      setItemInCart(!!existingItem);
      if (existingItem) {
        setQuantity(existingItem.quantity);
      }
    }
  }, [product, cartItems]);

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (isAuthenticated() && id) {
        try {
          const status = await isInWishlist(id);
          setInWishlist(status);
        } catch (error) {
          console.error("Failed to check wishlist status:", error);
        }
      }
    };

    checkWishlistStatus();
  }, [id]);

  // Define fetchReviews first before using it in useEffect
  const fetchReviews = async () => {
    if (!id) return;

    try {
      const reviewsData = await getProductReviews(id);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Invalid product ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        setSelectedImage(data.imageUrl);

        // If the product has reviews in its data, use those initially
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        } else {
          // Otherwise, fetch reviews separately (in case they're not included in the product response)
          fetchReviews();
        }

        setLoading(false);
      } catch (error) {
        setError("Failed to load product. Please try again later.");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setItemInCart(true);

      // Visual feedback for add to cart button
      setAddedToCart(true);

      // Clear any existing cart animation timeout
      if (cartAnimationTimeoutRef.current) {
        clearTimeout(cartAnimationTimeoutRef.current);
      }

      // Reset the button state after animation completes
      cartAnimationTimeoutRef.current = setTimeout(() => {
        setAddedToCart(false);
      }, 1500);

      // Show success toast using helper
      showToastMessage("Added to cart successfully!", "success");
    }
  };

  const handleRemoveFromCart = () => {
    if (product) {
      removeFromCart(product._id);
      setItemInCart(false);

      // Show success toast using helper
      showToastMessage("Removed from cart successfully!", "success");
    }
  };

  const handleBuyNow = () => {
    if (product) {
      // If product is not in cart, add it first
      if (!itemInCart) {
        addToCart(product, quantity);
      }

      // Redirect to checkout page
      navigate("/checkout");
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  const handleWishlistToggle = async () => {
    if (!isUserAuthenticated) {
      showToastMessage("Please log in to add items to your wishlist", "error");
      return;
    }

    if (!product) return;

    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product._id);
        setInWishlist(false);

        // Show toast
        showToastMessage("Removed from wishlist", "success");
      } else {
        await addToWishlist(product);
        setInWishlist(true);

        // Clear any existing wishlist animation timeout
        if (wishlistAnimationTimeoutRef.current) {
          clearTimeout(wishlistAnimationTimeoutRef.current);
        }

        // Trigger animation
        setWishlistAnimation(true);
        wishlistAnimationTimeoutRef.current = setTimeout(() => {
          setWishlistAnimation(false);
        }, 1000);

        // Show toast
        showToastMessage("Added to wishlist", "success");
      }

      // Dispatch storage event to update wishlish counter in header
      window.dispatchEvent(new StorageEvent("storage", { key: "wishlist" }));
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      showToastMessage("Failed to update wishlist", "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    // Refresh reviews after a new review is submitted
    fetchReviews();
    // Also refresh the entire product to get updated rating and numReviews
    if (id) {
      getProductById(id)
        .then((data) => setProduct(data))
        .catch((err) => console.error("Failed to refresh product:", err));
    }
  };

  // Format price with currency
  const formatPrice = (price: number) => {
    return price.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  };

  // Calculate estimated delivery date (5-7 days from now)
  const getEstimatedDelivery = () => {
    const today = new Date();

    const minDelivery = new Date(today);
    minDelivery.setDate(today.getDate() + 5);

    const maxDelivery = new Date(today);
    maxDelivery.setDate(today.getDate() + 7);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    return `${formatDate(minDelivery)} - ${formatDate(maxDelivery)}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <span className="block sm:inline">
            {error || "Product not found"}
          </span>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" />
          Back to Products
        </Link>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-24 right-4 z-50 transform transition-all duration-300 ease-out animate-slideInDown">
          <div
            className={`rounded-lg shadow-lg px-4 py-3 flex items-center ${
              toastType === "success"
                ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                : "bg-red-100 text-red-800 border-l-4 border-red-500"
            }`}
          >
            {toastType === "success" ? (
              <FaCheck className="text-green-500 mr-2" />
            ) : (
              <FaRegStar className="text-red-500 mr-2" />
            )}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex mb-4 text-sm">
        <Link to="/" className="text-gray-500 hover:text-blue-600">
          Home
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <Link to="/products" className="text-gray-500 hover:text-blue-600">
          Products
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <Link
          to={`/products?category=${product.category}`}
          className="text-gray-500 hover:text-blue-600"
        >
          {product.category}
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative overflow-hidden rounded-lg bg-gray-100 h-80 md:h-96">
            <img
              src={selectedImage || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback image if product image fails to load
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/600x400?text=Image+Not+Available";
              }}
            />

            {/* Status badges */}
            <div className="absolute top-4 left-4 space-y-2">
              {product.stock <= 3 && product.stock > 0 && (
                <span className="inline-block bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Low Stock
                </span>
              )}

              {product.stock <= 0 && (
                <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Out of Stock
                </span>
              )}

              {product.featured && (
                <span className="inline-block bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded">
                  Featured
                </span>
              )}

              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="inline-block bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100,
                    )}
                    % Off
                  </span>
                )}
            </div>
          </div>

          {/* Image thumbnails would go here */}
          <div className="flex justify-center items-center space-x-2">
            <p className="text-sm text-gray-500">
              <FaTag className="inline mr-1" />
              SKU: {product._id.substring(product._id.length - 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className={`p-2 rounded-full relative ${
                inWishlist
                  ? "text-red-500 hover:bg-red-50"
                  : "text-gray-400 hover:text-red-500 hover:bg-gray-100"
              } transition-colors`}
              aria-label={
                inWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              {wishlistLoading ? (
                <span className="animate-pulse">...</span>
              ) : inWishlist ? (
                <>
                  <FaHeart
                    size={24}
                    className={wishlistAnimation ? "animate-pulse" : ""}
                  />
                  {wishlistAnimation && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </>
              ) : (
                <FaRegHeart size={24} />
              )}
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => {
              return i < Math.round(product.rating || 0) ? (
                <FaStar key={i} className="text-yellow-400" />
              ) : (
                <FaRegStar key={i} className="text-yellow-400" />
              );
            })}
            <span className="text-sm text-gray-500 ml-2">
              ({product.numReviews || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="ml-2 text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="ml-2 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                Save{" "}
                {Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                    100,
                )}
                %
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-4">
            {product.stock > 0 ? (
              <div className="flex items-center">
                <span className="flex items-center text-green-600 font-medium">
                  <FaCheckCircle className="mr-1" />
                  In Stock
                </span>
                <span className="ml-2 text-gray-600">
                  ({product.stock} available)
                </span>
              </div>
            ) : (
              <span className="flex items-center text-red-600 font-medium">
                <FaRegStar className="mr-1" />
                Out of Stock
              </span>
            )}
          </div>

          {/* Shipping Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <FaShippingFast className="text-blue-500 mr-2" />
              <span className="font-medium">Shipping Information</span>
            </div>
            <ul className="text-sm space-y-2">
              <li className="flex items-start">
                <FaTruck className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <span className="block font-medium">Fast Delivery</span>
                  <span className="text-gray-600">
                    Free shipping on orders over ₹50
                  </span>
                </div>
              </li>
              <li className="flex items-start">
                <FaCalendarAlt className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <span className="block font-medium">Estimated Delivery</span>
                  <span className="text-gray-600">
                    {getEstimatedDelivery()}
                  </span>
                </div>
              </li>
              <li className="flex items-start">
                <FaBoxOpen className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <span className="block font-medium">Easy Returns</span>
                  <span className="text-gray-600">30-day return policy</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Description
            </h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Quantity Selector - Only show if product is not in cart */}
          {!itemInCart && (
            <div className="mb-6">
              <div className="flex items-center">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mr-4"
                >
                  Quantity:
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={product.stock <= 0}
                >
                  {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
            {/* Conditional rendering based on whether item is in cart */}
            {itemInCart ? (
              <>
                <button
                  onClick={handleRemoveFromCart}
                  className="flex-grow flex items-center justify-center space-x-2 py-3 px-6 rounded-md font-medium transition-all duration-300 bg-red-600 hover:bg-red-700 text-white"
                >
                  <FaTrash />
                  <span>Remove from Cart</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || addedToCart}
                className={`flex-grow flex items-center justify-center space-x-2 py-3 px-6 rounded-md font-medium transition-all duration-300 ${
                  addedToCart
                    ? "bg-green-600 text-white"
                    : product.stock > 0
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 cursor-not-allowed text-gray-500"
                }`}
              >
                {addedToCart ? (
                  <>
                    <FaCheck className="animate-bounce" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            )}

            {/* Buy Now button - always show regardless of cart status */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-md font-medium transition-all duration-300 ${
                product.stock > 0
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
            >
              <FaCreditCard />
              <span>Buy Now</span>
            </button>

            {/* Wishlist button */}
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading || !isUserAuthenticated}
              className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-md font-medium border ${
                inWishlist
                  ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              {inWishlist ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart />
              )}
              <span>{inWishlist ? "In Wishlist" : "Add to Wishlist"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Description & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Product Details</h2>
            <div className="prose max-w-none">
              <p>{product.description}</p>

              {/* Additional product details */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Features</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>High-quality materials for durability</li>
                  <li>Designed for everyday use</li>
                  <li>Modern, stylish appearance</li>
                  <li>Easy to maintain and clean</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Specifications</h2>
            <ul className="space-y-3">
              <li className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Category</span>
                <span className="font-medium capitalize">
                  {product.category}
                </span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Rating</span>
                <span className="font-medium">
                  {product.rating ? product.rating.toFixed(1) : "0"}/5
                </span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Stock</span>
                <span className="font-medium">{product.stock}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Item ID</span>
                <span className="font-medium">
                  {product._id.substring(product._id.length - 8).toUpperCase()}
                </span>
              </li>
              {product.createdAt && (
                <li className="flex justify-between">
                  <span className="text-gray-600">Listed On</span>
                  <span className="font-medium">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Delivery Information Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Delivery</h2>
            <ul className="space-y-4">
              <li className="flex items-center text-sm">
                <FaClock className="text-gray-500 mr-3" />
                <div>
                  <span className="block font-medium">Delivery Time</span>
                  <span className="text-gray-600">5-7 business days</span>
                </div>
              </li>
              <li className="flex items-center text-sm">
                <FaShippingFast className="text-gray-500 mr-3" />
                <div>
                  <span className="block font-medium">Shipping</span>
                  <span className="text-gray-600">
                    {product.price >= 50 ? "Free" : "₹10 (Free over ₹50)"}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {/* Review Form - Only shown to authenticated users */}
        {isUserAuthenticated ? (
          <ProductReviewForm
            productId={id || ""}
            onReviewSubmitted={handleReviewSubmitted}
          />
        ) : (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div>
                <p className="text-blue-700">
                  <Link to="/login" className="font-medium underline">
                    Sign in
                  </Link>{" "}
                  to write a review.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Review List */}
        {reviews && reviews.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <div className="flex items-center">
                <span className="text-lg font-medium mr-2">
                  {product.rating ? product.rating.toFixed(1) : "0"}
                </span>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => {
                    return i < Math.round(product.rating || 0) ? (
                      <FaStar key={i} />
                    ) : (
                      <FaRegStar key={i} />
                    );
                  })}
                </div>
                <span className="text-gray-500 ml-2">
                  ({product.numReviews || 0} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review._id || Math.random().toString()}
                  className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="font-medium text-indigo-800">
                          {(review.name || "User").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">
                          {review.name || "Anonymous User"}
                        </p>
                        <span className="text-sm text-gray-500">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex text-yellow-400 text-sm mb-2">
                        {[...Array(5)].map((_, i) => {
                          return i < (review.rating || 0) ? (
                            <FaStar key={i} />
                          ) : (
                            <FaRegStar key={i} />
                          );
                        })}
                      </div>
                      <p className="text-gray-700">
                        {review.comment || "No comment provided"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">
              There are no reviews yet. Be the first to review this product!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
