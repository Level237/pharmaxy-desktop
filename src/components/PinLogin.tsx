// src/components/PinLogin.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Wifi, UserCheck, Delete } from "lucide-react";
import { getPharmacyInfo } from "../db/pharmacyQueries";
import { verifyUserPin } from "../db/userQueries";
import logo2 from "../assets/logo-2.png";

export default function PinLogin() {
  const navigate = useNavigate();
  const [pharmacyName, setPharmacyName] = useState("Pharmaxy");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadPharmacy() {
      try {
        const info = await getPharmacyInfo();
        if (info && info.length > 0) {
          setPharmacyName(info[0].name);
        }
      } catch (err) {
        console.error("Erreur de chargement de la pharmacie", err);
      }
    }
    loadPharmacy();
  }, []);

  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit(pin);
    }
  }, [pin]);

  const handleKeyPress = (num: string) => {
    setError("");
    if (pin.length < 4) {
      setPin((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setError("");
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError("");
    setPin("");
  };

  const handlePinSubmit = async (enteredPin: string) => {
    setIsLoading(true);
    setError("");
    try {
      const user = await verifyUserPin(enteredPin);
      
      if (user) {
        sessionStorage.setItem("currentUser", JSON.stringify(user));
        setTimeout(() => {
          setIsLoading(false);
          navigate("/dashboard");
        }, 600);
      } else {
        setIsLoading(false);
        setPin("");
        setError("Code PIN incorrect.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la vérification du code PIN.");
      setIsLoading(false);
      setPin("");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f9fafb] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Subtle Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/[0.02] blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[400px] flex flex-col items-center">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <img src={logo2} alt="Logo" className="h-14 object-contain" />
          <h2 className="text-slate-900 font-black mt-4 text-2xl tracking-tighter uppercase">
            {pharmacyName}
          </h2>
          <div className="flex items-center gap-2 mt-2 bg-slate-100 border border-slate-200/50 px-3 py-1 rounded-full">
            <Wifi className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[10px] text-slate-600 font-bold tracking-widest uppercase">Caisse Locale</span>
          </div>
        </motion.div>

        {/* PIN Pad Container - Liquid Glass */}
        <motion.div 
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-full bg-white rounded-[2.5rem] p-8 diffusion-shadow border border-slate-200/50 flex flex-col items-center relative z-10"
        >
          <span className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
            Saisir le Code PIN Caisse
          </span>

          {/* Indicators */}
          <div className="flex gap-5 mb-8">
            {[0, 1, 2, 3].map((index) => (
              <motion.div 
                key={index} 
                initial={false}
                animate={{
                  scale: index < pin.length ? 1.2 : 1,
                  backgroundColor: index < pin.length ? "#0f172a" : "rgba(15, 23, 42, 0.05)",
                  borderColor: index < pin.length ? "#0f172a" : "rgba(15, 23, 42, 0.1)"
                }}
                className="h-4 w-4 rounded-full border transition-all duration-300"
              />
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 px-4 py-2 rounded-xl mb-6 w-full justify-center overflow-hidden"
              >
                <ShieldAlert className="h-4 w-4" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-4 w-full">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                disabled={isLoading}
                className="h-16 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200/50 text-slate-900 font-bold text-xl rounded-2xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {num}
              </button>
            ))}

            <button
              onClick={handleClear}
              disabled={isLoading || pin.length === 0}
              className="h-16 bg-white hover:bg-red-50 active:scale-95 border border-slate-200/50 text-slate-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              Effacer
            </button>

            <button
              onClick={() => handleKeyPress("0")}
              disabled={isLoading}
              className="h-16 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200/50 text-slate-900 font-bold text-xl rounded-2xl transition-all flex items-center justify-center cursor-pointer"
            >
              0
            </button>

            <button
              onClick={handleBackspace}
              disabled={isLoading || pin.length === 0}
              className="h-16 bg-white hover:bg-slate-100 active:scale-95 border border-slate-200/50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              <Delete className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center gap-2 text-slate-400 text-[10px] font-medium tracking-wide"
        >
          <UserCheck className="h-3 w-3" />
          <span>Accès réservé aux employés Pharmaxy habilités.</span>
        </motion.div>
      </div>
    </div>
  );
}
