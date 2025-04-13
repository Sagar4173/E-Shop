import api from "./api";

// Get all users (admin only)
export const getUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user by ID (admin only)
export const getUserById = async (id: string) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user role (admin only)
export const updateUserRole = async (id: string, isAdmin: boolean) => {
  try {
    const response = await api.put(`/users/${id}/role`, { isAdmin });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete user (admin only)
export const deleteUser = async (id: string) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user orders by user ID (admin only)
export const getUserOrdersById = async (id: string) => {
  try {
    const response = await api.get(`/users/${id}/orders`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user details (admin or user themselves)
export const updateUser = async (id: string, userData: any) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
