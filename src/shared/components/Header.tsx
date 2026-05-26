import { Search, CheckCircle2 } from "lucide-react";
import avatar from "../../assets/avatar.png";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function Header() {
  const currentUser = useCurrentUser();

  return (
    <header className="h-20 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Rechercher un médicament ou scanner..."
            className="w-full bg-[#F1F5F9] border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#10B981]/20 placeholder-[#94A3B8]"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-[#ECFDF5] text-[#059669] px-3 py-1.5 rounded-full border border-[#D1FAE5]">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs font-bold">Connecté</span>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-[#0F172A]">{currentUser.name}</p>
              <p className="text-[11px] text-[#64748B] font-medium">{currentUser.role || "Pharmacien Chef"}</p>
            </div>
            <img src={avatar} alt="Profile" className="h-10 w-10 rounded-full border-2 border-white shadow-sm" />
          </div>
        )}
      </div>
    </header>
  );
}
