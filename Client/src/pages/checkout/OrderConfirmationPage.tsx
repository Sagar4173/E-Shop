import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import Layout from "../../components/layout/Layout";

const OrderConfirmationPage = () => {
  // Generate a random order number for display purposes
  const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center py-12">
        <FaCheckCircle className="mx-auto text-green-500 text-5xl mb-6" />
        <h1 className="text-3xl font-bold mb-3">Thank You for Your Order!</h1>
        <p className="text-gray-600 mb-8">
          Your order has been successfully placed and is being processed.
        </p>

        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Order Information</h2>
          <div className="flex flex-col space-y-2 mb-6">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">{orderNumber}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-blue-600">Processing</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            A confirmation email has been sent to your email address with the
            order details.
          </p>

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              If you have any questions about your order, please contact our
              customer support:
            </p>
            <p>
              <a
                href="mailto:support@ecommerce.com"
                className="text-blue-600 hover:underline"
              >
                support@ecommerce.com
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/account/orders"
            className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 py-3 px-6 rounded-md font-medium transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmationPage;
