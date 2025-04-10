import { useContext } from "react";
import { FaTrash } from "react-icons/fa";
import { CartContext } from "../../context/CartContext";
import { CartItem as CartItemType } from "../../types";

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { removeFromCart, updateQuantity } = useContext(CartContext) || {
    removeFromCart: () => {},
    updateQuantity: () => {},
  };

  return (
    <div className="flex items-center py-4 border-b">
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Product Details */}
      <div className="ml-4 flex-1">
        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
        <p className="mt-1 text-sm text-gray-500">₹{item.price.toFixed(2)}</p>

        {/* Quantity Control */}
        <div className="mt-2 flex items-center">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="text-gray-500 focus:outline-none focus:text-gray-600 p-1"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M20 12H4"></path>
            </svg>
          </button>

          <span className="mx-2 text-gray-700">{item.quantity}</span>

          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="text-gray-500 focus:outline-none focus:text-gray-600 p-1"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Price and Remove */}
      <div className="flex flex-col items-end space-y-2">
        <span className="text-lg font-medium text-gray-900">
          ₹{(item.price * item.quantity).toFixed(2)}
        </span>

        <button
          onClick={() => removeFromCart(item.id)}
          className="text-red-500 hover:text-red-700 transition-colors"
          aria-label="Remove item"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
