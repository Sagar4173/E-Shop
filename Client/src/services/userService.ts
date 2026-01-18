import api from "./api";
import { User } from "../types";

// Admin user interface with additional fields
interface AdminUser extends User {
  orders?: number;
  totalSpent?: number;
}

// Get all users (admin only)
export const getUsers = async (): Promise<AdminUser[]> => {
  const response = await api.get("/users");
  return response.data;
};

// Get user by ID (admin only)
export const getUserById = async (id: string): Promise<AdminUser> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Update user role (admin only)
export const updateUserRole = async (
  id: string,
  isAdmin: boolean,
): Promise<AdminUser> => {
  const response = await api.put(`/users/${id}/role`, { isAdmin });
  return response.data;
};

// Delete user (admin only)
export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Get user orders by user ID (admin only)
export const getUserOrdersById = async (id: string) => {
  const response = await api.get(`/users/${id}/orders`);
  return response.data;
};

// User update data interface
interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  isAdmin?: boolean;
}

// Update user details (admin or user themselves)
export const updateUser = async (
  id: string,
  userData: UserUpdateData,
): Promise<AdminUser> => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};
