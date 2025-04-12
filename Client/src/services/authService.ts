import api from "./api";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
  lastLogin?: string;
  enable2FA?: boolean;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

// Register a new user
export const register = async (userData: RegisterData) => {
  try {
    const response = await api.post("/users/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      // Store complete user data
      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          isAdmin: response.data.isAdmin,
          createdAt: response.data.createdAt,
          lastLogin: response.data.lastLogin,
          phoneNumber: response.data.phoneNumber || "",
          address: response.data.address || {},
          enable2FA: response.data.enable2FA || false,
          notificationPreferences: response.data.notificationPreferences || {
            email: true,
            push: false,
            sms: false,
          },
        })
      );
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Login a user
export const login = async (credentials: LoginData) => {
  try {
    const response = await api.post("/users/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      // Store complete user data
      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          isAdmin: response.data.isAdmin,
          createdAt: response.data.createdAt,
          lastLogin: response.data.lastLogin,
          phoneNumber: response.data.phoneNumber || "",
          address: response.data.address || {},
          enable2FA: response.data.enable2FA || false,
          notificationPreferences: response.data.notificationPreferences || {
            email: true,
            push: false,
            sms: false,
          },
        })
      );

      // Dispatch storage event to notify other components about the login
      window.dispatchEvent(new Event("storage"));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout a user
export const logout = () => {
  // Get current user before we clear it
  const currentUser = getCurrentUser();

  // Standard logout clearing token and user data
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Dispatch storage event to notify other components about the logout
  window.dispatchEvent(new Event("storage"));

  // Optional: If you want to preserve the cart items when the user logs out
  // Copy the user's cart to the guest cart so items aren't lost
  if (currentUser && currentUser._id) {
    try {
      const userCartKey = `cart_${currentUser._id}`;
      const userCart = localStorage.getItem(userCartKey);

      if (userCart) {
        localStorage.setItem("guest_cart", userCart);
      }
    } catch (error) {
      console.error("Error preserving cart during logout:", error);
    }
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

// Get current user
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    // If there's an error parsing the JSON, clear the invalid data
    console.error("Error parsing user data:", error);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get("/users/profile");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData: Partial<User>) => {
  try {
    const response = await api.put("/users/profile", userData);

    // Handle the response structure correctly
    const updatedUser = response.data.user || response.data;

    // Update localStorage with complete user data
    localStorage.setItem("user", JSON.stringify(updatedUser));

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

// Update user password
export const updatePassword = async (passwords: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const response = await api.put("/users/profile/password", passwords);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Request password reset email with OTP
export const requestPasswordReset = async (email: string) => {
  try {
    const response = await api.post("/users/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify OTP code
export const verifyOTP = async (
  email: string,
  otp: string,
  purpose: "password-reset" | "2fa"
) => {
  try {
    const response = await api.post("/users/verify-otp", {
      email,
      otp,
      purpose,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset password with OTP verification
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
) => {
  try {
    const response = await api.post("/users/reset-password", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Request 2FA OTP
export const request2FAOTP = async () => {
  try {
    const response = await api.post("/users/send-2fa");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify 2FA OTP and complete login
export const verify2FA = async (email: string, otp: string) => {
  try {
    const response = await api.post("/users/verify-2fa", {
      email,
      otp,
    });

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};
