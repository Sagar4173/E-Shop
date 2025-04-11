import React from "react";
import Layout from "../../components/layout/Layout";
import { Link } from "react-router-dom";
import {
  FaQuestionCircle,
  FaShippingFast,
  FaExchangeAlt,
  FaLock,
  FaUserCircle,
  FaCreditCard,
} from "react-icons/fa";

const FAQPage: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-purple-700 text-white py-16 px-4 rounded-lg mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg">
            Find answers to commonly asked questions about our products and
            services
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 mb-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* FAQ Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="inline-block p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
                <FaShippingFast size={24} />
              </div>
              <h3 className="font-bold mb-2">Shipping & Delivery</h3>
              <p className="text-sm text-gray-600">
                Questions about order shipping, tracking, and delivery times
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="inline-block p-3 bg-green-100 text-green-600 rounded-full mb-4">
                <FaExchangeAlt size={24} />
              </div>
              <h3 className="font-bold mb-2">Returns & Refunds</h3>
              <p className="text-sm text-gray-600">
                Information about our return process and refund policy
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <div className="inline-block p-3 bg-purple-100 text-purple-600 rounded-full mb-4">
                <FaLock size={24} />
              </div>
              <h3 className="font-bold mb-2">Account & Security</h3>
              <p className="text-sm text-gray-600">
                Help with your account and keeping your information secure
              </p>
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Ordering & Payment</h2>

            <div className="border border-gray-200 rounded-lg divide-y">
              {/* FAQ Item 1 */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  How do I place an order?
                </h3>
                <p className="text-gray-700">
                  Browse our products, select the items you want, add them to
                  your cart, and proceed to checkout. You can shop as a guest or
                  create an account for a faster checkout experience next time.
                </p>
              </div>

              {/* FAQ Item 2 */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-700">
                  We accept all major credit and debit cards (Visa, Mastercard,
                  American Express), PayPal, and bank transfers. All
                  transactions are processed securely through our payment
                  gateway.
                </p>
              </div>

              {/* FAQ Item 3 */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  Is it safe to use my credit card on your website?
                </h3>
                <p className="text-gray-700">
                  Yes, all payment information is encrypted using
                  industry-standard SSL technology. We don't store your full
                  credit card details on our servers. Our payment processing is
                  PCI-DSS compliant for maximum security.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-6">
              Shipping & Delivery
            </h2>

            <div className="border border-gray-200 rounded-lg divide-y">
              {/* FAQ Item 4 */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  How long will it take to receive my order?
                </h3>
                <p className="text-gray-700">
                  Standard shipping typically takes 3-5 business days within the
                  continental US. Express shipping options are available at
                  checkout for 1-2 business day delivery. International shipping
                  varies by location but usually takes 7-14 business days.
                </p>
              </div>

              {/* FAQ Item 5 */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  How can I track my order?
                </h3>
                <p className="text-gray-700">
                  Once your order ships, you'll receive a confirmation email
                  with tracking information. You can also view your order status
                  by logging into your account and visiting the "Orders"
                  section.
                </p>
              </div>

              {/* FAQ Item 6 */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  Do you ship internationally?
                </h3>
                <p className="text-gray-700">
                  Yes, we ship to most countries worldwide. International
                  shipping costs and delivery times vary depending on the
                  destination. Please note that additional customs fees, import
                  duties, or taxes may apply depending on your country's
                  regulations.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-6">Returns & Refunds</h2>

            <div className="border border-gray-200 rounded-lg divide-y">
              {/* FAQ Item 7 */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  What is your return policy?
                </h3>
                <p className="text-gray-700">
                  We offer a 30-day return policy for most items. Products must
                  be in original condition with all packaging. Some restrictions
                  apply for certain product categories. Please visit our{" "}
                  <Link to="/returns" className="text-blue-600 hover:underline">
                    Returns & Refunds page
                  </Link>{" "}
                  for more details.
                </p>
              </div>

              {/* FAQ Item 8 */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  How do I initiate a return?
                </h3>
                <p className="text-gray-700">
                  Log in to your account, go to your orders section, and select
                  the item(s) you wish to return. Follow the prompts to generate
                  a return shipping label. If you checked out as a guest,
                  contact our customer service team with your order number.
                </p>
              </div>

              {/* FAQ Item 9 */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  When will I receive my refund?
                </h3>
                <p className="text-gray-700">
                  Once we receive and inspect your return, we'll process your
                  refund within 3-5 business days. Refunds are typically issued
                  to your original payment method. Credit card refunds can take
                  5-10 business days to appear on your statement.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-6">
              Account & Security
            </h2>

            <div className="border border-gray-200 rounded-lg divide-y">
              {/* FAQ Item 10 */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  How do I create an account?
                </h3>
                <p className="text-gray-700">
                  Click on the "Sign In" button in the top navigation, then
                  select "Register". Fill in the required information including
                  your name, email address, and a secure password. You'll
                  receive a verification email to confirm your account.
                </p>
              </div>

              {/* FAQ Item 11 */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  I forgot my password. How can I reset it?
                </h3>
                <p className="text-gray-700">
                  Go to the login page and click on "Forgot Password". Enter the
                  email address associated with your account, and we'll send you
                  instructions to reset your password.
                </p>
              </div>

              {/* FAQ Item 12 */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  How is my personal information protected?
                </h3>
                <p className="text-gray-700">
                  We use industry-standard encryption and security measures to
                  protect your personal information. Your data is never sold to
                  third parties. For more details, please review our
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    {" "}
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Contact Banner */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg mt-12 p-6">
            <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
            <p className="text-gray-600 mb-4">
              If you couldn't find the answer you're looking for, our customer
              service team is here to help.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              <FaQuestionCircle className="mr-2" />
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
