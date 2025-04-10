import { useContext } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import { CartContext } from "../../context/CartContext";

const CartPage = () => {
  const { cartItems } = useContext(CartContext) || { cartItems: [] };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          Review and edit your items before checkout
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-block p-6 rounded-full bg-gray-100 mb-4">
            <FaShoppingCart className="text-4xl text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            It looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            <FaArrowLeft />
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Takes up 2/3 of the space on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <FaArrowLeft className="text-sm" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary - Takes up 1/3 of the space on large screens */}
          <div>
            <CartSummary />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CartPage;
