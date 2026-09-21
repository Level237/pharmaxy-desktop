import React from "react";
import logo from "../../../assets/logo.png";
import onboardingBg from "../../../assets/onboarding.jpg";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      {/* Colonne Gauche - Présentation (Image de fond) */}
      <div 
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between p-12 overflow-hidden selection:bg-[#2720ff]/30"
      >
        {/* Image Background */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${onboardingBg})` }}
        />
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-900/95 via-slate-900/50 to-slate-900/10 mix-blend-multiply" />
        
        {/* Subtle color tint based on primary color */}
        <div className="absolute inset-0 z-0 bg-[#2720ff]/10 mix-blend-overlay" />

        {/* Content Top: Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-white/20">
            <img src={logo} alt="Pharmaxy" className="h-9 w-auto object-contain" />
          </div>
          <span className="font-bold text-2xl  text-white drop-shadow-md">Pharmaxy</span>
        </div>

        {/* Content Bottom: Text positioned at bottom to reveal the image */}
        <div className="relative z-10 mt-auto pt-24 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl xl:text-5xl font-bold leading-[1.15] mb-5  text-white drop-shadow-lg">
              L'excellence <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">officinale</span> <br />
              à portée de main.
            </h1>
            <p className="text-white/80 text-lg font-medium leading-relaxed max-w-md drop-shadow-md">
              Gérez vos stocks, optimisez vos ventes et restez conforme avec une plateforme conçue pour les pharmacies d'aujourd'hui.
            </p>
          </motion.div>
        </div>

        {/* Content Footer */}
        <div className="relative z-10 text-white/50 text-[10px] font-bold uppercase tracking-widest flex justify-between items-center border-t border-white/10 pt-6">
          <span>Pharmaxy OS v2.0</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Colonne Droite - Formulaire (Scrollable) */}
      <div className="flex-1 flex flex-col relative h-[100dvh] overflow-y-auto overflow-x-hidden selection:bg-[#2720ff]/30">
        
        {/* Top Actions (Login Link) */}
        <header className="w-full flex justify-end items-center p-6 sm:p-8 absolute top-0 right-0 z-20">
          <div className="text-sm font-medium text-slate-500 flex items-center gap-4">
            <span>Déjà configuré ?</span>
            <Link 
              to="/login" 
              className="group flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 px-5 py-2.5 rounded-full font-bold shadow-sm border border-slate-200/60 transition-all active:scale-95 hover:border-[#2720ff]/30"
            >
              Se connecter
              <ArrowRight className="h-4 w-4 text-[#2720ff] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </header>

        {/* Form Content Area */}
        <main className="flex-1 flex flex-col justify-center items-center w-full px-6 py-24 sm:px-12 max-w-3xl mx-auto">
          <div className="w-full max-w-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
