import { WifiOff, TrendingUp, CheckCircle, ChevronRight } from "lucide-react";
import logo from "../../../assets/logo.png";
import { Link } from "react-router-dom";

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  const features = [
    {
      icon: WifiOff,
      title: "Offline-First",
      desc: "L'application encaisse et gère les stocks à 100% sur votre machine, sans Internet.",
    },
    {
      icon: TrendingUp,
      title: "Règle FEFO",
      desc: "Réduction automatique des pertes grâce à une gestion intelligente des lots et dates d'expiration.",
    },
    {
      icon: CheckCircle,
      title: "Conformité MINSANTE",
      desc: "Gestion réglementaire intégrée, recherche par DCI et monnaie locale FCFA.",
    },
  ];

  return (
    <div className="flex flex-col items-center text-center p-8 md:p-12">
      <h1 className="text-3xl font-black text-slate-900 mb-2">Bienvenue sur Pharmaxy</h1>
      <p className="text-slate-500 font-medium mb-8 max-w-md">
        La solution de gestion officinale conçue pour l'excellence opérationnelle.
      </p>

      <div className="mb-10 p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
        <img src={logo} alt="Pharmaxy" className="h-16 w-auto" />
      </div>

      <div className="w-full space-y-3 mb-10">
        {features.map((feature, i) => (
          <div
            key={i}
            className="flex items-center gap-5 p-5 bg-[#F1F5F9]/50 rounded-2xl border border-slate-100/50 text-left"
          >
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <feature.icon className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{feature.title}</h3>
              <p className="text-sm text-slate-500 font-medium">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] mb-6 tracking-widest uppercase text-sm"
      >
        Continuer
        <ChevronRight className="h-5 w-5" />
      </button>

      <p className="text-sm font-bold text-slate-400">
        Déjà un compte ? <Link to="/login" className="text-emerald-600 hover:underline">Connectez-vous</Link>
      </p>
    </div>
  );
}
