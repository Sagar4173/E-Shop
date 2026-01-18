import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import ProductList from "../../components/products/ProductList";
import SearchBar from "../../components/products/SearchBar";
import { Product } from "../../types";
import {
  getProducts,
  getProductCategories,
} from "../../services/productService";
import { FaFilter, FaTimes } from "react-icons/fa";

// Define interface for API response to handle different formats
interface ProductsResponse {
  products: Product[];
  totalProducts?: number;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const categoryFilter = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";
  const sortOption = searchParams.get("sort") || "latest";
  const minPrice = searchParams.get("min")
    ? Number(searchParams.get("min"))
    : 0;
  const maxPrice = searchParams.get("max")
    ? Number(searchParams.get("max"))
    : 10000;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const uniqueCategories = await getProductCategories();
        setCategories(["All", ...uniqueCategories]);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const queryParams: any = {
          page: currentPage,
          pageSize: pageSize,
          sort: sortOption,
        };

        if (categoryFilter && categoryFilter !== "All") {
          queryParams.category = categoryFilter;
        }

        if (searchQuery) {
          queryParams.keyword = searchQuery;
        }

        if (minPrice > 0) {
          queryParams.min = minPrice;
        }

        if (maxPrice < 10000) {
          queryParams.max = maxPrice;
        }

        // Use a more flexible approach to handle API response format
        const data = await getProducts(queryParams);

        // Define a type guard to check if the response has products property
        const hasProductsProperty = (
          obj: any,
        ): obj is { products: Product[]; totalProducts?: number } => {
          return obj && typeof obj === "object" && "products" in obj;
        };

        if (hasProductsProperty(data)) {
          // Handle response with products property
          setProducts(data.products);
          setTotalProducts(data.totalProducts || data.products.length);
        } else if (Array.isArray(data)) {
          // Handle array response
          setProducts(data);
          setTotalProducts(data.length);
        } else {
          throw new Error("Invalid response format");
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, currentPage, pageSize]);

  const updateFilters = (filters: Record<string, any>) => {
    const updatedParams = new URLSearchParams(searchParams);

    setCurrentPage(1);

    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === "" || value === "All") {
        updatedParams.delete(key);
      } else {
        updatedParams.set(key, String(value));
      }
    });

    setSearchParams(updatedParams);
  };

  const handleSearch = (term: string) => {
    updateFilters({ search: term });
  };

  const handleCategoryChange = (category: string) => {
    updateFilters({ category: category === "All" ? null : category });
  };

  const handleSortChange = (sort: string) => {
    updateFilters({ sort });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    updateFilters({ min, max });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    categoryFilter || searchQuery || minPrice > 0 || maxPrice < 10000;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-600">Browse our collection of products</p>
        </div>

        <div className="flex items-center gap-3">
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 md:hidden"
            aria-label="Toggle filters"
          >
            <FaFilter />
          </button>
        </div>
      </div>

      <div className="hidden md:flex mb-6 border-b overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              categoryFilter === category ||
              (!categoryFilter && category === "All")
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Active filters:</span>

          {categoryFilter && (
            <span className="inline-flex items-center bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              Category: {categoryFilter}
              <button
                onClick={() => updateFilters({ category: null })}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label={`Remove category filter: ${categoryFilter}`}
              >
                <FaTimes size={10} />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              Search: {searchQuery}
              <button
                onClick={() => updateFilters({ search: null })}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label={`Remove search filter: ${searchQuery}`}
              >
                <FaTimes size={10} />
              </button>
            </span>
          )}

          {(minPrice > 0 || maxPrice < 10000) && (
            <span className="inline-flex items-center bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              Price: ₹{minPrice} - ₹{maxPrice}
              <button
                onClick={() => updateFilters({ min: null, max: null })}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="Remove price filter"
              >
                <FaTimes size={10} />
              </button>
            </span>
          )}

          <button
            onClick={clearFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          <ProductList
            products={products}
            loading={loading}
            initialCategory={categoryFilter}
            initialSortOption={sortOption}
            initialPriceRange={{ min: minPrice, max: maxPrice }}
            showFilters={showFilters}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onPriceRangeChange={handlePriceRangeChange}
            categories={categories}
          />

          {totalProducts > pageSize && (
            <div className="mt-8 flex flex-col md:flex-row items-center justify-between">
              <div className="text-sm text-gray-700 mb-4 md:mb-0">
                Showing{" "}
                {Math.min((currentPage - 1) * pageSize + 1, totalProducts)} to{" "}
                {Math.min(currentPage * pageSize, totalProducts)} of{" "}
                {totalProducts} products
              </div>

              <div className="flex items-center">
                <div className="mr-4">
                  <label
                    htmlFor="pageSize"
                    className="text-sm text-gray-600 mr-2"
                  >
                    Show:
                  </label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) =>
                      handlePageSizeChange(Number(e.target.value))
                    }
                    className="border rounded-md px-2 py-1 text-sm"
                  >
                    <option value="20">20</option>
                    <option value="40">40</option>
                    <option value="60">60</option>
                    <option value="100">100</option>
                  </select>
                </div>

                <nav className="flex">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-l-md border ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    Prev
                  </button>

                  {Array.from(
                    {
                      length: Math.min(5, Math.ceil(totalProducts / pageSize)),
                    },
                    (_, i) => {
                      let pageNum;
                      const totalPages = Math.ceil(totalProducts / pageSize);

                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={`page-${pageNum}`}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 border-t border-b ${
                            currentPage === pageNum
                              ? "bg-indigo-600 text-white"
                              : "bg-white hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={
                      currentPage >= Math.ceil(totalProducts / pageSize)
                    }
                    className={`px-3 py-1 rounded-r-md border ${
                      currentPage >= Math.ceil(totalProducts / pageSize)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default ProductsPage;
