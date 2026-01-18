import React, { createContext, useState, useEffect } from "react";
import { CartItem, Product } from "../types";
import { getCurrentUser, isAuthenticated } from "../services/authService";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined,
);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Check for user and update userId when auth state changes
  useEffect(() => {
    const checkUser = () => {
      if (isAuthenticated()) {
        const user = getCurrentUser();
        setCurrentUserId(user?._id || null); // Only use _id property which exists in User type
      } else {
        setCurrentUserId(null);
      }
    };

    // Check on initial load
    checkUser();

    // Set up event listener for auth changes - use named function for proper cleanup
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token" || event.key === "user") {
        checkUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Generate the appropriate storage key based on user or guest
  const getCartStorageKey = () => {
    return currentUserId ? `cart_${currentUserId}` : "guest_cart";
  };

  // Load cart from localStorage when component mounts or user changes
  useEffect(() => {
    const storageKey = getCartStorageKey();
    const storedCart = localStorage.getItem(storageKey);

    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
        setCartItems([]);
      }
    } else {
      // If no cart exists for this user/guest, initialize empty cart
      setCartItems([]);
    }
  }, [currentUserId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const storageKey = getCartStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, currentUserId]);

  // Transfer guest cart to user cart when logging in
  useEffect(() => {
    if (currentUserId) {
      const guestCartData = localStorage.getItem("guest_cart");

      if (guestCartData) {
        try {
          const guestCart = JSON.parse(guestCartData);

          if (guestCart && guestCart.length > 0) {
            const userCartKey = `cart_${currentUserId}`;
            const userCartData = localStorage.getItem(userCartKey);

            if (!userCartData) {
              // If user has no existing cart, use the guest cart
              localStorage.setItem(userCartKey, guestCartData);
              setCartItems(guestCart);

              // Clear the guest cart
              localStorage.removeItem("guest_cart");
            } else {
              // If user has an existing cart, we load that instead
              // Guest cart stays in localStorage until explicitly cleared
              // to avoid losing items if user logs out
              try {
                setCartItems(JSON.parse(userCartData));
              } catch (error) {
                console.error("Failed to parse user cart:", error);
              }
            }
          }
        } catch (error) {
          console.error("Failed to process guest cart during login:", error);
        }
      }
    }
  }, [currentUserId]);

  const addToCart = (product: Product, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product._id || item.id === product.id,
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        // Ensure we have a valid string ID
        const productId = (product._id || product.id || "").toString();

        return [
          ...prevItems,
          {
            id: productId,
            name: product.name,
            price: product.price,
            quantity,
            imageUrl: product.imageUrl,
          },
        ];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setCartItems([]);
    // Also clear from localStorage
    localStorage.removeItem(getCartStorageKey());
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const contextValue: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};
