import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

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
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const MOCK_USERS: Record<string, { password: string; user: User; token: string }> = {
  "admin@motorchek.io": {
    password: "admin123",
    user: { id: "u1", email: "admin@motorchek.io", name: "John Doe", role: "admin", avatarInitials: "JD" },
    token: "mock-jwt-admin",
  },
  "supervisor@motorchek.io": {
    password: "super123",
    user: { id: "u2", email: "supervisor@motorchek.io", name: "Sarah Chen", role: "supervisor", avatarInitials: "SC" },
    token: "mock-jwt-supervisor",
  },
  "tech@motorchek.io": {
    password: "tech123",
    user: { id: "u3", email: "tech@motorchek.io", name: "Mike Rivera", role: "technician", avatarInitials: "MR" },
    token: "mock-jwt-technician",
  },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("motorchek-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("motorchek-user-token");
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    const entry = MOCK_USERS[email.toLowerCase()];
    if (!entry || entry.password !== password) {
      setIsLoading(false);
      return { success: false, error: "Invalid email or password" };
    }
    setUser(entry.user);
    setToken(entry.token);
    localStorage.setItem("motorchek-user", JSON.stringify(entry.user));
    localStorage.setItem("motorchek-user-token", entry.token);
    setIsLoading(false);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("motorchek-user");
    localStorage.removeItem("motorchek-user-token");
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
