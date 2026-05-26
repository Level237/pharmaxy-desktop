import type { Sale } from "../types";

export function RecentSalesTable({ sales }: { sales: Sale[] }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      <div className="p-6 border-b border-[#F1F5F9] flex justify-between items-center">
        <h3 className="font-bold text-lg text-[#0F172A]">Ventes Récentes</h3>
        <button className="text-[#059669] text-xs font-bold hover:underline">Voir tout</button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[#64748B] text-[11px] font-bold uppercase tracking-wider bg-[#F8FAFC]">
            <th className="px-6 py-4">ID Transaction</th>
            <th className="px-4 py-4">Client</th>
            <th className="px-4 py-4">Produits</th>
            <th className="px-4 py-4">Montant</th>
            <th className="px-4 py-4">Heure</th>
            <th className="px-6 py-4">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9]">
          {sales.map((sale, i) => (
            <tr key={i} className="hover:bg-[#F8FAFC] transition-colors group">
              <td className="px-6 py-5 text-sm font-bold text-[#475569]">{sale.id}</td>
              <td className="px-4 py-5 text-sm font-medium text-[#0F172A]">{sale.client}</td>
              <td className="px-4 py-5 text-sm text-[#64748B]">{sale.products}</td>
              <td className="px-4 py-5 text-sm font-bold text-[#0F172A]">{sale.amount}</td>
              <td className="px-4 py-5 text-sm text-[#64748B]">{sale.time}</td>
              <td className="px-6 py-5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${sale.status === "Payé"
                    ? "bg-[#ECFDF5] text-[#059669]"
                    : "bg-[#FFF7ED] text-[#D97706]"
                  }`}>
                  {sale.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
