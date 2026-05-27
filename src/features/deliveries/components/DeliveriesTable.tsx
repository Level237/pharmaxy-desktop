import { Filter, Download, ExternalLink, Building2, FlaskConical, Globe, GraduationCap } from "lucide-react";
import type { Delivery } from "../types";

export function DeliveriesTable({ deliveries }: { deliveries: Delivery[] }) {
  const getIcon = (type: string) => {
    if (type.includes("Grossiste")) return <Building2 className="h-5 w-5" />;
    if (type.includes("Laboratoire")) return <FlaskConical className="h-5 w-5" />;
    if (type.includes("Institutionnel")) return <GraduationCap className="h-5 w-5" />;
    return <Globe className="h-5 w-5" />;
  };

  return (
    <div className="bg-white rounded-[32px] border border-[#E2E8F0] overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-8 flex items-center justify-between">
        <h3 className="text-xl font-black text-[#0F172A]">Annuaire des Livraisons</h3>
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all">
            <Filter className="h-5 w-5 text-[#64748B]" />
          </button>
          <button className="p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all">
            <Download className="h-5 w-5 text-[#64748B]" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAFC] border-y border-[#E2E8F0]">
            <tr>
              <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Nom du Fournisseur</th>
              <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Type</th>
              <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Articles</th>
              <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Dernier Contact</th>
              <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {deliveries.map((delivery) => (
              <tr key={delivery.id} className="hover:bg-[#F8FAFC] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center text-[#3B82F6]">
                      {getIcon(delivery.supplierType)}
                    </div>
                    <span className="font-bold text-[#0F172A]">{delivery.supplierName}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm text-[#475569]">{delivery.supplierType}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="h-8 w-12 bg-[#F1F5F9] rounded-full flex items-center justify-center text-xs font-black text-[#475569]">
                    {delivery.itemsCount}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm text-[#475569]">{delivery.date}</span>
                </td>
                <td className="px-8 py-6">
                  <button className="flex items-center gap-2 text-[#3B82F6] font-bold text-sm hover:underline">
                    Voir les livraisons <ExternalLink className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 mt-auto border-t border-[#E2E8F0] flex justify-center">
        <button className="text-[#64748B] text-sm font-bold flex items-center gap-2 hover:text-[#0F172A] transition-colors">
          Afficher plus de livraisons
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
