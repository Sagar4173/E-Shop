const axios = require("axios");

/**
 * Scrape product data from multiple APIs to get unique products with diverse categories
 * @returns {Promise<Array>} Array of product objects formatted to our schema
 */
const scrapeProductsFromFakeStoreAPI = async () => {
  try {
    console.log("Scraping products from multiple sources...");

    // Collect products from multiple sources
    const products = [];

    // 1. Get products from Fake Store API
    const fakeStoreProducts = await getFakeStoreProducts();
    products.push(...fakeStoreProducts);

    // 2. Get products from DummyJSON API
    const dummyJsonProducts = await getDummyJsonProducts();
    products.push(...dummyJsonProducts);

    // 3. Get products from mock data of more categories
    const mockProducts = getMockProducts();
    products.push(...mockProducts);

    console.log(
      `Successfully collected ${products.length} unique products across multiple categories`
    );
    return products;
  } catch (error) {
    console.error("Error scraping products:", error);
    throw error;
  }
};

/**
 * Get products from Fake Store API
 * @returns {Promise<Array>} Formatted products
 */
const getFakeStoreProducts = async () => {
  try {
    console.log("Fetching products from Fake Store API...");
    const response = await axios.get("https://fakestoreapi.com/products");
    const fakeStoreProducts = response.data;

    // Map the Fake Store API product format to our product schema
    return fakeStoreProducts.map((product) => {
      // Map categories to our existing ones
      let category = mapCategory(product.category);

      // Generate random stock between 10 and 100
      const stock = Math.floor(Math.random() * 90) + 10;

      // Randomly mark some products as featured
      const featured = Math.random() > 0.8;

      return {
        name: product.title,
        description: product.description,
        price: product.price,
        imageUrl: product.image,
        category,
        stock,
        rating: product.rating.rate,
        numReviews: product.rating.count,
        featured,
      };
    });
  } catch (error) {
    console.error("Error fetching from Fake Store API:", error);
    return [];
  }
};

/**
 * Get products from DummyJSON API
 * @returns {Promise<Array>} Formatted products
 */
const getDummyJsonProducts = async () => {
  try {
    console.log("Fetching products from DummyJSON API...");
    // DummyJSON provides 100 products with multiple categories
    const response = await axios.get(
      "https://dummyjson.com/products?limit=100"
    );
    const dummyJsonProducts = response.data.products;

    // Map the DummyJSON API product format to our product schema
    return dummyJsonProducts.map((product) => {
      // Map categories
      let category = mapDummyJsonCategory(product.category);

      // Generate random stock between 10 and 100
      const stock = Math.floor(Math.random() * 90) + 10;

      // Randomly mark some products as featured
      const featured = Math.random() > 0.8;

      return {
        name: product.title,
        description: product.description,
        price: product.price,
        // Use the first image if there are multiple
        imageUrl:
          Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : product.thumbnail,
        category,
        stock,
        rating: product.rating,
        numReviews: Math.floor(Math.random() * 100) + 20, // Generate random review count
        featured,
      };
    });
  } catch (error) {
    console.error("Error fetching from DummyJSON API:", error);
    return [];
  }
};

/**
 * Get mock products for additional categories
 * @returns {Array} Formatted products
 */
