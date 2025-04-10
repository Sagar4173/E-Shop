import React from "react";
import Layout from "../../components/layout/Layout";
import { Link } from "react-router-dom";
import {
  FaShippingFast,
  FaTruck,
  FaGlobeAmericas,
  FaClock,
} from "react-icons/fa";

const ShippingPage: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-purple-700 text-white py-16 px-4 rounded-lg mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Shipping Policy
          </h1>
          <p className="text-lg">
            Everything you need to know about how we ship your orders
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 mb-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-6">
              Shipping Methods & Timeframes
            </h2>

            <div className="mb-8">
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4 flex-shrink-0">
                  <FaShippingFast size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Standard Shipping
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Free for orders over $50. $4.99 for orders under $50.
                  </p>
                  <p className="text-gray-700">
                    Delivery timeframe: 3-5 business days (Monday-Friday,
                    excluding holidays)
                  </p>
                </div>
              </div>

              <div className="flex items-start mb-4">
                <div className="bg-green-100 p-3 rounded-full text-green-600 mr-4 flex-shrink-0">
                  <FaTruck size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Express Shipping
                  </h3>
                  <p className="text-gray-700 mb-2">
                    $9.99 for all eligible orders.
                  </p>
                  <p className="text-gray-700">
                    Delivery timeframe: 1-2 business days (Monday-Friday,
                    excluding holidays)
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-purple-100 p-3 rounded-full text-purple-600 mr-4 flex-shrink-0">
                  <FaGlobeAmericas size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    International Shipping
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Starting at $14.99, varies by country and order weight.
                  </p>
                  <p className="text-gray-700">
                    Delivery timeframe: 7-14 business days (varies by
                    destination country)
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Order Processing</h2>
            <p className="text-gray-700 mb-4">
              Orders are typically processed and shipped within 1-2 business
              days. During holiday seasons or promotional periods, processing
              may take up to 3 business days. You will receive a shipping
              confirmation email with tracking information as soon as your order
              ships.
            </p>

            <div className="flex items-start mb-8">
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 mr-4 flex-shrink-0">
                <FaClock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Order Cutoff Times
                </h3>
                <p className="text-gray-700">
                  To ensure same-day processing, please place your order before
                  1:00 PM Eastern Time (ET) Monday through Friday. Orders placed
                  after the cutoff time or on weekends will be processed the
                  next business day.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Shipping Restrictions</h2>
            <p className="text-gray-700 mb-6">
              Some products may have shipping restrictions to certain countries
              or regions due to regulations or logistics limitations. Any
              product-specific shipping restrictions will be clearly noted on
              the product page.
            </p>

            <h2 className="text-2xl font-bold mb-4">Tracking Your Order</h2>
            <p className="text-gray-700 mb-2">
              Once your order ships, you will receive an email with tracking
              information. You can also track your order by:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li className="mb-2">
                Logging into your account and visiting the "Orders" section
              </li>
              <li className="mb-2">
                Clicking on the tracking link in your shipping confirmation
                email
              </li>
              <li>
                Contacting our customer service team with your order number
              </li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Shipping Carriers</h2>
            <p className="text-gray-700 mb-6">
              We primarily use UPS, FedEx, and USPS for domestic shipments.
              International shipments are typically handled through DHL or UPS
              International. The specific carrier used for your order will
              depend on your location, package size, and selected shipping
              method.
            </p>

            <h2 className="text-2xl font-bold mb-4">Delivery Issues</h2>
            <p className="text-gray-700 mb-2">
              In the rare event that you experience a delivery issue, please
              contact our customer service team as soon as possible. Common
              delivery issues we can help with include:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li className="mb-2">
                Package marked as delivered but not received
              </li>
              <li className="mb-2">Damaged packages</li>
              <li className="mb-2">
                Delivery delays exceeding the estimated timeframe
              </li>
              <li>Address correction requests</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">APO/FPO/DPO Addresses</h2>
            <p className="text-gray-700 mb-6">
              We do ship to APO/FPO/DPO addresses using USPS. Please note that
              delivery timeframes to these addresses may be longer than standard
              domestic shipping, typically 2-3 weeks.
            </p>

            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions or concerns about our shipping policy,
              please{" "}
              <Link to="/contact" className="text-blue-600 hover:underline">
                contact our customer service team
              </Link>
              . We're here to help!
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> This shipping policy was last updated on
                April 10, 2025. Shipping rates, methods, and policies are
                subject to change. Please refer to this page for the most
                current information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingPage;
