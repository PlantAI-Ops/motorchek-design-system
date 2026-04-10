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
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "admin@motorchek.io": {
    password: "admin123",
    user: { id: "u1", email: "admin@motorchek.io", name: "John Doe", role: "admin", avatarInitials: "JD" },
  },
  "supervisor@motorchek.io": {
    password: "super123",
    user: { id: "u2", email: "supervisor@motorchek.io", name: "Sarah Chen", role: "supervisor", avatarInitials: "SC" },
  },
  "tech@motorchek.io": {
    password: "tech123",
    user: { id: "u3", email: "tech@motorchek.io", name: "Mike Rivera", role: "technician", avatarInitials: "MR" },
  },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
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
    localStorage.setItem("motorchek-user", JSON.stringify(entry.user));
    setIsLoading(false);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("motorchek-user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
