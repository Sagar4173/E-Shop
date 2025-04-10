import React from "react";
import Layout from "../../components/layout/Layout";
import { Link } from "react-router-dom";
import {
  FaExchangeAlt,
  FaMoneyBillWave,
  FaShieldAlt,
  FaRegClock,
  FaTags,
  FaTruck,
} from "react-icons/fa";

const ReturnPolicyPage: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-purple-700 text-white py-16 px-4 rounded-lg mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Return Policy</h1>
          <p className="text-lg">
            We want you to be completely satisfied with your purchase
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 mb-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-6">Our Return Policy</h2>
            <p className="text-gray-700 mb-6">
              At E-Commerce Platform, we stand behind our products and want you
              to be completely satisfied with your purchase. If for any reason
              you're not happy with your order, we're here to help with an easy
              return process.
            </p>

            <div className="flex items-start mb-8">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4 flex-shrink-0">
                <FaRegClock size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  30-Day Return Window
                </h3>
                <p className="text-gray-700">
                  You have 30 days from the delivery date to return most items
                  in their original condition. Some seasonal or special items
                  may have different return windows, which will be clearly noted
                  on the product page.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Return Process</h2>
            <ol className="list-decimal pl-6 mb-8 space-y-6 text-gray-700">
              <li>
                <strong>Initiate Your Return:</strong> Log in to your account,
                go to your orders section, and select the item(s) you wish to
                return. Alternatively, you can contact our customer service
                team.
              </li>
              <li>
                <strong>Reason for Return:</strong> Select a reason for your
                return. This helps us improve our products and services.
              </li>
              <li>
                <strong>Generate a Return Label:</strong> Once your return
                request is approved, we'll email you a prepaid return shipping
                label.
              </li>
              <li>
                <strong>Package Your Return:</strong> Place the item(s) in the
                original packaging if possible, or use a sturdy box. Include all
                parts, accessories, tags, and documentation that came with the
                item.
              </li>
              <li>
                <strong>Ship Your Return:</strong> Affix the return shipping
                label to your package and drop it off at the specified carrier
                location.
              </li>
              <li>
                <strong>Refund Processing:</strong> Once we receive and inspect
                your return, we'll process your refund, typically within 3-5
                business days.
              </li>
            </ol>

            <h2 className="text-2xl font-bold mb-4">Refund Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-full text-green-600 mr-4 flex-shrink-0">
                  <FaMoneyBillWave size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Original Payment Method
                  </h3>
                  <p className="text-gray-700">
                    Refunds are typically issued to your original payment
                    method. Credit card refunds can take 5-10 business days to
                    appear on your statement.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 mr-4 flex-shrink-0">
                  <FaExchangeAlt size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Store Credit</h3>
                  <p className="text-gray-700">
                    You can choose to receive store credit instead of a refund.
                    Store credit is processed more quickly and comes with a 10%
                    bonus value.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Return Shipping Costs</h2>
            <p className="text-gray-700 mb-6">
              For standard returns, we provide a prepaid return shipping label
              at no cost to you. However, if the return is not due to a product
              defect, damage, or error on our part, a shipping fee may be
              deducted from your refund.
            </p>

            <h2 className="text-2xl font-bold mb-4">
              Items Not Eligible for Return
            </h2>
            <div className="flex items-start mb-6">
              <div className="bg-red-100 p-3 rounded-full text-red-600 mr-4 flex-shrink-0">
                <FaTags size={20} />
              </div>
              <div>
                <p className="text-gray-700 mb-2">
                  Certain items cannot be returned for health, safety, or other
                  reasons:
                </p>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>Personalized or custom-made items</li>
                  <li>Digital products and downloaded software</li>
                  <li>Gift cards and store credits</li>
                  <li>
                    Personal care items and cosmetics that have been opened or
                    used
                  </li>
                  <li>Products marked as "Final Sale" or "Non-Returnable"</li>
                  <li>Items with missing tags, packaging, or accessories</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Exchanges</h2>
            <div className="flex items-start mb-6">
              <div className="bg-purple-100 p-3 rounded-full text-purple-600 mr-4 flex-shrink-0">
                <FaExchangeAlt size={20} />
              </div>
              <div>
                <p className="text-gray-700 mb-2">
                  If you need a different size, color, or similar product
                  variation, we recommend:
                </p>
                <ol className="list-decimal pl-6 text-gray-700">
                  <li>Placing a new order for the desired item</li>
                  <li>
                    Returning the original item through our standard return
                    process
                  </li>
                </ol>
                <p className="text-gray-700 mt-2">
                  This approach ensures you get the new item as quickly as
                  possible while your return is being processed.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">
              Damaged or Defective Items
            </h2>
            <div className="flex items-start mb-6">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4 flex-shrink-0">
                <FaShieldAlt size={20} />
              </div>
              <div>
                <p className="text-gray-700 mb-2">
                  If you receive an item that's damaged or defective:
                </p>
                <ol className="list-decimal pl-6 text-gray-700">
                  <li>Contact customer service within 48 hours of delivery</li>
                  <li>Provide photos of the damage when possible</li>
                  <li>
                    We'll arrange a return and replacement or refund at no cost
                    to you
                  </li>
                </ol>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">International Returns</h2>
            <div className="flex items-start mb-8">
              <div className="bg-orange-100 p-3 rounded-full text-orange-600 mr-4 flex-shrink-0">
                <FaTruck size={20} />
              </div>
              <div>
                <p className="text-gray-700">
                  International returns follow the same process, but may take
                  longer to process. Please note that customs fees, import
                  duties, or taxes paid on the original shipment are typically
                  non-refundable. Contact our international customer service for
                  specific guidance based on your location.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-8">
              If you have any questions or need assistance with a return, please{" "}
              <Link to="/contact" className="text-blue-600 hover:underline">
                contact our customer service team
              </Link>
              . We're here to help make your shopping experience seamless.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> This return policy was last updated on
                April 10, 2025. Return policies are subject to change. Please
                refer to this page for the most current information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReturnPolicyPage;
