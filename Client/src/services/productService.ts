import api from "./api";
import { Product, Review } from "../types";

// Get all products with optional filtering
export const getProducts = async (params?: any): Promise<Product[]> => {
  try {
    const response = await api.get("/products", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Get a single product by ID
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

// Get featured products
export const getFeaturedProducts = async (
  limit?: number
): Promise<Product[]> => {
  try {
    const response = await api.get("/products/featured", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    throw error;
  }
};

// Get all product categories
export const getProductCategories = async (): Promise<string[]> => {
  try {
    const response = await api.get("/products/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching product categories:", error);
    throw error;
  }
};

// Create a new product (admin only)
export const createProduct = async (
  productData: Partial<Product>
): Promise<Product> => {
  try {
    const response = await api.post("/products", productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Update an existing product (admin only)
export const updateProduct = async (
  id: string,
  productData: Partial<Product>
): Promise<Product> => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

// Delete a product (admin only)
export const deleteProduct = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

// Get product reviews
export const getProductReviews = async (id: string): Promise<Review[]> => {
  try {
    const response = await api.get(`/products/${id}/reviews`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for product ${id}:`, error);
    throw error;
  }
};

// Create product review
export const createProductReview = async (
  id: string,
  reviewData: { rating: number; comment: string }
): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/products/${id}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error(`Error creating review for product ${id}:`, error);
    throw error;
  }
};

// Delete product review
export const deleteProductReview = async (
  productId: string,
  reviewId: string
): Promise<{ message: string }> => {
  try {
    const response = await api.delete(
      `/products/${productId}/reviews/${reviewId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting review ${reviewId} for product ${productId}:`,
      error
    );
    throw error;
  }
};
