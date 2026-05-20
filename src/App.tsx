// src/App.tsx
import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import Onboarding from "./components/Onboarding";
import PinLogin from "./components/PinLogin";
import Dashboard from "./components/Dashboard";
import { checkIfRegistered } from "./db/pharmacyQueries";
import { initializeAppDatabase } from "./db/initializeDatabase";

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
    <div className="min-h-screen bg-[#060814] flex flex-col items-center justify-center text-white font-sans relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#2720ff]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#67dcff]/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-t-transparent border-r-[#67dcff] border-b-[#587dff] border-l-[#2720ff] rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(103,220,255,0.2)]" />
        <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-[#67dcff] via-[#587dff] to-[#2720ff] bg-clip-text text-transparent uppercase mb-2">PHARMAXY</h1>
        <p className="text-gray-400 text-xs font-medium tracking-wide">{status}</p>
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
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  );
}

export default App;