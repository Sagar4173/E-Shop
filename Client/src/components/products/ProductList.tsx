import { useState, useEffect, useContext } from "react";
import ProductCard from "./ProductCard";
import { Product } from "../../types";
import {
  FaList,
  FaThLarge,
  FaSlidersH,
  FaChevronDown,
  FaFilter,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";
import { CartContext } from "../../context/CartContext";

interface ProductListProps {
  products: Product[];
  loading: boolean;
  initialCategory?: string;
  initialSortOption?: string;
  initialPriceRange?: { min: number; max: number };
  showFilters?: boolean;
  onCategoryChange?: (category: string) => void;
  onSortChange?: (sort: string) => void;
  onPriceRangeChange?: (min: number, max: number) => void;
  categories?: string[];
}

const ProductList = ({
  products,
  loading,
  initialCategory = "",
  initialSortOption = "latest",
  initialPriceRange = { min: 0, max: 10000 },
  showFilters = false,
  onCategoryChange,
  onSortChange,
  onPriceRangeChange,
  categories = [],
}: ProductListProps) => {
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory || "",
  );
  const [sortOption, setSortOption] = useState<string>(initialSortOption);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(showFilters);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>(
    initialPriceRange,
  );
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [displayCategoryCount, setDisplayCategoryCount] = useState(10);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Extract unique categories from products
  useEffect(() => {
    if (categories.length > 0) {
      setAvailableCategories(categories);
    } else {
      // Extract unique categories from products if not provided
      const uniqueCategories = Array.from(
        new Set(products.map((p) => p.category)),
      ).sort();
      setAvailableCategories(["All", ...uniqueCategories]);
    }
  }, [products, categories]);

  // Update local state when props change
  useEffect(() => {
    setActiveCategory(initialCategory || "");
    setSortOption(initialSortOption);
    setPriceRange(initialPriceRange);
  }, [initialCategory, initialSortOption, initialPriceRange]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Filter by category if specified
    if (activeCategory && activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Filter by price range
    result = result.filter(
      (p) => p.price >= priceRange.min && p.price <= priceRange.max,
    );

    // Sort products
    switch (sortOption) {
      case "price-low-high":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-a-z":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-z-a":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "reviews":
        result.sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0));
        break;
      case "latest":
      default:
        // Default sorting retained as is
        break;
    }

    setFilteredProducts(result);
  }, [products, activeCategory, sortOption, priceRange]);

  // Handle category filter change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
    if (onSortChange) {
      onSortChange(newSortOption);
    }
  };

  // Handle price range change
  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
    if (onPriceRangeChange) {
      onPriceRangeChange(min, max);
    }
  };

  // Find min and max price in products for the price filter
  const minProductPrice = Math.min(...products.map((p) => p.price));
  const maxProductPrice = Math.max(...products.map((p) => p.price));

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Render the product list
  return (
    <div className="mb-8">
      {/* Filters Bar */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2 lg:mr-4 overflow-x-auto pb-2 lg:pb-0">
            <span className="text-sm text-gray-600 font-medium flex items-center whitespace-nowrap">
              <FaFilter className="mr-1" />
              Categories:
            </span>
            {availableCategories
              .slice(0, displayCategoryCount)
              .map((category, index) => (
                <button
                  key={`${category}-${index}`}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                    activeCategory === category ||
                    (!activeCategory && category === "All")
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  } transition-colors`}
                >
                  {category}
                  {category !== "All" && (
                    <span className="ml-1 text-xs">
                      ({products.filter((p) => p.category === category).length})
                    </span>
                  )}
                </button>
              ))}
            {availableCategories.length > displayCategoryCount && (
              <button
                onClick={() =>
                  setDisplayCategoryCount((prev) =>
                    prev === 10 ? availableCategories.length : 10,
                  )
                }
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
              >
                {displayCategoryCount === 10 ? "Show All" : "Show Less"}
                <FaChevronDown
                  className={`ml-1 transition-transform ${
                    displayCategoryCount === 10 ? "" : "transform rotate-180"
                  }`}
                />
              </button>
            )}
          </div>

          {/* Controls - Sort, View Mode, Price Range */}
          <div className="flex flex-wrap items-center gap-4 justify-between lg:justify-end">
            {/* Price Range Filter */}
            <div className="flex items-center space-x-3 min-w-[200px]">
              <span
                className="text-sm text-gray-600 whitespace-nowrap"
                id="price-label"
              >
                Price:
              </span>
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="number"
                  min={minProductPrice}
                  max={priceRange.max}
                  value={priceRange.min}
                  onChange={(e) =>
                    handlePriceRangeChange(
                      Number(e.target.value),
                      priceRange.max,
                    )
                  }
                  className="w-16 border border-gray-300 rounded-md py-1 px-2 text-sm"
                  aria-label="Minimum price"
                />
                <span className="text-sm text-gray-500">to</span>
                <input
                  type="number"
                  min={priceRange.min}
                  max={maxProductPrice}
                  value={priceRange.max}
                  onChange={(e) =>
                    handlePriceRangeChange(
                      priceRange.min,
                      Number(e.target.value),
                    )
                  }
                  className="w-16 border border-gray-300 rounded-md py-1 px-2 text-sm"
                  aria-label="Maximum price"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-200 rounded-md p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                aria-label="Grid view"
              >
                <FaThLarge className="text-sm" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                aria-label="List view"
              >
                <FaList className="text-sm" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                className="appearance-none border rounded-md px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={sortOption}
                onChange={handleSortChange}
                aria-label="Sort products by"
              >
                <option value="latest">Latest</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="name-a-z">Name: A-Z</option>
                <option value="name-z-a">Name: Z-A</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <FaChevronDown className="text-gray-400 text-xs" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 mb-4">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-gray-50 py-12 text-center rounded-lg shadow-sm">
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            No products found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="flex flex-col sm:flex-row bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="sm:w-56 h-48 flex-shrink-0">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 p-4 flex flex-col">
                <div className="mb-2">
                  <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded capitalize">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-gray-900 font-medium text-lg mb-1">
                  {product.name}
                </h3>
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < (product.rating || 0)
                            ? "text-yellow-400"
                            : "text-gray-200"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="ml-1 text-xs text-gray-500">
                    {product.numReviews ? `(${product.numReviews})` : "(0)"}
                  </span>
                </div>
                <p className="text-gray-600 mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-baseline">
                    <span className="font-bold text-lg text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <span className="ml-2 text-sm line-through text-gray-400">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                  </div>
                  <button
                    onClick={() => {
                      const cartContext = useContext(CartContext);
                      if (cartContext && cartContext.addToCart) {
                        cartContext.addToCart(product, 1);
                      }
                    }}
                    disabled={product.stock <= 0}
                    className={`px-4 py-2 rounded-md ${
                      product.stock > 0
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                    } transition-colors`}
                  >
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
