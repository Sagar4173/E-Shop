import React, { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { createProductReview } from "../../services/productService";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../services/authService";

interface ProductReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

const ProductReviewForm = ({
  productId,
  onReviewSubmitted,
}: ProductReviewFormProps) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated before proceeding
    if (!isAuthenticated()) {
      setError(
        "You must be logged in to submit a review. Please log in and try again."
      );
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
      return;
    }

    if (rating < 1 || !comment.trim()) {
      setError("Please provide both a rating and a comment");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createProductReview(productId, { rating, comment });
      setSuccess(true);
      setComment("");
      onReviewSubmitted();

      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        // Handle different error messages
        if (
          err.message.includes("Not authorized") ||
          err.message.includes("token")
        ) {
          setError("Authentication error. Please log in again.");
          setTimeout(() => {
            // Redirect to login page
            navigate("/auth/login");
          }, 2000);
        } else if (err.message.includes("already reviewed")) {
          setError("You have already reviewed this product.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to submit review. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p>Review submitted successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating
          </label>
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <button
                  type="button"
                  key={index}
                  className="text-2xl mr-1 focus:outline-none"
                  onClick={() => setRating(ratingValue)}
                  onMouseEnter={() => setHoveredRating(ratingValue)}
                  onMouseLeave={() => setHoveredRating(null)}
                >
                  {ratingValue <= (hoveredRating || rating) ? (
                    <FaStar className="text-yellow-400" />
                  ) : (
                    <FaRegStar className="text-gray-300" />
                  )}
                </button>
              );
            })}
            <span className="ml-2 text-sm text-gray-500">
              {rating} out of 5 stars
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-gray-300 p-3 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your experience with this product..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-md font-medium text-white ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ProductReviewForm;
