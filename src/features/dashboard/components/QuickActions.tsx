import { ShoppingCart, PackagePlus, Edit3 } from "lucide-react";

export function QuickActions() {
  const actions = [
    { icon: ShoppingCart, label: "Nouvelle Vente", color: "#10B981" },
    { icon: PackagePlus, label: "Réception Livraison", color: "#3B82F6" },
    { icon: Edit3, label: "Ajuster le Stock", color: "#D97706" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0]">
      <h3 className="font-bold text-lg text-[#0F172A] mb-6">Actions Rapides</h3>
      <div className="space-y-4">
        {actions.map((action, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-all group"
          >
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <action.icon className="h-5 w-5" style={{ color: action.color }} />
            </div>
            <span className="text-sm font-bold text-[#475569]">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
