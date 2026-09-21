// src/shared/context/AuthContext.tsx
import { createContext, use, useState, useEffect, ReactNode } from "react";
import { verifyUserPin, type User } from "../../db/userQueries";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithPin: (pin: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("currentUser");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Erreur de parsing ignorée
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithPin = async (pin: string): Promise<boolean> => {
    const verified = await verifyUserPin(pin);
    if (verified) {
      setUser(verified);
      sessionStorage.setItem("currentUser", JSON.stringify(verified));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("currentUser");
  };

  // React 19 : <AuthContext value={...}> direct au lieu de <AuthContext.Provider>
  return (
    <AuthContext
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithPin,
        logout
      }}
    >
      {children}
    </AuthContext>
  );
}

// Hook React 19 exploitant l'API use()
export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}
