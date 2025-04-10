import { useContext } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaEye, FaStar, FaRegStar } from "react-icons/fa";
import { Product } from "../../types";
import { CartContext } from "../../context/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useContext(CartContext) || {
    addToCart: () => console.error("CartContext not available"),
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
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
    <div className="group h-full">
      <div className="relative bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-md">
        {/* Product image container with overlay */}
        <Link to={`/products/${product._id}`} className="block relative">
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
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="flex gap-3">
                <Link
                  to={`/products/${product._id}`}
                  className="w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  title="Quick view"
                >
                  <FaEye />
                </Link>
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
              </div>
            </div>
          </div>

          {/* Status badges */}
          {product.stock <= 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
          {product.featured && (
            <span className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded">
              Featured
            </span>
          )}
          {discount && discount > 0 && (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              {discount}% Off
            </span>
          )}
        </Link>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
