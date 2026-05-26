// src/components/Onboarding.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  WifiOff,
  TrendingUp,
  CheckCircle,
  MapPin,
  Phone,
  User,
  FileText,
  KeyRound,
  ChevronRight,
  ChevronLeft,
  Settings,
  Sparkles
} from "lucide-react";
import { savePharmacyLocally } from "../db/pharmacyQueries";
import { saveUserLocally } from "../db/userQueries";
import logo from "../assets/logo.png";

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Formulaire Pharmacie
  const [pharmacyData, setPharmacyData] = useState({
    name: "",
    address: "",
    phone: "",
    ownerName: "",
    licenseNumber: "",
  });

  // Formulaire Utilisateur Admin
  const [adminData, setAdminData] = useState({
    name: "",
    pinCode: "",
    confirmPinCode: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => {
    setError("");
    if (currentStep === 1) {
      if (!pharmacyData.name || !pharmacyData.address || !pharmacyData.ownerName || !pharmacyData.licenseNumber) {
        setError("Veuillez remplir tous les champs obligatoires (le numéro d'agrément MINSANTE est requis).");
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => prev - 1);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!adminData.name) {
      setError("Veuillez entrer le nom de l'administrateur.");
      return;
    }
    if (adminData.pinCode.length !== 4 || !/^\d+$/.test(adminData.pinCode)) {
      setError("Le code PIN doit comporter exactement 4 chiffres.");
      return;
    }
    if (adminData.pinCode !== adminData.confirmPinCode) {
      setError("Les codes PIN ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);

    try {
      const pharmacyUuid = crypto.randomUUID();
      const adminUuid = crypto.randomUUID();
      const apiToken = `pharmaxy_tok_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

      await savePharmacyLocally({
        uuid: pharmacyUuid,
        name: pharmacyData.name,
        address: pharmacyData.address,
        phone: pharmacyData.phone,
        owner_name: pharmacyData.ownerName,
        license_number: pharmacyData.licenseNumber,
        api_token: apiToken,
      });

      await saveUserLocally({
        uuid: adminUuid,
        name: adminData.name,
        pin_code: adminData.pinCode,
        role: "admin",
      });

      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de l'initialisation de la base de données.");
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Bienvenue sur Pharmaxy",
      subtitle: "La solution de gestion officinale conçue pour l'excellence opérationnelle.",
      content: (
        <div className="space-y-6 my-10">
          <div className="flex flex-col items-center justify-center mb-10">
            <motion.img
              src={logo}
              alt="Pharmaxy Logo"
              className="h-32 md:h-40 object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            />
          </div>

          <div className="grid grid-cols-1 gap-5">
            {[
              {
                icon: WifiOff,
                title: "Offline-First",
                desc: "L'application encaisse et gère les stocks à 100% sur votre machine, sans Internet.",
                color: "blue"
              },
              {
                icon: TrendingUp,
                title: "Règle FEFO",
                desc: "Réduction automatique des pertes grâce à une gestion intelligente des lots et dates d'expiration.",
                color: "emerald"
              },
              {
                icon: CheckCircle,
                title: "Conformité MINSANTE",
                desc: "Gestion réglementaire intégrée, recherche par DCI et monnaie locale FCFA.",
                color: "slate"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-5 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/40 group"
              >
                <div className={`p-4 bg-${feature.color}-500/10 rounded-2xl text-${feature.color}-600 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-slate-900 text-lg tracking-tight">{feature.title}</h4>
                  <p className="text-slate-500 text-sm mt-1 leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Identité de l'Officine",
      subtitle: "Ces informations apparaîtront sur vos tickets de caisse et rapports officiels.",
      content: (
        <div className="space-y-8 my-10 text-left">
          <div className="group">
            <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ml-1">
              Nom de la Pharmacie
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400">
                <Settings className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                placeholder="Ex: Pharmacie de l'Espoir"
                value={pharmacyData.name}
                onChange={(e) => setPharmacyData({ ...pharmacyData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl py-4 pl-14 pr-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-bold text-lg tracking-tight"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ml-1">
                Adresse Physique
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400">
                  <MapPin className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ex: Akwa, Douala"
                  value={pharmacyData.address}
                  onChange={(e) => setPharmacyData({ ...pharmacyData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl py-4 pl-14 pr-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ml-1">
                Numéro de Téléphone
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400">
                  <Phone className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  placeholder="Ex: +237 600 000 000"
                  value={pharmacyData.phone}
                  onChange={(e) => setPharmacyData({ ...pharmacyData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl py-4 pl-14 pr-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ml-1">
                Pharmacien Titulaire
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Atangana"
                  value={pharmacyData.ownerName}
                  onChange={(e) => setPharmacyData({ ...pharmacyData, ownerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl py-4 pl-14 pr-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ml-1">
                Agrément MINSANTE
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400">
                  <FileText className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ex: MSP-2024-..."
                  value={pharmacyData.licenseNumber}
                  onChange={(e) => setPharmacyData({ ...pharmacyData, licenseNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl py-4 pl-14 pr-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Administrateur",
      subtitle: "Configurez l'accès principal pour la gestion de votre officine.",
      content: (
        <div className="space-y-8 my-10 text-left">
          <div>
            <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ml-1">
              Nom Complet du Gérant
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                placeholder="Ex: Emmanuel Macron"
                value={adminData.name}
                onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl py-4 pl-14 pr-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ml-1">
                Code PIN (4 chiffres)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400">
                  <KeyRound className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  maxLength={4}
                  pattern="\d*"
                  required
                  placeholder="••••"
                  value={adminData.pinCode}
                  onChange={(e) => setAdminData({ ...adminData, pinCode: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl py-4 pl-14 pr-6 text-slate-900 text-center font-mono tracking-[1em] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-black text-2xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ml-1">
                Confirmer le Code PIN
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400">
                  <KeyRound className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  maxLength={4}
                  pattern="\d*"
                  required
                  placeholder="••••"
                  value={adminData.confirmPinCode}
                  onChange={(e) => setAdminData({ ...adminData, confirmPinCode: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl py-4 pl-14 pr-6 text-slate-900 text-center font-mono tracking-[1em] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-black text-2xl"
                />
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-start gap-4"
          >
            <Sparkles className="h-6 w-6 text-blue-400 shrink-0" />
            <p className="text-xs font-medium leading-relaxed">
              Conservez précieusement ce code PIN. Il constitue votre clé unique pour déverrouiller la caisse Pharmaxy en toute sécurité.
            </p>
          </motion.div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-[#f9fafb] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/[0.02] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/[0.01] blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-3xl bg-white border border-slate-200/50 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] p-10 md:p-16 flex flex-col min-h-[700px] justify-between z-10">

        {/* Progress */}
        <div className="w-full flex gap-3 mb-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${index <= currentStep ? "bg-slate-900" : "bg-slate-100"}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                {steps[currentStep].title}
              </h2>
              <p className="text-slate-500 text-lg mt-3 font-medium leading-tight max-w-xl mx-auto">
                {steps[currentStep].subtitle}
              </p>

              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Errors */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-5 bg-red-50 border border-red-100 text-red-600 rounded-[1.5rem] text-sm font-bold mb-8 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-5 pt-10 border-t border-slate-100">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-400 text-slate-900 font-black px-8 py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 text-sm uppercase tracking-widest"
            >
              <ChevronLeft className="h-5 w-5" />
              Retour
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex-1 flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-5 rounded-[1.5rem] transition-all active:scale-[0.98] text-sm uppercase tracking-[0.2em]"
            >
              Continuer
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-5 rounded-[1.5rem] transition-all active:scale-[0.98] text-sm uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {isSubmitting ? "Initialisation..." : "Finaliser l'installation"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