const getMockProducts = () => {
  console.log("Generating mock products for additional categories...");

  const mockProducts = [
    // Books category
    {
      name: "The Art of Software Development",
      description:
        "A comprehensive guide to modern software development practices and methodologies.",
      price: 34.99,
      imageUrl:
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
      category: "Books",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.7,
      numReviews: 83,
      featured: false,
    },
    {
      name: "The Psychology of Decision Making",
      description:
        "An exploration of how people make decisions and how to improve decision-making processes.",
      price: 29.95,
      imageUrl:
        "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Books",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.5,
      numReviews: 62,
      featured: true,
    },
    // Home & Garden category
    {
      name: "Indoor Plant Collection",
      description:
        "Set of 5 low-maintenance indoor plants perfect for improving air quality and home aesthetics.",
      price: 64.99,
      imageUrl:
        "https://images.unsplash.com/photo-1545241047-6083a3684587?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
      category: "Home & Garden",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.8,
      numReviews: 49,
      featured: false,
    },
    {
      name: "Automatic Plant Watering System",
      description:
        "Smart watering system that monitors soil moisture and waters your plants automatically.",
      price: 39.99,
      imageUrl:
        "https://images.unsplash.com/photo-1558864511-0fbc456393f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Home & Garden",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.3,
      numReviews: 38,
      featured: true,
    },
    // Sports & Outdoors category
    {
      name: "Ultralight Hiking Backpack",
      description:
        "Waterproof 45L hiking backpack with multiple compartments and built-in rain cover.",
      price: 79.99,
      imageUrl:
        "https://images.unsplash.com/photo-1574681355460-48fdabf94b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Sports & Outdoors",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.6,
      numReviews: 72,
      featured: false,
    },
    {
      name: "Portable Camping Stove",
      description:
        "Compact propane camping stove with wind protection and electronic ignition.",
      price: 49.99,
      imageUrl:
        "https://images.unsplash.com/photo-1532339142463-fd0a8979791a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Sports & Outdoors",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.4,
      numReviews: 56,
      featured: true,
    },
    // Toys & Games category
    {
      name: "Educational STEM Building Set",
      description:
        "Building blocks set that teaches principles of engineering and architecture for ages 8+.",
      price: 44.99,
      imageUrl:
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Toys & Games",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.8,
      numReviews: 87,
      featured: true,
    },
    {
      name: "Strategy Board Game Collection",
      description:
        "Set of 3 family-friendly strategy board games suitable for players aged 10 and up.",
      price: 59.99,
      imageUrl:
        "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Toys & Games",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.7,
      numReviews: 63,
      featured: false,
    },
    // Pet Supplies category
    {
      name: "Automatic Pet Feeder",
      description:
        "Programmable pet feeder with portion control and voice recording for meal times.",
      price: 69.99,
      imageUrl:
        "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Pet Supplies",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.5,
      numReviews: 78,
      featured: false,
    },
    {
      name: "Interactive Pet Toy",
      description:
        "Battery-operated interactive toy that keeps pets entertained when home alone.",
      price: 34.99,
      imageUrl:
        "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Pet Supplies",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.6,
      numReviews: 54,
      featured: true,
    },
    // Health & Wellness category
    {
      name: "Smart Fitness Tracker",
      description:
        "Waterproof fitness tracker with heart rate monitoring, sleep tracking, and smartphone notifications.",
      price: 89.99,
      imageUrl:
        "https://images.unsplash.com/photo-1557825835-70d97c4aa567?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Health & Wellness",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.7,
      numReviews: 96,
      featured: true,
    },
    {
      name: "Meditation Cushion Set",
      description:
        "Ergonomic meditation cushion set with mat, made from natural materials for comfort during long sessions.",
      price: 59.99,
      imageUrl:
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Health & Wellness",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.4,
      numReviews: 42,
      featured: false,
    },
    // Food & Beverages category
    {
      name: "Gourmet Coffee Sampler",
      description:
        "Collection of single-origin whole bean coffees from around the world, roasted in small batches.",
      price: 49.99,
      imageUrl:
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Food & Beverages",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.8,
      numReviews: 87,
      featured: true,
    },
    {
      name: "Artisanal Chocolate Gift Box",
      description:
        "Handcrafted chocolates with unique flavors, made from ethically sourced cacao.",
      price: 34.99,
      imageUrl:
        "https://images.unsplash.com/photo-1549007994-cb92caebd54b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Food & Beverages",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.9,
      numReviews: 74,
      featured: false,
    },
    // Art & Crafts category
    {
      name: "Professional Drawing Set",
      description:
        "Complete set of professional-grade drawing supplies including pencils, charcoal, and sketch pads.",
      price: 79.99,
      imageUrl:
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80",
      category: "Art & Crafts",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.7,
      numReviews: 68,
      featured: false,
    },
    {
      name: "Pottery Wheel Starter Kit",
      description:
        "Beginner-friendly pottery wheel with clay, tools, and instructional guide for home ceramics.",
      price: 129.99,
      imageUrl:
        "https://images.unsplash.com/photo-1565193298442-2373bcb29498?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Art & Crafts",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.5,
      numReviews: 47,
      featured: true,
    },
    // Office Supplies category
    {
      name: "Ergonomic Desk Organization Set",
      description:
        "Modular desk organization system with adjustable compartments for office supplies.",
      price: 49.99,
      imageUrl:
        "https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1489&q=80",
      category: "Office Supplies",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.4,
      numReviews: 56,
      featured: false,
    },
    {
      name: "Smart Notebook",
      description:
        "Reusable smart notebook that syncs written notes to cloud services and can be wiped clean.",
      price: 39.99,
      imageUrl:
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Office Supplies",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.6,
      numReviews: 89,
      featured: true,
    },
    // Baby & Kids category
    {
      name: "Educational Wooden Toy Set",
      description:
        "Set of wooden toys designed to develop fine motor skills and problem-solving abilities for toddlers.",
      price: 44.99,
      imageUrl:
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Baby & Kids",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.8,
      numReviews: 75,
      featured: true,
    },
    {
      name: "Children's Growth Chart",
      description:
        "Decorative wall-mounted growth chart for tracking children's height from birth to teen years.",
      price: 29.99,
      imageUrl:
        "https://images.unsplash.com/photo-1522771930-78848d9293e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80",
      category: "Baby & Kids",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.5,
      numReviews: 42,
      featured: false,
    },
    // Automotive category
    {
      name: "Car Cleaning Kit",
      description:
        "Complete car cleaning and detailing kit with premium microfiber cloths and eco-friendly solutions.",
      price: 59.99,
      imageUrl:
        "https://images.unsplash.com/photo-1607860108855-71e5d98csd46?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      category: "Automotive",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.6,
      numReviews: 64,
      featured: false,
    },
    {
      name: "Portable Car Jump Starter",
      description:
        "Compact car jump starter with built-in power bank and emergency LED flashlight.",
      price: 79.99,
      imageUrl:
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-1.2.1&auto=format&fit=crop&w=1334&q=80",
      category: "Automotive",
      stock: Math.floor(Math.random() * 90) + 10,
      rating: 4.7,
      numReviews: 83,
      featured: true,
    },
  ];

  return mockProducts;
};

