import { Link } from "react-router-dom";
import { FaHome, FaSearch, FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import Layout from "../../components/layout/Layout";

const NotFoundPage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-indigo-600">404</h1>
          <div className="mt-4 mb-8">
            <div className="h-1 w-16 bg-indigo-600 mx-auto"></div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FaHome className="mr-2" /> Back to Home
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white border-indigo-600 hover:bg-gray-50"
            >
              <FaShoppingCart className="mr-2" /> Continue Shopping
            </Link>
          </div>

          <div className="mt-12">
            <Link
              to="/"
              onClick={() => window.history.back()}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
            >
              <FaArrowLeft className="mr-2" /> Go Back
            </Link>
          </div>

          <div className="mt-16 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-500">
              Need help finding something?
            </p>
            <div className="flex justify-center mt-4">
              <Link
                to="/contact"
                className="text-indigo-600 hover:text-indigo-500 mr-6"
              >
                Contact Support
              </Link>
              <Link
                to="/search"
                className="text-indigo-600 hover:text-indigo-500"
              >
                <FaSearch className="inline mr-1" /> Search Site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
