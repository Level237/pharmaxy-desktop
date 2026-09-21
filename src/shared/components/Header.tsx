import { Search, CheckCircle2, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import avatar from "../../assets/avatar.png";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLock = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 font-sans">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un médicament ou scanner..."
            className="w-full bg-slate-100/80 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2720ff]/20 placeholder-slate-400 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Statut En Ligne */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200/80">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="text-xs font-bold">Caisse Active</span>
        </div>

        {/* Profil Vendeur / Pharmacien */}
        {user && (
          <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">
                {user.role === "admin" ? "Administrateur" : "Caissier"}
              </p>
            </div>
            <img src={avatar} alt="Profile" className="h-9 w-9 rounded-full border border-slate-200 shadow-xs" />
          </div>
        )}

        {/* Bouton Verrouillage Rapide / Déconnexion */}
        <button
          onClick={handleLock}
          title="Verrouiller la caisse (déconnexion)"
          className="p-2.5 rounded-xl border border-slate-200 hover:border-red-200 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all cursor-pointer flex items-center gap-1.5 group"
        >
          <Lock className="h-4 w-4 group-hover:scale-105 transition-transform" />
          <span className="text-xs font-bold hidden md:inline">Verrouiller</span>
        </button>
      </div>
    </header>
  );
}
