import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaEye,
  FaStar,
  FaRegStar,
  FaHeart,
  FaRegHeart,
  FaTrash,
  FaCheck,
} from "react-icons/fa";
import { Product } from "../../types";
import { CartContext } from "../../context/CartContext";
import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "../../services/wishlistService";
import { isAuthenticated } from "../../services/authService";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, removeFromCart, cartItems } = useContext(CartContext) || {
    addToCart: () => console.error("CartContext not available"),
    removeFromCart: () => console.error("CartContext not available"),
    cartItems: [],
  };

  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [inCart, setInCart] = useState<boolean>(false);

  // Check if the product is already in cart and wishlist when component mounts
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (isAuthenticated()) {
        setIsLoggedIn(true);
        try {
          const status = await isInWishlist(product._id);
          setInWishlist(status);
        } catch (error) {
          console.error("Failed to check wishlist status:", error);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    // Check cart status
    if (cartItems) {
      const existingItem = cartItems.find(
        (item) => item.id === product._id || item._id === product._id
      );
      setInCart(!!existingItem);
    }

    checkWishlistStatus();
  }, [product._id, cartItems]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setInCart(true);

    // Show toast notification
    setToastMessage("Added to cart successfully!");
    setToastType("success");
    setShowToast(true);

    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromCart(product._id);
    setInCart(false);

    // Show toast notification
    setToastMessage("Removed from cart successfully!");
    setToastType("success");
    setShowToast(true);

    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      // Show notification
      setToastMessage("Please log in to add items to your wishlist");
      setToastType("error");
      setShowToast(true);

      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return;
    }

    setIsLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product._id);
        setInWishlist(false);
        setToastMessage("Removed from wishlist");
      } else {
        await addToWishlist(product);
        setInWishlist(true);
        setToastMessage("Added to wishlist");
      }

      setToastType("success");
      setShowToast(true);

      // Dispatch storage event to update wishlist counter in header
      window.dispatchEvent(new StorageEvent("storage", { key: "wishlist" }));
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      setToastMessage("Failed to update wishlist");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsLoading(false);

      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
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

  // Calculate discount percentage if originalPrice exists
  const getDiscountPercentage = () => {
    if (!product.originalPrice) return null;
    if (product.originalPrice <= product.price) return null;

    const discount = Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );
    return discount > 0 ? discount : null;
  };

  const discount = getDiscountPercentage();

  return (
    <div className="group h-full relative">
      {/* Toast notification */}
      {showToast && (
        <div className="absolute top-0 right-0 z-50 transform transition-all duration-300 ease-out animate-slideInDown w-full">
          <div
            className={`rounded-lg shadow-lg px-4 py-3 flex items-center ${
              toastType === "success"
                ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                : "bg-red-100 text-red-800 border-l-4 border-red-500"
            }`}
          >
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="relative bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-md">
        {/* Product image container with overlay */}
        <div className="relative">
          <div className="relative h-56 overflow-hidden bg-gray-100">
            {/* Product image with hover effect */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                // Fallback image if product image fails to load
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/300x300?text=Image+Not+Available";
              }}
            />

            {/* Quick action overlay (appears on hover) */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
              <div className="flex gap-3">
                <Link
                  to={`/products/${product._id}`}
                  className="w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  title="Quick view"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaEye />
                </Link>
                {inCart ? (
                  <button
                    onClick={handleRemoveFromCart}
                    className="w-10 h-10 rounded-full bg-white text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors"
                    title="Remove from cart"
                  >
                    <FaTrash />
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`w-10 h-10 rounded-full bg-white flex items-center justify-center transition-colors ${
                      product.stock > 0
                        ? "text-gray-800 hover:bg-indigo-50 hover:text-indigo-600"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                    title={product.stock > 0 ? "Add to cart" : "Out of stock"}
                  >
                    <FaShoppingCart />
                  </button>
                )}
                <button
                  onClick={handleWishlistToggle}
                  disabled={isLoading}
                  className={`w-10 h-10 rounded-full bg-white flex items-center justify-center transition-colors ${
                    inWishlist
                      ? "text-red-500 hover:bg-red-50"
                      : "text-gray-800 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                  title={
                    inWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  {isLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : inWishlist ? (
                    <FaHeart />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Status badges */}
          {product.stock <= 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
              Out of Stock
            </span>
          )}
          {product.featured && (
            <span className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded z-10">
              Featured
            </span>
          )}
          {discount && discount > 0 && (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
              {discount}% Off
            </span>
          )}

          {/* Wishlist icon in corner when not hovering */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 ${
              product.featured || (discount && discount > 0)
                ? "right-16"
                : "right-2"
            } 
                       w-8 h-8 rounded-full bg-white/80 flex items-center justify-center
                       ${
                         inWishlist ? "text-red-500" : "text-gray-500"
                       } hover:bg-white transition-colors z-20`}
            title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : inWishlist ? (
              <FaHeart />
            ) : (
              <FaRegHeart />
            )}
          </button>

          {/* Make the entire image area clickable using an absolute positioned link, but with lower z-index */}
          <Link
            to={`/products/${product._id}`}
            className="absolute inset-0 z-0"
            aria-label={`View ${product.name} details`}
          >
            <span className="sr-only">View product details</span>
          </Link>
        </div>

        {/* Product details */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Category badge */}
          <div className="mb-2">
            <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded capitalize">
              {product.category}
            </span>
          </div>

          {/* Product name */}
          <Link to={`/products/${product._id}`} className="block">
            <h3 className="text-gray-900 font-medium mb-1 line-clamp-2 h-12 hover:text-indigo-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) =>
                i < Math.floor(product.rating || 0) ? (
                  <FaStar key={i} className="text-yellow-400" />
                ) : i < (product.rating || 0) ? (
                  <FaStar key={i} className="text-yellow-400 opacity-50" />
                ) : (
                  <FaRegStar key={i} className="text-gray-300" />
                )
              )}
            </div>
            <span className="ml-1 text-xs text-gray-500">
              {product.numReviews ? `(${product.numReviews})` : "(0)"}
            </span>
          </div>

          {/* Price and add to cart */}
          <div className="mt-auto pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline">
                <span className="font-bold text-lg text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <span className="ml-2 text-sm line-through text-gray-400">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
              </div>
              {inCart ? (
                <button
                  onClick={handleRemoveFromCart}
                  className="flex items-center justify-center p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  aria-label="Remove from cart"
                >
                  <FaTrash className="text-sm" />
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex items-center justify-center p-2 rounded-full transition-colors ${
                    product.stock > 0
                      ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  aria-label="Add to cart"
                >
                  <FaShoppingCart className="text-sm" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
