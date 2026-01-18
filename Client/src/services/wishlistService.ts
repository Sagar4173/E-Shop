import api from "./api";
import { Product } from "../types";

// Helper to check if user is logged in (check for token in storage)
const isAuthenticated = (): boolean => {
  return (
    localStorage.getItem("token") !== null ||
    sessionStorage.getItem("token") !== null
  );
};

// Function to get all items in the user's wishlist
export const getWishlistItems = async (): Promise<Product[]> => {
  if (isAuthenticated()) {
    // Use server API for authenticated users
    const response = await api.get("/wishlist");
    return response.data;
  }
  // Fallback to localStorage for non-authenticated users
  const storedWishlist = localStorage.getItem("wishlist");
  return storedWishlist ? JSON.parse(storedWishlist) : [];
};

// Add a product to the wishlist
export const addToWishlist = async (product: Product): Promise<void> => {
  if (isAuthenticated()) {
    // Use server API for authenticated users
    await api.post("/wishlist", { productId: product._id });
    return;
  }

  // Fallback to localStorage for non-authenticated users
  const currentWishlist = await getWishlistItems();
  if (!currentWishlist.find((item) => item._id === product._id)) {
    const updatedWishlist = [...currentWishlist, product];
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  }
};

// Remove a product from the wishlist
export const removeFromWishlist = async (productId: string): Promise<void> => {
  if (isAuthenticated()) {
    // Use server API for authenticated users
    await api.delete(`/wishlist/${productId}`);
    return;
  }

  // Fallback to localStorage for non-authenticated users
  const currentWishlist = await getWishlistItems();
  const updatedWishlist = currentWishlist.filter(
    (item) => item._id !== productId,
  );
  localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
};

// Check if a product is in the wishlist
export const isInWishlist = async (productId: string): Promise<boolean> => {
  if (isAuthenticated()) {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data.isInWishlist;
  }
  const currentWishlist = await getWishlistItems();
  return currentWishlist.some((item) => item._id === productId);
};

// Sync localStorage wishlist to server after login
export const syncWishlistToServer = async (): Promise<void> => {
  if (!isAuthenticated()) return;

  const localWishlist = localStorage.getItem("wishlist");
  if (localWishlist) {
    const items: Product[] = JSON.parse(localWishlist);
    for (const item of items) {
      try {
        await api.post("/wishlist", { productId: item._id });
      } catch {
        // Ignore errors for items that may already exist
      }
    }
    // Clear localStorage after sync
    localStorage.removeItem("wishlist");
  }
};
