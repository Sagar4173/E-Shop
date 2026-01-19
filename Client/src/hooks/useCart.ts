import { useContext } from "react";
import { CartContext } from "../context/CartContext";

/**
 * Custom hook to access cart context
 * Provides a convenient way to use cart functionality throughout the app
 */
export const useCart = () => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};

export default useCart;
