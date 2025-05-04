import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import ProductCard from "../../components/products/ProductCard";
import { Product } from "../../types";
import {
  getFeaturedProducts,
  getProducts,
} from "../../services/productService";
import {
  FaShippingFast,
  FaLock,
  FaStar,
  FaAngleLeft,
  FaAngleRight,
  FaQuoteRight,
} from "react-icons/fa";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [featuredProductsLoading, setFeaturedProductsLoading] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Hero slide data
  const heroSlides = [
    {
      title: "Spring Collection 2025",
      subtitle: "Refresh Your Style",
      description:
        "Discover our latest collection with up to 30% off selected items",
      buttonText: "Shop Collection",
      buttonLink: "/products?sort=newest",
      image:
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1740",
    },
    {
      title: "Tech Essentials",
      subtitle: "Smart Devices for Modern Living",
      description:
        "Upgrade your gear with the latest tech innovations at unbeatable prices",
      buttonText: "Explore Tech",
      buttonLink: "/products?category=electronics",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070",
    },
    {
      title: "Home & Living",
      subtitle: "Transform Your Space",
      description:
        "Create your perfect sanctuary with our stylish home collection",
      buttonText: "Shop Home",
      buttonLink: "/products?category=home",
      image:
        "https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=1887",
    },
  ];

  // Testimonial data
  const testimonials = [
    {
      name: "Michael P.",
      text: "I've been shopping here for years. The quality of products and customer service is consistently excellent.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=774",
    },
    {
      name: "Sarah L.",
      text: "Fast shipping, easy returns, and the wide selection keeps me coming back. Best online shopping experience!",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=774",
    },
    {
      name: "David R.",
      text: "Found exactly what I needed at a great price. The site is easy to navigate and checkout was simple.",
      rating: 4,
      image:
        "https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=774",
    },
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        // Load featured products
        const featuredData = await getFeaturedProducts();
        setFeaturedProducts(featuredData);

        // Load new arrivals (latest products)
        try {
          setFeaturedProductsLoading(true);
          const data = await getProducts({ sort: "newest", limit: 8 });
          // Handle both response formats (array or object with products property)
          const products = Array.isArray(data)
            ? data
            : (data as any).products || [];
          setFeaturedProducts(products);
          setFeaturedProductsLoading(false);
        } catch (error) {
          setError("Failed to load products");
          setLoading(false);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load products");
        setLoading(false);
      }
    };

    loadProducts();

    // Auto-advance hero slider
    const slider = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(slider);
  }, []);

  // Handle slider navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  // Handle newsletter subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call an API to handle subscription
    // For now, we'll just show a success state
    setSubscribed(true);
    setEmail("");

    // Reset after 5 seconds
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <Layout>
      {/* Hero Carousel */}
      <section className="relative mb-12 overflow-hidden rounded-lg shadow-xl">
        <div ref={sliderRef} className="relative h-[500px] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
                currentSlide === index
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10" />
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center z-20">
                <div className="container mx-auto px-4 md:px-8">
                  <div className="max-w-lg text-white">
                    <span className="inline-block bg-indigo-600 text-white px-3 py-1 text-sm font-medium rounded-md mb-4">
                      {slide.subtitle}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeIn">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl mb-8">
                      {slide.description}
                    </p>
                    <Link
                      to={slide.buttonLink}
                      className="inline-block bg-white text-indigo-600 font-medium px-8 py-3 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === index ? "bg-white" : "bg-white/40"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full z-30"
          onClick={prevSlide}
        >
          <FaAngleLeft size={20} />
        </button>

        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full z-30"
          onClick={nextSlide}
        >
          <FaAngleRight size={20} />
        </button>
      </section>

      {/* Benefits Bar */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-center text-center">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
              <FaShippingFast size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Free Shipping</h3>
              <p className="text-sm text-gray-600">On orders over ₹50</p>
            </div>
          </div>

          <div className="flex items-center justify-center text-center">
            <div className="bg-green-100 p-3 rounded-full text-green-600 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Easy Returns</h3>
              <p className="text-sm text-gray-600">30-day return policy</p>
            </div>
          </div>

          <div className="flex items-center justify-center text-center">
            <div className="bg-purple-100 p-3 rounded-full text-purple-600 mr-4">
              <FaLock size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Secure Payment</h3>
              <p className="text-sm text-gray-600">Protected by Stripe</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link
            to="/products"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center py-8 text-gray-500">
                No featured products available
              </p>
            )}
          </div>
        )}
      </section>

      {/* New Arrivals */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">New Arrivals</h2>
          <Link
            to="/products?sort=newest"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.length > 0 ? (
              newArrivals
                .slice(0, 4)
                .map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
            ) : (
              <p className="col-span-full text-center py-8 text-gray-500">
                No new products available
              </p>
            )}
          </div>
        )}
      </section>

      {/* Categories Section - More visually appealing */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6">
          {/* Electronics Category - Larger */}
          <div className="group relative h-80 md:h-96 bg-gray-100 rounded-lg overflow-hidden cursor-pointer md:col-span-3">
            <img
              src="https://images.unsplash.com/photo-1498049794561-7780e7231661"
              alt="Electronics"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
              <div className="p-6">
                <h3 className="text-white text-2xl font-bold mb-2">
                  Electronics
                </h3>
                <p className="text-gray-200 mb-4 max-w-xs">
                  Latest gadgets and tech essentials for work and entertainment
                </p>
                <Link
                  to="/products?category=electronics"
                  className="inline-block bg-white text-black font-medium px-6 py-2 rounded-md hover:bg-gray-100"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Clothing Category */}
          <div className="group relative h-80 bg-gray-100 rounded-lg overflow-hidden cursor-pointer md:col-span-3">
            <img
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b"
              alt="Clothing"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
              <div className="p-6">
                <h3 className="text-white text-2xl font-bold mb-2">Clothing</h3>
                <p className="text-gray-200 mb-4 max-w-xs">
                  Stylish apparel for every season and occasion
                </p>
                <Link
                  to="/products?category=clothing"
                  className="inline-block bg-white text-black font-medium px-6 py-2 rounded-md hover:bg-gray-100"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Home Category */}
          <div className="group relative h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer md:col-span-2">
            <img
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f"
              alt="Home"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
              <div className="p-4">
                <h3 className="text-white text-xl font-bold mb-2">
                  Home & Living
                </h3>
                <Link
                  to="/products?category=home"
                  className="inline-block bg-white text-black font-medium px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Accessories Category */}
          <div className="group relative h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer md:col-span-2">
            <img
              src="https://images.unsplash.com/photo-1544816155-12df9643f363"
              alt="Accessories"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
              <div className="p-4">
                <h3 className="text-white text-xl font-bold mb-2">
                  Accessories
                </h3>
                <Link
                  to="/products?category=accessories"
                  className="inline-block bg-white text-black font-medium px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Beauty Category */}
          <div className="group relative h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer md:col-span-2">
            <img
              src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b"
              alt="Beauty"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
              <div className="p-4">
                <h3 className="text-white text-xl font-bold mb-2">Beauty</h3>
                <Link
                  to="/products?category=beauty"
                  className="inline-block bg-white text-black font-medium px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="mb-16">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg overflow-hidden shadow-lg">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="inline-block bg-white text-indigo-600 px-3 py-1 text-sm font-medium rounded-md mb-4">
                Limited Time Offer
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Special Offer: 20% Off for New Customers
              </h2>
              <p className="mb-6 text-lg">
                Use coupon code <span className="font-bold">WELCOME20</span> at
                checkout for 20% off your first order. Valid until April 30,
                2025.
              </p>
              <Link
                to="/products"
                className="inline-block bg-white hover:bg-gray-100 text-indigo-600 font-medium px-8 py-3 rounded-md transition-colors self-start"
              >
                Shop Now
              </Link>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f"
                alt="Special offer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          What Our Customers Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < testimonial.rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>

              <div className="text-center mb-4">
                <FaQuoteRight className="inline-block text-gray-300 text-xl" />
              </div>

              <p className="text-gray-700 text-center mb-4">
                "{testimonial.text}"
              </p>

              <p className="font-medium text-center">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
