import { ArrowRight, Activity, Database, KeySquare } from "lucide-react";
import { motion } from "framer-motion";

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  const steps = [
    {
      icon: Activity,
      title: "Informations de l'officine",
      desc: "Configuration des données légales et administratives.",
    },
    {
      icon: KeySquare,
      title: "Sécurité & Accès",
      desc: "Création du compte administrateur principal.",
    },
    {
      icon: Database,
      title: "Base de données",
      desc: "Initialisation du référentiel médicaments hors-ligne.",
    },
  ];

  return (
    <div className="flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="inline-block py-1 px-3 rounded-full bg-[#2720ff]/10 text-[#2720ff] text-[10px] font-bold tracking-widest uppercase mb-4">
          Configuration Initiale
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 ">
          Commençons la <br /> configuration.
        </h2>
        <p className="text-slate-500 font-medium text-lg mb-10 max-w-md">
          Nous allons configurer votre environnement Pharmaxy en 3 étapes simples et rapides.
        </p>
      </motion.div>

      <div className="w-full space-y-4 mb-12">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200/60 shadow-sm"
          >
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <step.icon className="h-6 w-6 text-[#2720ff]" />
            </div>
            <div className="pt-1">
              <h3 className="font-bold text-slate-900 text-base">{step.title}</h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        onClick={onNext}
        className="w-full sm:w-auto self-start px-8 py-4 bg-[#2720ff] hover:bg-[#1f19cc] text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] tracking-wide shadow-lg shadow-[#2720ff]/25"
      >
        Démarrer l'installation
        <ArrowRight className="h-5 w-5" />
      </motion.button>
    </div>
  );
}
