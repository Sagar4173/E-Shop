import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import {
  isAuthenticated,
  getCurrentUser,
  logout,
} from "../../services/authService";
import { getProducts, deleteProduct } from "../../services/productService";
import { Product } from "../../types";

// Define interface for products API response
interface ProductsResponse {
  products: Product[];
  totalProducts?: number;
}

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage] = useState<number>(5);
  const [categories, setCategories] = useState<string[]>(["All Categories"]);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: { pathname: "/admin/products" } } });
      return;
    }

    const user = getCurrentUser();
    if (!user?.isAdmin) {
      // If not admin, redirect to home page
      navigate("/");
      return;
    }

    // Fetch products
    const fetchProducts = async () => {
      try {
        const data = (await getProducts()) as ProductsResponse | Product[];

        // Handle both response formats
        const productsList = Array.isArray(data) ? data : data.products;
        setProducts(productsList);

        // Extract unique categories
        const uniqueCategories = [
          "All Categories",
          ...Array.from(
            new Set(productsList.map((product) => product.category)),
          ),
        ] as string[];

        setCategories(uniqueCategories);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load products",
        );
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const openDeleteModal = (productId: string) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setDeleteError(null);
      await deleteProduct(productToDelete);
      setProducts(
        products.filter((product) => product._id !== productToDelete),
      );
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting product:", error);
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Failed to delete product. Please try again.",
      );
      // Don't close modal to allow retry
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      selectedCategory === "" ||
      product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <Link
          to="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <FaPlus className="mr-2" /> Add New Product
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  aria-label="Filter by category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={product.imageUrl}
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stock > 10
                              ? "bg-green-100 text-green-800"
                              : product.stock > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock > 10
                            ? "In Stock"
                            : product.stock > 0
                              ? "Low Stock"
                              : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/admin/products/edit/${product._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(product._id)}
                            className="text-red-600 hover:text-red-900"
                            aria-label={`Delete ${product.name}`}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex justify-between items-center border-t">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstProduct + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastProduct, filteredProducts.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredProducts.length}</span>{" "}
                  products
                </p>
              </div>
              <nav className="flex space-x-1">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaTrash className="text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Product
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this product? This
                        action cannot be undone.
                      </p>
                    </div>
                    {deleteError && (
                      <div className="mt-2 p-2 bg-red-100 text-sm text-red-700 rounded">
                        {deleteError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteProduct}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductsPage;
