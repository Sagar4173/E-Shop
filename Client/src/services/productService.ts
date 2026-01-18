import api from "./api";
import { Product, Review, ProductFilters } from "../types";

// Product query parameters interface
interface ProductQueryParams extends Partial<ProductFilters> {
  limit?: number;
  page?: number;
  sort?: string;
}

// Get all products with optional filtering
export const getProducts = async (params?: ProductQueryParams): Promise<Product[]> => {
  const response = await api.get("/products", { params });
  return response.data;
};

// Get a single product by ID
export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Get featured products
export const getFeaturedProducts = async (
  limit?: number
): Promise<Product[]> => {
  const response = await api.get("/products/featured", {
    params: { limit },
  });
  return response.data;
};

// Get all product categories
export const getProductCategories = async (): Promise<string[]> => {
  const response = await api.get("/products/categories");
  return response.data;
};

// Create a new product (admin only)
export const createProduct = async (
  productData: Partial<Product>
): Promise<Product> => {
  const response = await api.post("/products", productData);
  return response.data;
};

// Update an existing product (admin only)
export const updateProduct = async (
  id: string,
  productData: Partial<Product>
): Promise<Product> => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Delete a product (admin only)
export const deleteProduct = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Get product reviews
export const getProductReviews = async (id: string): Promise<Review[]> => {
  const response = await api.get(`/products/${id}/reviews`);
  return response.data;
};

// Create product review
export const createProductReview = async (
  id: string,
  reviewData: { rating: number; comment: string }
): Promise<{ message: string }> => {
  const response = await api.post(`/products/${id}/reviews`, reviewData);
  return response.data;
};

// Delete product review
export const deleteProductReview = async (
  productId: string,
  reviewId: string
): Promise<{ message: string }> => {
  const response = await api.delete(
    `/products/${productId}/reviews/${reviewId}`
  );
  return response.data;
};
