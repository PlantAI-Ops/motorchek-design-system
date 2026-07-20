import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { loginApi, setToken, clearToken, getToken, type Token } from "@/lib/api/auth";

export type UserRole = "admin" | "supervisor" | "technician";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarInitials: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => ({ success: false }),
  logout: () => {},
});

interface StoredAuth {
  user: User;
  token: string;
}

function parseUserFromToken(_token: string): User | null {
  return null;
}

function parseUserFromStoredAuth(stored: StoredAuth): User | null {
  if (!stored.user) return null;
  const role: UserRole =
    stored.user.role === "admin" || stored.user.role === "supervisor" || stored.user.role === "technician"
      ? stored.user.role
      : "technician";
  return { ...stored.user, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("motorchek-auth");
    if (saved) {
      try {
        const stored: StoredAuth = JSON.parse(saved);
        if (stored.user && stored.token) {
          return parseUserFromStoredAuth(stored);
        }
      } catch {
        // ignore
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const token = await loginApi({ email, password });
      setToken(token);

      const stored: StoredAuth = {
        user: {
          id: "me",
          email,
          name: email.split("@")[0],
          role: "technician" as UserRole,
          avatarInitials: email.slice(0, 2).toUpperCase(),
        },
        token: token.access_token,
      };
      localStorage.setItem("motorchek-auth", JSON.stringify(stored));
      setUser(stored.user);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: err instanceof Error ? err.message : "Login failed" };
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem("motorchek-auth");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function getStoredToken(): string | null {
  return getToken();
}