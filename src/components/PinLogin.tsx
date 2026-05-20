// src/components/PinLogin.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

  // Charger le nom de la pharmacie au chargement
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

  // Déclencher la vérification automatique dès que 4 chiffres sont saisis
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
        // Enregistrer l'utilisateur connecté dans la session locale si nécessaire
        sessionStorage.setItem("currentUser", JSON.stringify(user));
        
        // Redirection vers le dashboard
        setTimeout(() => {
          setIsLoading(false);
          navigate("/dashboard");
        }, 600);
      } else {
        // Code PIN incorrect
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
    <div className="min-h-screen bg-[#060814] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Glows décoratifs */}
      <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-[#587dff]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-[#67dcff]/5 blur-[120px] pointer-events-none" />

      {/* Container Principal */}
      <div className="relative w-full max-w-sm flex flex-col items-center">
        
        {/* En-tête : Logo & Nom de la Pharmacie */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo2} alt="Logo" className="h-12 object-contain drop-shadow-[0_0_12px_rgba(103,220,255,0.2)]" />
          <h2 className="text-[#67dcff] font-bold mt-3 text-lg tracking-wide uppercase">
            {pharmacyName}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Caisse Locale</span>
          </div>
        </div>

        {/* Cadran d'affichage du Code PIN */}
        <motion.div 
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl flex flex-col items-center"
        >
          <span className="text-gray-400 text-xs font-semibold tracking-wider uppercase mb-4">
            Saisir le Code PIN Caisse
          </span>

          {/* Ronds indicateurs */}
          <div className="flex gap-4 mb-6">
            {[0, 1, 2, 3].map((index) => (
              <div 
                key={index} 
                className={`h-4 w-4 rounded-full border transition-all duration-200 ${
                  index < pin.length 
                    ? "bg-gradient-to-r from-[#67dcff] to-[#587dff] border-transparent shadow-[0_0_10px_rgba(103,220,255,0.6)] scale-110" 
                    : "border-white/20 bg-transparent"
                }`}
              />
            ))}
          </div>

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-1.5 text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg mb-4 w-full justify-center">
              <ShieldAlert className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Pavé Numérique */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                disabled={isLoading}
                className="h-14 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 hover:border-white/10 text-white font-bold text-xl rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {num}
              </button>
            ))}

            {/* Bouton Effacer */}
            <button
              onClick={handleClear}
              disabled={isLoading || pin.length === 0}
              className="h-14 bg-white/[0.02] hover:bg-red-500/10 active:scale-95 border border-white/5 text-gray-400 hover:text-red-400 text-sm font-semibold rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              Effacer
            </button>

            {/* Touche 0 */}
            <button
              onClick={() => handleKeyPress("0")}
              disabled={isLoading}
              className="h-14 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 text-white font-bold text-xl rounded-xl transition-all flex items-center justify-center cursor-pointer"
            >
              0
            </button>

            {/* Touche Retour/Backspace */}
            <button
              onClick={handleBackspace}
              disabled={isLoading || pin.length === 0}
              className="h-14 bg-white/[0.02] hover:bg-white/10 active:scale-95 border border-white/5 text-gray-400 hover:text-white rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              <Delete className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Bas de page sécurité */}
        <p className="text-gray-600 text-[10px] text-center mt-6 flex items-center gap-1">
          <UserCheck className="h-3 w-3" />
          Accès réservé aux employés Pharmaxy habilités.
        </p>
      </div>
    </div>
  );
}
