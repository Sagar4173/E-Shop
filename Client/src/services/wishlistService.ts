import { api } from "./api";
import { Product } from "../types";
import { getCurrentUser } from "./authService";

// Function to get all items in the user's wishlist
export const getWishlistItems = async (userId?: string): Promise<Product[]> => {
  try {
    // For demo purposes, we're simulating wishlist items
    // In a real app, you would fetch from the server
    const storedWishlist = localStorage.getItem("wishlist");
    return storedWishlist ? JSON.parse(storedWishlist) : [];

    // Production implementation would be:
    // const response = await api.get(`/users/wishlist`);
    // return response.data;
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    return [];
  }
};

// Add a product to the wishlist
export const addToWishlist = async (product: Product): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("You must be logged in to add items to your wishlist");
    }

    // For demo purposes, we're storing wishlist in localStorage
    const currentWishlist = await getWishlistItems();

    // Check if item already exists in wishlist
    if (!currentWishlist.find((item) => item._id === product._id)) {
      const updatedWishlist = [...currentWishlist, product];
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    }

    // Production implementation would be:
    // await api.post('/users/wishlist', { productId: product._id });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error;
  }
};

// Remove a product from the wishlist
export const removeFromWishlist = async (productId: string): Promise<void> => {
  try {
    // For demo purposes, we're storing wishlist in localStorage
    const currentWishlist = await getWishlistItems();
    const updatedWishlist = currentWishlist.filter(
      (item) => item._id !== productId
    );
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));

    // Production implementation would be:
    // await api.delete(`/users/wishlist/${productId}`);
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error;
  }
};

// Check if a product is in the wishlist
export const isInWishlist = async (productId: string): Promise<boolean> => {
  try {
    const currentWishlist = await getWishlistItems();
    return currentWishlist.some((item) => item._id === productId);
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return false;
  }
};
