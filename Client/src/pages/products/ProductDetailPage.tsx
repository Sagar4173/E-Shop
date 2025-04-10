import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaStar, FaShoppingCart, FaRegStar } from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import {
  getProductById,
  getProductReviews,
} from "../../services/productService";
import { Product, Review } from "../../types";
import { CartContext } from "../../context/CartContext";
import { isAuthenticated } from "../../services/authService";
import ProductReviewForm from "../../components/products/ProductReviewForm";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isUserAuthenticated, setIsUserAuthenticated] =
    useState<boolean>(false);

  const { addToCart } = useContext(CartContext) || {
    addToCart: () => console.error("CartContext not available"),
  };

  useEffect(() => {
    // Check if user is authenticated
    setIsUserAuthenticated(isAuthenticated());
  }, []);

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

        // If the product has reviews in its data, use those initially
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        } else {
          // Otherwise, fetch reviews separately (in case they're not included in the product response)
          fetchReviews();
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load product. Please try again later.");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const fetchReviews = async () => {
    if (!id) return;

    try {
      const reviewsData = await getProductReviews(id);
      setReviews(reviewsData);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      // Show success message or redirect to cart
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
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
          <FaArrowLeft className="mr-2" /> Back to Products
        </Link>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-4">
        <Link
          to="/products"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="rounded-lg overflow-hidden bg-gray-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-auto object-cover"
              onError={(e) => {
                // Fallback image if product image fails to load
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/600x400?text=Image+Not+Available";
              }}
            />
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400 mr-2">
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
              <span className="text-gray-600">
                {product.numReviews
                  ? `${product.numReviews} reviews`
                  : "No reviews yet"}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-4">
              ₹{product.price.toFixed(2)}
            </div>
            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="w-24 font-medium">Status:</span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    product.stock > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-24 font-medium">Category:</span>
                <span className="capitalize">
                  {product.category.charAt(0).toUpperCase() +
                    product.category.slice(1)}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="font-medium">
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

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-md font-medium ${
                product.stock > 0
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
            >
              <FaShoppingCart />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Description & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Product Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700">{product.description}</p>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Product Details</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                mollis felis ac diam varius, ac blandit erat tempus. Integer
                eget nisl.
              </p>
              <ul>
                <li>High quality materials</li>
                <li>Durable and long lasting</li>
                <li>30-day money-back guarantee</li>
                <li>1 year warranty</li>
              </ul>
            </div>
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
                <div className="flex text-yellow-400 mr-2">
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
                <span className="text-lg font-medium">
                  {product.rating ? product.rating.toFixed(1) : "0"} out of 5
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                Based on {product.numReviews}{" "}
                {product.numReviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            <div className="space-y-6 mt-8">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="font-medium text-indigo-800">
                          {review.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{review.name}</p>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex text-yellow-400 text-sm mb-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < review.rating ? (
                              <FaStar className="text-yellow-400" />
                            ) : (
                              <FaRegStar className="text-gray-300" />
                            )}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">
              This product has no reviews yet. Be the first to review!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
