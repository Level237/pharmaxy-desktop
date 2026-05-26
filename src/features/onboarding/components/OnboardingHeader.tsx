import { Globe, HelpCircle } from "lucide-react";

export function OnboardingHeader() {
  return (
    <header className="w-full py-6 px-12 flex justify-between items-center bg-white border-b border-slate-100">
      <div className="text-2xl font-black text-slate-900 tracking-tighter">
        Pharmaxy
      </div>
      <div className="flex items-center gap-8 text-slate-500 font-bold text-sm">
        <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
          <HelpCircle className="h-5 w-5" />
          <span>Support</span>
        </button>
        <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
          <Globe className="h-5 w-5" />
          <span>FR</span>
        </button>
      </div>
    </header>
  );
}
