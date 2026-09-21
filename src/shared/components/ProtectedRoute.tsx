// src/shared/components/ProtectedRoute.tsx
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F5FA] flex flex-col items-center justify-center font-sans">
        <div className="h-10 w-10 border-4 border-[#2720ff]/20 border-t-[#2720ff] rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-xs font-bold">Vérification de session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirection immédiate vers le clavier de connexion PIN
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
