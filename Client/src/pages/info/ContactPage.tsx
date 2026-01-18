import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaCheck,
} from "react-icons/fa";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call - in production, this would call an actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset form and show success message
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch {
      setError("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-800 to-blue-700 text-white py-16 px-4 rounded-lg mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-indigo-100">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-6">Get In Touch</h2>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 mr-4">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600 text-sm">support@eshop.com</p>
                    <p className="text-gray-600 text-sm">sales@eshop.com</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-full text-green-600 mr-4">
                    <FaPhone />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600 text-sm">+1 (555) 123-4567</p>
                    <p className="text-gray-600 text-sm">+1 (555) 987-6543</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start">
                  <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 mr-4">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600 text-sm">
                      123 Commerce Street
                      <br />
                      Suite 100
                      <br />
                      New York, NY 10001
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start">
                  <div className="bg-purple-100 p-3 rounded-full text-purple-600 mr-4">
                    <FaClock />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Business Hours
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Monday - Friday: 9:00 AM - 6:00 PM
                      <br />
                      Saturday: 10:00 AM - 4:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
              <p className="text-gray-500">Map Integration</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>

              {isSubmitted && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                  <FaCheck className="mr-2" />
                  <span>
                    Thank you for your message! We'll get back to you within 24
                    hours.
                  </span>
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Your Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Question</option>
                    <option value="return">Return / Refund</option>
                    <option value="shipping">Shipping Question</option>
                    <option value="product">Product Information</option>
                    <option value="feedback">Feedback / Suggestion</option>
                    <option value="partnership">Business / Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white transition-colors ${
                      isSubmitting
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Link Section */}
      <section className="bg-gray-50 py-12 px-4 rounded-lg mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Looking for Quick Answers?
          </h2>
          <p className="text-gray-600 mb-6">
            Check out our frequently asked questions for instant help with
            common topics.
          </p>
          <a
            href="/faq"
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Visit FAQ Page
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
