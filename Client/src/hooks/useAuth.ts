import { useState, useEffect, useCallback } from "react";
import {
  getCurrentUser,
  isAuthenticated,
  logout as authLogout,
} from "../services/authService";
import { User } from "../types";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
}

/**
 * Custom hook for authentication state management
 * Provides user info and auth utilities throughout the app
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoggedIn: false,
    isAdmin: false,
    loading: true,
  });

  const checkAuth = useCallback(() => {
    const loggedIn = isAuthenticated();
    const user = loggedIn ? getCurrentUser() : null;

    setAuthState({
      user,
      isLoggedIn: loggedIn,
      isAdmin: user?.isAdmin || false,
      loading: false,
    });
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token" || event.key === "user") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [checkAuth]);

  const logout = useCallback(() => {
    authLogout();
    setAuthState({
      user: null,
      isLoggedIn: false,
      isAdmin: false,
      loading: false,
    });
  }, []);

  const refreshAuth = useCallback(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    logout,
    refreshAuth,
  };
};

export default useAuth;
