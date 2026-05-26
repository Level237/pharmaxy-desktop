import { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { OnboardingLayout } from "./components/OnboardingLayout";
import { ProgressBar } from "./components/ProgressBar";
import { StepWelcome } from "./components/StepWelcome";
import { StepPharmacyInfo } from "./components/StepPharmacyInfo";
import { StepAdminInfo } from "./components/StepAdminInfo";
import { submitOnboardingAction } from "./actions/onboardingActions";
import type { PharmacyData, AdminData, OnboardingStep } from "./types";

export function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(0);
  const [error, setError] = useState("");

  const [pharmacyData, setPharmacyData] = useState<PharmacyData>({
    name: "",
    address: "",
    phone: "",
    ownerName: "",
    licenseNumber: "",
  });

  const [adminData, setAdminData] = useState<AdminData>({
    name: "",
    pinCode: "",
    confirmPinCode: "",
  });

  const [isPending, startTransition] = useTransition();

  const handleNext = () => {
    setError("");
    if (currentStep === 1) {
      if (!pharmacyData.name || !pharmacyData.address || !pharmacyData.ownerName || !pharmacyData.licenseNumber) {
        setError("Veuillez remplir tous les champs obligatoires.");
        return;
      }
    }
    setCurrentStep((prev) => (prev + 1) as OnboardingStep);
  };

  const handlePrev = () => {
    setError("");
    setCurrentStep((prev) => (prev - 1) as OnboardingStep);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!adminData.name) {
      setError("Veuillez entrer le nom de l'administrateur.");
      return;
    }
    if (adminData.pinCode.length !== 4) {
      setError("Le code PIN doit comporter exactement 4 chiffres.");
      return;
    }
    if (adminData.pinCode !== adminData.confirmPinCode) {
      setError("Les codes PIN ne correspondent pas.");
      return;
    }

    startTransition(async () => {
      try {
        await submitOnboardingAction(pharmacyData, adminData);
        navigate("/login");
      } catch (err) {
        console.error(err);
        setError("Une erreur est survenue lors de l'initialisation.");
      }
    });
  };

  return (
    <OnboardingLayout>
      <div className="pt-10">
        <ProgressBar currentStep={currentStep} totalSteps={3} />
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-8 mb-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepWelcome onNext={handleNext} />
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepPharmacyInfo
                data={pharmacyData}
                onChange={(newData) => setPharmacyData({ ...pharmacyData, ...newData })}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepAdminInfo
                data={adminData}
                onChange={(newData) => setAdminData({ ...adminData, ...newData })}
                onSubmit={handleSubmit}
                onPrev={handlePrev}
                isSubmitting={isPending}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnboardingLayout>
  );
}
