import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaClipboardList,
  FaAddressCard,
  FaSignOutAlt,
  FaTrash,
  FaHeart,
  FaShoppingCart,
  FaRegHeart,
  FaExchangeAlt,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFilter,
  FaChevronDown,
  FaCheck,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import {
  isAuthenticated,
  getCurrentUser,
  logout,
  getUserProfile,
} from "../../services/authService";
import {
  getWishlistItems,
  removeFromWishlist,
} from "../../services/wishlistService";
import { CartContext } from "../../context/CartContext";
import { useContext } from "react";
import { Product } from "../../types";

// Define types for sorting and filtering
type SortOption =
  | "default"
  | "price_low"
  | "price_high"
  | "name_asc"
  | "name_desc";
type FilterOption = "all" | "in_stock" | "out_of_stock";

const WishlistPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [displayedItems, setDisplayedItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  const { addToCart } = useContext(CartContext) || {
    addToCart: () => console.error("CartContext not available"),
  };

  useEffect(() => {
    // Check if user is logged in
    if (!isAuthenticated()) {
      navigate("/login", {
        state: { from: { pathname: "/account/wishlist" } },
      });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Get user data
        const userData = getCurrentUser();
        if (userData) {
          setUser(userData);
        }

        // Get complete profile if needed
        const profileData = await getUserProfile();

        // Fetch wishlist items
        if (userData && userData._id) {
          const items = await getWishlistItems(userData._id);
          setWishlistItems(items || []);
          setDisplayedItems(items || []);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch wishlist data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    // Apply sorting and filtering whenever they change or wishlist items change
    const applyFiltersAndSort = () => {
      let items = [...wishlistItems];

      // Apply filter
      if (filterOption === "in_stock") {
        items = items.filter((item) => item.stock > 0);
      } else if (filterOption === "out_of_stock") {
        items = items.filter((item) => item.stock <= 0);
      }

      // Apply sort
      switch (sortOption) {
        case "price_low":
          items.sort((a, b) => a.price - b.price);
          break;
        case "price_high":
          items.sort((a, b) => b.price - a.price);
          break;
        case "name_asc":
          items.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name_desc":
          items.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          // Keep default order
          break;
      }

      setDisplayedItems(items);
    };

    applyFiltersAndSort();
  }, [wishlistItems, sortOption, filterOption]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    setItemToRemove(productId); // Set item to show animation

    try {
      await removeFromWishlist(productId);

      // Update state after removing item
      setWishlistItems(wishlistItems.filter((item) => item._id !== productId));

      // Dispatch a storage event to update the wishlist count in header
      window.dispatchEvent(new StorageEvent("storage", { key: "wishlist" }));

      setMessage({
        text: "Item removed from wishlist",
        type: "success",
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      setMessage({
        text: "Failed to remove item from wishlist",
        type: "error",
      });
      setItemToRemove(null);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setMessage({
      text: "Item added to cart",
      type: "success",
    });

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const handleAddAllToCart = () => {
    // Only add in-stock items to cart
    const inStockItems = displayedItems.filter((item) => item.stock > 0);

    if (inStockItems.length === 0) {
      setMessage({
        text: "No items in stock to add to cart",
        type: "error",
      });
      return;
    }

    inStockItems.forEach((item) => {
      addToCart(item, 1);
    });

    setMessage({
      text: `${inStockItems.length} items added to cart`,
      type: "success",
    });

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const handleClearWishlist = async () => {
    if (!window.confirm("Are you sure you want to clear your wishlist?")) {
      return;
    }

    try {
      const removePromises = wishlistItems.map((item) =>
        removeFromWishlist(item._id),
      );

      await Promise.all(removePromises);

      setWishlistItems([]);

      // Dispatch a storage event to update the wishlist count in header
      window.dispatchEvent(new StorageEvent("storage", { key: "wishlist" }));

      setMessage({
        text: "Wishlist cleared successfully",
        type: "success",
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to clear wishlist:", error);
      setMessage({
        text: "Failed to clear wishlist",
        type: "error",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

        {user && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl mr-4">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                {user.isAdmin && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account Navigation */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                <Link
                  to="/account"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <FaUser className="mr-3 text-gray-500" />
                  <span>Account Overview</span>
                </Link>
                <Link
                  to="/account/orders"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <FaClipboardList className="mr-3 text-gray-500" />
                  <span>My Orders</span>
                </Link>
                <Link
                  to="/account/profile"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <FaUser className="mr-3 text-gray-500" />
                  <span>Profile Settings</span>
                </Link>
                <Link
                  to="/account/addresses"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <FaAddressCard className="mr-3 text-gray-500" />
                  <span>Addresses</span>
                </Link>
                <Link
                  to="/account/wishlist"
                  className="flex items-center px-4 py-3 text-red-700 bg-red-50 rounded-md"
                >
                  <FaHeart className="mr-3 text-red-500" />
                  <span>My Wishlist</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <FaSignOutAlt className="mr-3 text-gray-500" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            {message && (
              <div
                className={`mb-4 p-4 rounded-md ${
                  message.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                } animate-fadeIn`}
              >
                {message.text}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Saved Items</h2>
                <span className="text-sm text-gray-600">
                  {wishlistItems.length}{" "}
                  {wishlistItems.length === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Filter and Sort Controls */}
              {wishlistItems.length > 0 && (
                <div className="border-b border-gray-200 p-4 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">
                      Filter:
                    </span>
                    <div className="relative inline-block">
                      <select
                        aria-label="Filter wishlist items"
                        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={filterOption}
                        onChange={(e) =>
                          setFilterOption(e.target.value as FilterOption)
                        }
                      >
                        <option value="all">All Items</option>
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <FaChevronDown className="text-gray-400 text-xs" />
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      className="flex items-center text-sm font-medium bg-white border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <FaSortAmountDown className="mr-2" />
                      Sort by
                      <FaChevronDown className="ml-2 text-xs" />
                    </button>

                    {showSortMenu && (
                      <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-40 z-10 animate-fadeIn">
                        <ul>
                          <li
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                              sortOption === "default"
                                ? "bg-blue-50 text-blue-700"
                                : ""
                            }`}
                            onClick={() => {
                              setSortOption("default");
                              setShowSortMenu(false);
                            }}
                          >
                            Default
                            {sortOption === "default" && (
                              <FaCheck className="text-blue-600" />
                            )}
                          </li>
                          <li
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                              sortOption === "price_low"
                                ? "bg-blue-50 text-blue-700"
                                : ""
                            }`}
                            onClick={() => {
                              setSortOption("price_low");
                              setShowSortMenu(false);
                            }}
                          >
                            Price: Low to High
                            {sortOption === "price_low" && (
                              <FaCheck className="text-blue-600" />
                            )}
                          </li>
                          <li
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                              sortOption === "price_high"
                                ? "bg-blue-50 text-blue-700"
                                : ""
                            }`}
                            onClick={() => {
                              setSortOption("price_high");
                              setShowSortMenu(false);
                            }}
                          >
                            Price: High to Low
                            {sortOption === "price_high" && (
                              <FaCheck className="text-blue-600" />
                            )}
                          </li>
                          <li
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                              sortOption === "name_asc"
                                ? "bg-blue-50 text-blue-700"
                                : ""
                            }`}
                            onClick={() => {
                              setSortOption("name_asc");
                              setShowSortMenu(false);
                            }}
                          >
                            Name: A to Z
                            {sortOption === "name_asc" && (
                              <FaCheck className="text-blue-600" />
                            )}
                          </li>
                          <li
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                              sortOption === "name_desc"
                                ? "bg-blue-50 text-blue-700"
                                : ""
                            }`}
                            onClick={() => {
                              setSortOption("name_desc");
                              setShowSortMenu(false);
                            }}
                          >
                            Name: Z to A
                            {sortOption === "name_desc" && (
                              <FaCheck className="text-blue-600" />
                            )}
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {wishlistItems.some((item) => item.stock > 0) && (
                      <button
                        onClick={handleAddAllToCart}
                        className="text-sm flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <FaShoppingCart className="mr-1" /> Add All to Cart
                      </button>
                    )}

                    <button
                      onClick={handleClearWishlist}
                      className="text-sm flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                      <FaTrash className="mr-1" /> Clear All
                    </button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="mt-4 text-gray-500">
                    Loading your wishlist...
                  </span>
                </div>
              ) : wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 border-dashed border-2 border-gray-200 rounded-lg m-6 bg-gray-50">
                  <FaRegHeart className="text-gray-300 text-5xl mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    Your wishlist is empty
                  </h3>
                  <p className="text-gray-500 text-center mb-6 max-w-md">
                    Save items you love and want to purchase later by clicking
                    the heart icon on product pages.
                  </p>
                  <Link
                    to="/products"
                    className="inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transform transition-transform duration-200 hover:scale-105"
                  >
                    <FaShoppingCart className="mr-2" /> Start Shopping
                  </Link>
                </div>
              ) : displayedItems.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-gray-500 mb-4">
                    No items match the selected filters
                  </p>
                  <button
                    onClick={() => {
                      setFilterOption("all");
                      setSortOption("default");
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {displayedItems.map((item) => (
                    <div
                      key={item._id}
                      className={`py-6 px-6 flex flex-col sm:flex-row group hover:bg-blue-50 transition-all duration-200 ${
                        itemToRemove === item._id
                          ? "animate-fadeOut opacity-0"
                          : ""
                      }`}
                    >
                      <div className="sm:w-32 sm:h-32 mb-4 sm:mb-0 relative">
                        <Link to={`/products/${item._id}`}>
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              // Fallback image if product image fails to load
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/150?text=Image+Not+Available";
                            }}
                          />
                          {item.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                              <span className="text-white font-medium px-2 py-1 bg-red-500 rounded text-xs">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </Link>
                      </div>
                      <div className="flex-1 sm:ml-6 flex flex-col">
                        <div className="flex justify-between">
                          <Link
                            to={`/products/${item._id}`}
                            className="font-medium text-gray-800 hover:text-blue-600 text-lg"
                          >
                            {item.name}
                          </Link>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleRemoveFromWishlist(item._id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove from wishlist"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm mb-2 capitalize">
                          {item.category}
                        </p>
                        <p className="font-semibold text-lg mb-2">
                          ₹{item.price.toFixed(2)}
                        </p>

                        {item.stock > 0 ? (
                          <p className="text-sm text-green-600 mb-3">
                            In Stock · {item.stock} available
                          </p>
                        ) : (
                          <p className="text-sm text-red-600 mb-3">
                            Currently Out of Stock
                          </p>
                        )}

                        <div className="mt-auto pt-2 flex flex-wrap gap-2 items-center">
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={item.stock <= 0}
                            className={`inline-flex items-center text-sm px-4 py-2 rounded-md transition-colors ${
                              item.stock > 0
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            <FaShoppingCart className="mr-2" /> Add to Cart
                          </button>

                          {item.stock > 0 && (
                            <Link
                              to={`/products/${item._id}`}
                              className="inline-flex items-center text-sm px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              View Details
                            </Link>
                          )}
                          {item.stock <= 0 && (
                            <button
                              className="text-sm text-blue-600 hover:text-blue-800 underline"
                              onClick={() => {
                                // Notify me when in stock
                                setMessage({
                                  text: "You will be notified when this item is back in stock",
                                  type: "success",
                                });
                                setTimeout(() => setMessage(null), 3000);
                              }}
                            >
                              Notify me when in stock
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist Tips */}
            {wishlistItems.length > 0 && (
              <div className="mt-6 bg-indigo-50 rounded-lg p-4 text-sm text-indigo-700 border border-indigo-100">
                <h3 className="font-medium mb-2">Wishlist Tips</h3>
                <ul className="list-disc list-inside space-y-1 text-indigo-600">
                  <li>Items in your wishlist will be saved for 30 days</li>
                  <li>
                    Use "Add All to Cart" to quickly purchase multiple items
                  </li>
                  <li>You'll be notified if any wishlist items go on sale</li>
                  <li>
                    Share your wishlist with friends using the share button
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WishlistPage;
