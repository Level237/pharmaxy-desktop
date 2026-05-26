export function OnboardingFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-8 px-12 flex flex-col md:flex-row justify-between items-center bg-white border-t border-slate-100 text-[13px] font-medium text-slate-500">
      <div className="text-emerald-600 font-black mb-4 md:mb-0">
        Pharmaxy
      </div>
      
      <div className="mb-4 md:mb-0">
        © {currentYear} Pharmaxy. Système de gestion officinale certifié MINSANTE.
      </div>
      
      <div className="flex items-center gap-6">
        <button className="hover:text-slate-900 transition-colors">Support</button>
        <button className="hover:text-slate-900 transition-colors">Confidentialité</button>
        <button className="hover:text-slate-900 transition-colors">Conditions d'utilisation</button>
      </div>
    </footer>
  );
}
