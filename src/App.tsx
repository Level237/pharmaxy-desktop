// src/App.tsx
import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Onboarding } from "./features/onboarding";

import { DashboardPage } from "./features/dashboard";
import { PosPage } from "./features/pos";
import { checkIfRegistered } from "./db/pharmacyQueries";

import { initializeAppDatabase } from "./db/initializeDatabase";
import PinLogin from "./components/PinLogin";

// 1. Gardien Global (Initialisation et Protection)
function GlobalGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState("Vérification du système...");

  useEffect(() => {
    async function init() {
      try {
        // 1. Toujours initialiser la base (idempotent)
        setStatus("Initialisation de la base de données...");
        await initializeAppDatabase();

        // 2. Vérifier l'enregistrement
        const isRegistered = await checkIfRegistered();

        // 3. Logique de redirection
        if (!isRegistered && location.pathname !== "/onboarding") {
          navigate("/onboarding", { replace: true });
        } else if (isRegistered && (location.pathname === "/" || location.pathname === "/onboarding")) {
          navigate("/login", { replace: true });
        } else {
          setIsReady(true);
        }
      } catch (error) {
        console.error("Erreur d'initialisation:", error);
        setStatus("Erreur critique lors de l'accès à la base de données.");
      }
    }

    init();
  }, [navigate, location.pathname]);

  if (!isReady) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center text-slate-900 font-sans relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="h-12 w-12 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-6" />
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase mb-2">PHARMAXY</h1>
          <p className="text-slate-500 text-sm font-medium tracking-tight">{status}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// 2. Composant Racine de l'application
function App() {
  return (
    <HashRouter>
      <GlobalGuard>
        <Routes>
          <Route path="/" element={<div>Redirection...</div>} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<PinLogin />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pos" element={<PosPage />} />
        </Routes>
      </GlobalGuard>
    </HashRouter>
  );
}

export default App;