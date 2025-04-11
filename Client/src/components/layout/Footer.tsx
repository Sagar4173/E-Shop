import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaEnvelope,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaCreditCard,
  FaLock,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaCcAmex,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <h2 className="text-2xl font-bold">
                <span className="text-indigo-500">E</span>-Shop
              </h2>
            </Link>
            <p className="text-gray-400 mb-8 max-w-md">
              We offer a wide range of high-quality products at competitive
              prices. Customer satisfaction is our top priority, with fast
              shipping and excellent service.
            </p>
            <div className="flex space-x-4 mb-6">
              <a
                href="#"
                aria-label="Facebook"
                className="bg-gray-800 hover:bg-indigo-600 h-10 w-10 rounded-full flex items-center justify-center transition-colors"
              >
                <FaFacebook />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="bg-gray-800 hover:bg-indigo-600 h-10 w-10 rounded-full flex items-center justify-center transition-colors"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="bg-gray-800 hover:bg-indigo-600 h-10 w-10 rounded-full flex items-center justify-center transition-colors"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="bg-gray-800 hover:bg-indigo-600 h-10 w-10 rounded-full flex items-center justify-center transition-colors"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">
              Quick Links
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors inline-block"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-white transition-colors inline-block"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition-colors inline-block"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors inline-block"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">
              Customer Service
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-400 hover:text-white transition-colors inline-block"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-gray-400 hover:text-white transition-colors inline-block"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-400 hover:text-white transition-colors inline-block"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white transition-colors inline-block"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1.5 mr-3 text-indigo-500 flex-shrink-0" />
                <span className="text-gray-400">
                  123 Commerce Street, City Center, State 12345
                </span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-3 text-indigo-500 flex-shrink-0" />
                <span className="text-gray-400">+1 234 567 8900</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 text-indigo-500 flex-shrink-0" />
                <span className="text-gray-400">contact@eshop.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription - New Addition */}
        <div className="max-w-3xl mx-auto border-t border-gray-800 pt-8 pb-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">
              Subscribe to our Newsletter
            </h3>
            <p className="text-gray-400">
              Stay updated with our latest products and offers
            </p>
          </div>
          <form className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-gray-800 text-white px-4 py-2 rounded-md flex-grow focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              &copy; {currentYear} E-Shop. All rights reserved.
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center text-gray-400 text-sm">
                <FaLock className="mr-2 text-indigo-500" />
                Secure Payment
              </div>
              <div className="flex items-center space-x-3">
                <FaCcVisa className="h-7 w-7 text-blue-500" />
                <FaCcMastercard className="h-7 w-7 text-red-500" />
                <FaCcPaypal className="h-7 w-7 text-blue-700" />
                <FaCcAmex className="h-7 w-7 text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
