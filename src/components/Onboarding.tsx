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
  Settings
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

  // Navigation entre les étapes
  const nextStep = () => {
    setError("");
    if (currentStep === 1) {
      // Valider étape pharmacie
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

  // Soumission finale et enregistrement en Base locale
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
    // Slide 1: Présentation de Pharmaxy (Style Blanc Moderne)
    {
      title: "Bienvenue sur Pharmaxy",
      subtitle: "La solution de gestion officinale ultra-moderne conçue pour le Cameroun.",
      content: (
        <div className="space-y-6 my-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <motion.img
              src={logo}
              alt="Pharmaxy Logo"
              className="h-36 md:h-44 object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            />

          </div>

          <div className="grid grid-cols-1 gap-4">
            <motion.div
              className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#67dcff]/40 hover:bg-white hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300"
              whileHover={{ y: -2 }}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="p-3 bg-[#67dcff]/10 rounded-xl text-[#587dff]">
                <WifiOff className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-slate-800 text-base">Fonctionnement Hors-Ligne (Offline-First)</h4>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  Pas d'Internet ? Aucun problème. L'application encaisse, gère les stocks et fonctionne à 100% sur votre machine.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#587dff]/40 hover:bg-white hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300"
              whileHover={{ y: -2 }}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-3 bg-[#587dff]/10 rounded-xl text-[#2720ff]">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-slate-800 text-base">Règle FEFO & Traçabilité des Lots</h4>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  Les médicaments expirant en premier sont vendus en priorité. Réduisez vos pertes de produits périmés automatiquement.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#2720ff]/30 hover:bg-white hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300"
              whileHover={{ y: -2 }}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="p-3 bg-[#2720ff]/10 rounded-xl text-[#2720ff]">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-slate-800 text-base">Régulation Camerounaise MINSANTE</h4>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  Gestion intégrée de votre numéro d'agrément, recherche par DCI et monnaie locale en FCFA sans dérive financière.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )
    },
    // Slide 2: Enregistrement Pharmacie (Spacieux & Lumineux)
    {
      title: "Identité de votre Officine",
      subtitle: "Ces informations apparaîtront sur vos tickets de caisse et rapports officiels.",
      content: (
        <div className="space-y-6 md:space-y-8 my-8 text-left">
          {/* Nom Pharmacie */}
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2 tracking-wide">
              Nom de la Pharmacie <span className="text-[#2720ff]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Settings className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                placeholder="Ex: Pharmacie du Centre"
                value={pharmacyData.name}
                onChange={(e) => setPharmacyData({ ...pharmacyData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#587dff] focus:ring-4 focus:ring-[#587dff]/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Grid Adresse et Téléphone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-2 tracking-wide">
                Adresse Physique <span className="text-[#2720ff]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <MapPin className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rue Mongosso, Yaoundé"
                  value={pharmacyData.address}
                  onChange={(e) => setPharmacyData({ ...pharmacyData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#587dff] focus:ring-4 focus:ring-[#587dff]/10 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-bold mb-2 tracking-wide">
                Numéro de Téléphone
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Phone className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  placeholder="Ex: +237 690 000 000"
                  value={pharmacyData.phone}
                  onChange={(e) => setPharmacyData({ ...pharmacyData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#587dff] focus:ring-4 focus:ring-[#587dff]/10 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Propriétaire */}
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2 tracking-wide">
              Nom du Pharmacien Titulaire (Propriétaire) <span className="text-[#2720ff]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                placeholder="Ex: Dr. Nkoulou"
                value={pharmacyData.ownerName}
                onChange={(e) => setPharmacyData({ ...pharmacyData, ownerName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#587dff] focus:ring-4 focus:ring-[#587dff]/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Agrément MINSANTE */}
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2 tracking-wide">
              Numéro d'Agrément MINSANTE <span className="text-[#2720ff]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <FileText className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                placeholder="Ex: MSP-2023-AGR-8947"
                value={pharmacyData.licenseNumber}
                onChange={(e) => setPharmacyData({ ...pharmacyData, licenseNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#587dff] focus:ring-4 focus:ring-[#587dff]/10 transition-all font-medium font-mono"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Ce numéro certifie la légitimité réglementaire de votre établissement au Cameroun.</p>
          </div>
        </div>
      )
    },
    // Slide 3: Création Admin (Spacieux & Lumineux)
    {
      title: "Créer le compte Administrateur",
      subtitle: "Configurez l'accès principal pour la gestion de votre pharmacie.",
      content: (
        <div className="space-y-6 md:space-y-8 my-8 text-left">
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2 tracking-wide">
              Nom Complet du Gérant <span className="text-[#2720ff]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                placeholder="Ex: Jean Pierre"
                value={adminData.name}
                onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#587dff] focus:ring-4 focus:ring-[#587dff]/10 transition-all font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-2 tracking-wide">
                Code PIN (4 chiffres) <span className="text-[#2720ff]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <KeyRound className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  maxLength={4}
                  pattern="\d*"
                  required
                  placeholder="xxxx"
                  value={adminData.pinCode}
                  onChange={(e) => setAdminData({ ...adminData, pinCode: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 text-center font-mono tracking-widest placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#587dff] focus:ring-4 focus:ring-[#587dff]/10 transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-bold mb-2 tracking-wide">
                Confirmer le Code PIN <span className="text-[#2720ff]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <KeyRound className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  maxLength={4}
                  pattern="\d*"
                  required
                  placeholder="xxxx"
                  value={adminData.confirmPinCode}
                  onChange={(e) => setAdminData({ ...adminData, confirmPinCode: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 text-center font-mono tracking-widest placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#587dff] focus:ring-4 focus:ring-[#587dff]/10 transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200/80 text-amber-800 rounded-2xl flex items-start gap-3 mt-4">
            <span className="text-base">⚠️</span>
            <p className="text-xs font-semibold leading-relaxed text-amber-900/90">
              Retenez bien ce code PIN. Il sera indispensable pour déverrouiller la caisse Pharmaxy à chaque ouverture.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans">
      {/* Glows d'ambiance de marque à opacité faible pour le thème blanc */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#587dff]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#67dcff]/80 opacity-10 blur-[120px] pointer-events-none" />

      {/* Main Container - Card Blanche Spacieuse */}
      <div className="relative w-full max-w-2xl bg-white border border-slate-100 rounded-3xl shadow-[0_24px_70px_-12px_rgba(39,32,255,0.06)] p-6 md:p-12 flex flex-col min-h-[620px] justify-between transition-all duration-300">

        {/* Progress Bar avec gradients d'accent */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8 overflow-hidden flex">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-full flex-1 transition-all duration-500 ${index <= currentStep
                ? "bg-gradient-to-r from-[#67dcff] to-[#587dff]"
                : "bg-transparent"
                }`}
            />
          ))}
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="text-center"
            >
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {steps[currentStep].title}
              </h2>
              <p className="text-slate-500 text-sm md:text-base mt-2 font-medium leading-relaxed max-w-lg mx-auto">
                {steps[currentStep].subtitle}
              </p>

              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-semibold mb-6 text-center shadow-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Navigation Actions */}
        <div className="flex gap-4 border-t border-slate-100 pt-8 mt-6">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-bold py-3.5 px-6 rounded-2xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <ChevronLeft className="h-5 w-5" />
              Retour
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex-1 flex items-center justify-center gap-2 bg-[#2720ff] hover:bg-[#587dff] cursor-pointer hover:shadow-lg hover:shadow-[#587dff]/20 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-2xl transition-all text-sm"
            >
              Continuer
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-[#2720ff] hover:opacity-95 cursor-pointer hover:shadow-lg hover:shadow-[#587dff]/25 active:scale-[0.98] text-white font-extrabold py-3.5 px-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? "Initialisation de la caisse..." : "Finaliser l'installation"}

            </button>
          )}
        </div>
      </div>
    </div>
  );
}
