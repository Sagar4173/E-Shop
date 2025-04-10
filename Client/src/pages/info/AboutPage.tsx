import React from "react";
import Layout from "../../components/layout/Layout";
import { Link } from "react-router-dom";
import {
  FaCheck,
  FaShoppingBag,
  FaUsers,
  FaBoxOpen,
  FaTruck,
} from "react-icons/fa";

const AboutPage: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-purple-700 text-white py-20 px-4 rounded-lg mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Our Company
          </h1>
          <p className="text-lg mb-8">
            We're dedicated to providing high-quality products with exceptional
            customer service.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="max-w-4xl mx-auto mb-16 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="text-gray-700 mb-6 leading-relaxed">
            Founded in 2020, our e-commerce platform started with a simple
            mission: to create a better shopping experience for everyone. We
            recognized that online shoppers were often frustrated with confusing
            websites, hidden fees, and poor customer service.
          </p>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Our founders, who had backgrounds in retail and technology, set out
            to build a platform that would prioritize transparency, quality, and
            customer satisfaction above all else. What began as a small
            operation selling just a handful of products has grown into a
            comprehensive marketplace offering thousands of items across
            multiple categories.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Today, we're proud to serve customers worldwide while maintaining
            the core values that inspired us from day one. As we continue to
            grow, we remain committed to innovation, sustainability, and
            creating meaningful connections with our customers and partners.
          </p>
        </div>
      </section>

      {/* Values & Mission Section */}
      <section className="mb-16 bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Our Values & Mission
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-600">
              <h3 className="text-xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-700">
                To provide customers with a seamless shopping experience,
                offering high-quality products at competitive prices while
                setting new standards for customer service in e-commerce.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-purple-600">
              <h3 className="text-xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-700">
                To become the most trusted online marketplace globally, known
                for our integrity, quality, and dedication to customer
                satisfaction.
              </p>
            </div>

            {/* Core Values List */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6 mt-4">
              <h3 className="text-xl font-bold mb-4">Core Values</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Customer First:</strong> Every decision we make
                    prioritizes the customer experience.
                  </span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Quality:</strong> We meticulously curate our product
                    selection to ensure excellence.
                  </span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Transparency:</strong> Clear communication and no
                    hidden fees or policies.
                  </span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Integrity:</strong> We do what we say and stand
                    behind our products and services.
                  </span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Innovation:</strong> Constantly improving our
                    platform and offerings.
                  </span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Sustainability:</strong> Committed to
                    environmentally responsible business practices.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Company Facts/Stats Section */}
      <section className="max-w-4xl mx-auto mb-16 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Company Facts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat 1 */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="inline-block p-4 bg-blue-100 text-blue-600 rounded-full mb-4">
              <FaShoppingBag size={24} />
            </div>
            <h3 className="text-3xl font-bold mb-2">5000+</h3>
            <p className="text-gray-600">Products</p>
          </div>

          {/* Stat 2 */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="inline-block p-4 bg-green-100 text-green-600 rounded-full mb-4">
              <FaUsers size={24} />
            </div>
            <h3 className="text-3xl font-bold mb-2">100,000+</h3>
            <p className="text-gray-600">Happy Customers</p>
          </div>

          {/* Stat 3 */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="inline-block p-4 bg-yellow-100 text-yellow-600 rounded-full mb-4">
              <FaBoxOpen size={24} />
            </div>
            <h3 className="text-3xl font-bold mb-2">250,000+</h3>
            <p className="text-gray-600">Orders Delivered</p>
          </div>

          {/* Stat 4 */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="inline-block p-4 bg-purple-100 text-purple-600 rounded-full mb-4">
              <FaTruck size={24} />
            </div>
            <h3 className="text-3xl font-bold mb-2">25+</h3>
            <p className="text-gray-600">Countries Served</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-4xl mx-auto mb-16 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Our Leadership Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Team Member 1 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-48 bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a"
                alt="CEO"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold">John Doe</h3>
              <p className="text-blue-600 mb-2">CEO & Founder</p>
              <p className="text-gray-600 text-sm">
                With over 15 years in retail and technology, John leads our
                company vision and strategy.
              </p>
            </div>
          </div>

          {/* Team Member 2 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-48 bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2"
                alt="CTO"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold">Sarah Johnson</h3>
              <p className="text-blue-600 mb-2">CTO</p>
              <p className="text-gray-600 text-sm">
                Sarah oversees our technical infrastructure and keeps us at the
                cutting edge of e-commerce technology.
              </p>
            </div>
          </div>

          {/* Team Member 3 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-48 bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1542740348-39501cd6e2b4"
                alt="COO"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold">Michael Brown</h3>
              <p className="text-blue-600 mb-2">COO</p>
              <p className="text-gray-600 text-sm">
                Michael brings operational excellence to our logistics, ensuring
                orders reach customers efficiently and on time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-16 px-4 rounded-lg mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Customer Family</h2>
          <p className="text-lg mb-8">
            Experience the difference of shopping with a company that truly
            cares about your satisfaction.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/products"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
