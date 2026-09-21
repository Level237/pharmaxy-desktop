// src/components/PinLogin.tsx
import { useState, useEffect, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, UserCheck, Delete, Loader2 } from "lucide-react";
import { getPharmacyInfo } from "../db/pharmacyQueries";
import { verifyUserPin } from "../db/userQueries";
import logo2 from "../assets/logo.png";

// ---------------------------------------------------------------------------
// Hooks personnalisés (Séparation des responsabilités)
// ---------------------------------------------------------------------------

function usePharmacyData() {
  const [pharmacyName, setPharmacyName] = useState("Pharmaxy");
  
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const info = await getPharmacyInfo();
        if (!ignore && info && info.length > 0) {
          setPharmacyName(info[0].name);
        }
      } catch (err) {
        console.error("Erreur de chargement de la pharmacie", err);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  return pharmacyName;
}

// ---------------------------------------------------------------------------
// Composant Principal
// ---------------------------------------------------------------------------

export default function PinLogin() {
  const navigate = useNavigate();
  const pharmacyName = usePharmacyData();
  
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  
  // React 19: Utilisation de useTransition avec support des promesses (Async Transitions)
  // Remplace avantageusement les états manuels "isLoading" et empêche le blocage de l'UI
  const [isPending, startTransition] = useTransition();

  const triggerError = (msg: string) => {
    setPin("");
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const submitPin = (enteredPin: string) => {
    startTransition(async () => {
      setError(null);
      try {
        const user = await verifyUserPin(enteredPin);
        if (user) {
          sessionStorage.setItem("currentUser", JSON.stringify(user));
          // Léger délai purement UX pour montrer l'état de succès/chargement
          await new Promise(r => setTimeout(r, 400)); 
          navigate("/dashboard");
        } else {
          triggerError("Code PIN incorrect.");
        }
      } catch (err) {
        console.error(err);
        triggerError("Erreur de vérification.");
      }
    });
  };

  const handleKeyPress = (num: string) => {
    if (isPending || pin.length >= 4) return;
    
    setError(null);
    const newPin = pin + num;
    setPin(newPin);
    
    // Remplacement du useEffect de synchronisation par une réaction directe (Best Practice)
    if (newPin.length === 4) {
      submitPin(newPin);
    }
  };

  const handleBackspace = () => {
    if (isPending || pin.length === 0) return;
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isPending || pin.length === 0) return;
    setError(null);
    setPin("");
  };

  return (
    <div className="min-h-[100dvh] bg-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Background Elements (Modern Glassmorphism subtle blobs) */}
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none" />

      {/* Top Actions (Back to Onboarding) */}
      <header className="w-full flex justify-end items-center p-6 sm:p-8 absolute top-0 right-0 z-20">
        <div className="text-sm font-medium text-slate-500 flex items-center gap-4">
          <span>Nouvelle installation ?</span>
          <button 
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 px-5 py-2.5 rounded-full font-bold shadow-sm border border-slate-200/60 transition-all active:scale-95"
          >
            Créer un compte
          </button>
        </div>
      </header>

      <main className="relative w-full max-w-[420px] flex flex-col items-center z-10 mt-12">
        
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative">
            <img src={logo2} alt="Logo Pharmaxy" className="h-36 object-contain drop-shadow-sm" />
            {isPending && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md border border-slate-100"
              >
                <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
              </motion.div>
            )}
          </div>
          
          <h1 className="text-slate-900 font-bold mt-6 text-2xl  uppercase">
            {pharmacyName}
          </h1>
          
          <div className="flex items-center gap-2 mt-3 bg-white border border-slate-200/60 shadow-sm px-3.5 py-1.5 rounded-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-slate-600 font-bold tracking-widest uppercase mt-px ml-1">Caisse Locale</span>
          </div>
        </motion.header>

        {/* PIN Pad Container */}
        <motion.section
          animate={shake ? { x: [-12, 12, -10, 10, -5, 5, 0] } : {}}
          transition={{ type: "spring", stiffness: 600, damping: 25 }}
          className="w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white/60 flex flex-col items-center relative"
        >
          <h2 className="text-slate-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-8">
            Saisir le Code PIN
          </h2>

          {/* PIN Indicators */}
          <div className="flex gap-5 mb-8" aria-label="Indicateurs de saisie">
            {[0, 1, 2, 3].map((index) => {
              const isActive = index < pin.length;
              return (
                <motion.div
                  key={index}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isActive ? "#0f172a" : "#f1f5f9",
                    borderColor: isActive ? "#0f172a" : "#e2e8f0"
                  }}
                  className={`h-4 w-4 rounded-full border-2 transition-all duration-300 ${
                    isPending && isActive ? "animate-pulse" : ""
                  }`}
                />
              );
            })}
          </div>

          {/* Error Message Space (Fixed Height to prevent layout shift) */}
          <div className="min-h-[48px] w-full flex items-center justify-center mb-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="flex items-center gap-2.5 text-red-600 text-xs bg-red-50/80 backdrop-blur-sm border border-red-100/80 px-4 py-2.5 rounded-2xl w-full justify-center"
                >
                  <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                disabled={isPending}
                className="h-16 sm:h-18 bg-white hover:bg-slate-50 active:bg-slate-100 active:scale-95 border border-slate-200/70 text-slate-800 font-semibold text-2xl rounded-2xl sm:rounded-[1.25rem] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:active:scale-100 shadow-sm hover:shadow"
                aria-label={`Chiffre ${num}`}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              disabled={isPending || pin.length === 0}
              className="h-16 sm:h-18 bg-slate-50 hover:bg-red-50 active:scale-95 border border-slate-200/70 text-slate-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest rounded-2xl sm:rounded-[1.25rem] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:active:scale-100"
              aria-label="Tout effacer"
            >
              Effacer
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              disabled={isPending}
              className="h-16 sm:h-18 bg-white hover:bg-slate-50 active:bg-slate-100 active:scale-95 border border-slate-200/70 text-slate-800 font-semibold text-2xl rounded-2xl sm:rounded-[1.25rem] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:active:scale-100 shadow-sm hover:shadow"
              aria-label="Chiffre 0"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              disabled={isPending || pin.length === 0}
              className="h-16 sm:h-18 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200/70 text-slate-500 hover:text-slate-800 rounded-2xl sm:rounded-[1.25rem] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:active:scale-100"
              aria-label="Effacer le dernier chiffre"
            >
              <Delete className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-8 flex items-center gap-2.5 text-slate-400/80 text-[11px] font-medium tracking-wide"
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>Accès sécurisé Pharmaxy OS.</span>
        </motion.footer>
      </main>
    </div>
  );
}
