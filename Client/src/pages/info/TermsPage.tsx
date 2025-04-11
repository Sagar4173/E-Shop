import React from "react";
import Layout from "../../components/layout/Layout";
import { Link } from "react-router-dom";
import {
  FaScroll,
  FaShieldAlt,
  FaCookieBite,
  FaUserLock,
} from "react-icons/fa";

const TermsPage: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-purple-700 text-white py-16 px-4 rounded-lg mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Terms & Conditions
          </h1>
          <p className="text-lg">
            Please read these terms carefully before using our services
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 mb-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose max-w-none">
            {/* Last Updated Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600">
                <strong>Last Updated:</strong> April 10, 2025
              </p>
            </div>

            {/* Introduction */}
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="text-gray-700 mb-6">
              Welcome to E-Commerce Platform. These Terms and Conditions govern
              your use of our website, mobile applications, and services
              (collectively, the "Services"). By accessing or using our
              Services, you agree to be bound by these Terms and Conditions. If
              you disagree with any part of these terms, you may not access the
              Services.
            </p>

            <h2 className="text-2xl font-bold mb-4">Definitions</h2>
            <ul className="list-disc pl-5 text-gray-700 mb-6">
              <li className="mb-2">
                <strong>"We", "Us", "Our"</strong> refers to E-Commerce
                Platform.
              </li>
              <li className="mb-2">
                <strong>"You", "Your", "User"</strong> refers to the individual
                or entity using our Services.
              </li>
              <li className="mb-2">
                <strong>"Content"</strong> includes text, images, photos, audio,
                video, and all other forms of data or communication.
              </li>
              <li className="mb-2">
                <strong>"Products"</strong> refers to the physical or digital
                goods available for purchase through our Services.
              </li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Account Terms</h2>
            <div className="flex items-start mb-6">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4 flex-shrink-0 mt-1">
                <FaUserLock size={20} />
              </div>
              <div>
                <p className="text-gray-700 mb-4">
                  To use certain features of our Services, you must register for
                  an account. When you register, you agree to:
                </p>
                <ul className="list-disc pl-5 text-gray-700 mb-4">
                  <li className="mb-2">
                    Provide accurate, current, and complete information
                  </li>
                  <li className="mb-2">
                    Maintain and promptly update your account information
                  </li>
                  <li className="mb-2">
                    Maintain the security of your account and password
                  </li>
                  <li className="mb-2">
                    Accept responsibility for all activities that occur under
                    your account
                  </li>
                  <li className="mb-2">
                    Notify us immediately of any unauthorized use of your
                    account
                  </li>
                </ul>
                <p className="text-gray-700">
                  We reserve the right to suspend or terminate your account if
                  any information provided proves to be inaccurate, false, or
                  outdated.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Purchase Terms</h2>
            <p className="text-gray-700 mb-4">
              By placing an order through our Services, you are offering to
              purchase a product. All orders are subject to acceptance and
              availability. We reserve the right to refuse or cancel any orders
              at our discretion.
            </p>
            <p className="text-gray-700 mb-6">
              The prices for products are subject to change without notice. We
              reserve the right to discontinue any product at any time. We shall
              not be liable to you or any third party for any modification,
              price change, or discontinuance of any product.
            </p>

            <h2 className="text-2xl font-bold mb-4">Payment Terms</h2>
            <p className="text-gray-700 mb-4">
              All payments are processed securely through our payment service
              providers. By providing your payment information, you represent
              and warrant that you have the legal right to use any payment
              method(s) you provide.
            </p>
            <p className="text-gray-700 mb-6">
              All fees are exclusive of all taxes, levies, or duties imposed by
              taxing authorities. You are responsible for all such taxes,
              levies, or duties, except for taxes on our income.
            </p>

            <h2 className="text-2xl font-bold mb-4">Shipping and Delivery</h2>
            <p className="text-gray-700 mb-4">
              We will arrange for the shipment of the products you order. Please
              refer to our{" "}
              <Link to="/shipping" className="text-blue-600 hover:underline">
                Shipping Policy
              </Link>{" "}
              for detailed information on shipping methods, costs, and delivery
              times.
            </p>
            <p className="text-gray-700 mb-6">
              Title and risk of loss for items purchased from our website pass
              to you upon our delivery to the carrier. You are responsible for
              filing any claims with carriers for damaged and/or lost shipments.
            </p>

            <h2 className="text-2xl font-bold mb-4">Returns and Refunds</h2>
            <p className="text-gray-700 mb-4">
              Please review our{" "}
              <Link to="/returns" className="text-blue-600 hover:underline">
                Return Policy
              </Link>{" "}
              for information about returning products and receiving refunds.
            </p>

            <h2 className="text-2xl font-bold mb-4">
              Content and Intellectual Property
            </h2>
            <div className="flex items-start mb-6">
              <div className="bg-green-100 p-3 rounded-full text-green-600 mr-4 flex-shrink-0 mt-1">
                <FaScroll size={20} />
              </div>
              <div>
                <p className="text-gray-700 mb-4">
                  Our Services and its original content, features, and
                  functionality are owned by E-Commerce Platform and are
                  protected by international copyright, trademark, patent, trade
                  secret, and other intellectual property laws.
                </p>
                <p className="text-gray-700">
                  You may not modify, reproduce, distribute, create derivative
                  works or adaptations of, publicly display or in any way
                  exploit any of our content in whole or in part except as
                  expressly authorized by us. Unauthorized use of any materials
                  on our website may violate copyright, trademark, and other
                  laws.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">User Content</h2>
            <p className="text-gray-700 mb-4">
              By submitting content to our Services (such as product reviews or
              comments), you grant us a worldwide, non-exclusive, royalty-free
              license to use, reproduce, adapt, publish, translate, and
              distribute your content in any existing or future media.
            </p>
            <p className="text-gray-700 mb-6">
              You are responsible for your content and warrant that it does not
              violate any third party's intellectual property rights or contain
              any unlawful or offensive material.
            </p>

            <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
            <div className="flex items-start mb-6">
              <div className="bg-purple-100 p-3 rounded-full text-purple-600 mr-4 flex-shrink-0 mt-1">
                <FaShieldAlt size={20} />
              </div>
              <div>
                <p className="text-gray-700 mb-4">
                  Your privacy is important to us. Our Privacy Policy explains
                  how we collect, use, disclose, and safeguard your information
                  when you use our Services. By using our Services, you consent
                  to our Privacy Policy.
                </p>
                <p className="text-gray-700">
                  We respect your privacy and are committed to protecting your
                  personal data. Please review our{" "}
                  <Link to="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  for more information.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Cookies</h2>
            <div className="flex items-start mb-6">
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 mr-4 flex-shrink-0 mt-1">
                <FaCookieBite size={20} />
              </div>
              <div>
                <p className="text-gray-700">
                  Our website uses cookies to enhance your browsing experience,
                  analyze site traffic, and personalize content. By using our
                  Services, you consent to our use of cookies in accordance with
                  our Privacy Policy.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              In no event shall E-Commerce Platform, nor its directors,
              employees, partners, agents, suppliers, or affiliates, be liable
              for any indirect, incidental, special, consequential, or punitive
              damages, including without limitation, loss of profits, data, use,
              goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-5 text-gray-700 mb-6">
              <li className="mb-2">
                Your use or inability to use our Services
              </li>
              <li className="mb-2">
                Any unauthorized access to or use of our secure servers and/or
                any personal information stored therein
              </li>
              <li className="mb-2">
                Any interruption or cessation of transmission to or from our
                Services
              </li>
              <li className="mb-2">
                Any bugs, viruses, trojan horses, or the like that may be
                transmitted through our Services by any third party
              </li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Indemnification</h2>
            <p className="text-gray-700 mb-6">
              You agree to defend, indemnify, and hold harmless E-Commerce
              Platform and its licensees and licensors, and their employees,
              contractors, agents, officers, and directors, from and against any
              and all claims, damages, obligations, losses, liabilities, costs
              or debt, and expenses (including but not limited to attorney's
              fees), resulting from or arising out of your use and access of the
              Services, or your violation of these Terms.
            </p>

            <h2 className="text-2xl font-bold mb-4">Termination</h2>
            <p className="text-gray-700 mb-6">
              We may terminate or suspend access to our Services immediately,
              without prior notice or liability, for any reason whatsoever,
              including without limitation if you breach the Terms. All
              provisions of the Terms which by their nature should survive
              termination shall survive termination, including, without
              limitation, ownership provisions, warranty disclaimers, indemnity,
              and limitations of liability.
            </p>

            <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These Terms shall be governed and construed in accordance with the
              laws of [Your Country/State], without regard to its conflict of
              law provisions. Our failure to enforce any right or provision of
              these Terms will not be considered a waiver of those rights.
            </p>

            <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material, we will try to
              provide at least 30 days' notice prior to any new terms taking
              effect. What constitutes a material change will be determined at
              our sole discretion. By continuing to access or use our Services
              after those revisions become effective, you agree to be bound by
              the revised terms.
            </p>

            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <ul className="list-none text-gray-700 mb-6">
              <li className="mb-2">
                By email:{" "}
                <a
                  href="mailto:legal@ecommerce.com"
                  className="text-blue-600 hover:underline"
                >
                  legal@ecommerce.com
                </a>
              </li>
              <li className="mb-2">By phone: +1 (234) 567-8900</li>
              <li>
                By mail: 123 E-Commerce Street, Suite 500, San Francisco, CA
                94103, United States
              </li>
            </ul>

            {/* Acceptance notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
              <p className="text-gray-700 font-semibold">
                By using our Services, you acknowledge that you have read and
                understand these Terms and Conditions and agree to be bound by
                them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsPage;