/**
 * Map Fake Store API categories to our category system
 * @param {string} fakeStoreCategory - Category from Fake Store API
 * @returns {string} - Mapped category for our system
 */
const mapCategory = (fakeStoreCategory) => {
  // Convert to lowercase for consistent mapping
  const category = fakeStoreCategory.toLowerCase();

  // Define mapping for known categories
  const categoryMap = {
    electronics: "Electronics",
    jewelery: "Jewelry",
    "men's clothing": "Fashion",
    "women's clothing": "Fashion",
  };

  // Return mapped category or capitalize the original if no mapping exists
  return (
    categoryMap[category] ||
    category.charAt(0).toUpperCase() + category.slice(1)
  );
};

/**
 * Map DummyJSON categories to our category system
 * @param {string} dummyCategory - Category from DummyJSON API
 * @returns {string} - Mapped category for our system
 */
const mapDummyJsonCategory = (dummyCategory) => {
  // Convert to lowercase for consistent mapping
  const category = dummyCategory.toLowerCase();

  // Define mapping for known categories
  const categoryMap = {
    smartphones: "Electronics",
    laptops: "Electronics",
    fragrances: "Beauty & Personal Care",
    skincare: "Beauty & Personal Care",
    groceries: "Food & Beverages",
    "home-decoration": "Home & Garden",
    furniture: "Furniture",
    tops: "Fashion",
    "womens-dresses": "Fashion",
    "womens-shoes": "Footwear",
    "mens-shirts": "Fashion",
    "mens-shoes": "Footwear",
    "mens-watches": "Accessories",
    "womens-watches": "Accessories",
    "womens-bags": "Accessories",
    "womens-jewellery": "Jewelry",
    sunglasses: "Accessories",
    automotive: "Automotive",
    motorcycle: "Automotive",
    lighting: "Home & Garden",
  };

  // Return mapped category or capitalize and format the original if no mapping exists
  return (
    categoryMap[category] ||
    category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};

module.exports = scrapeProductsFromFakeStoreAPI;