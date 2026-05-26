// src/App.tsx
import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import Onboarding from "./components/Onboarding";

import { DashboardPage } from "./features/dashboard";
import { PosPage } from "./features/pos";
import { checkIfRegistered } from "./db/pharmacyQueries";

import { initializeAppDatabase } from "./db/initializeDatabase";
import PinLogin from "./components/PinLogin";

// 1. Gardien de démarrage (Vérification et initialisation SQLite)
function StartupGuard() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Vérification du système...");

  useEffect(() => {
    async function checkSystem() {
      try {
        // Vérifier si la pharmacie est déjà enregistrée localement dans SQLite
        const isRegistered = await checkIfRegistered();

        if (isRegistered) {
          // Si enregistrée, on redirige vers l'écran du code PIN gérant/caissier
          navigate("/login", { replace: true });
        } else {
          // Si non enregistrée, on crée toutes les tables SQLite et index requis
          setStatus("Configuration de la base SQLite locale...");
          await initializeAppDatabase();

          // Puis on redirige vers l'onboarding de présentation
          setTimeout(() => {
            navigate("/onboarding", { replace: true });
          }, 800);
        }
      } catch (error) {
        console.error("Erreur de garde au démarrage:", error);
        setStatus("Erreur lors de l'accès à la base de données locale SQLite.");
      }
    }

    checkSystem();
  }, [navigate]);

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

// 2. Composant Racine de l'application avec configuration du Router
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<StartupGuard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<PinLogin />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pos" element={<PosPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;