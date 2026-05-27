import { History, User } from "lucide-react";
import type { Delivery } from "../types";

export function RecentDeliveries({ deliveries }: { deliveries: Delivery[] }) {
  const recent = deliveries.slice(0, 4);

  return (
    <div className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm flex flex-col max-h-[500px]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-[#0F172A]">Livraisons Récentes</h3>
        <History className="h-5 w-5 text-[#64748B]" />
      </div>

      <div className="space-y-8 flex-1">
        {recent.map((delivery) => (
          <div key={delivery.id} className="flex items-start justify-between group cursor-pointer">
            <div className="flex gap-4">
              <div className="mt-1 h-2 w-2 rounded-full bg-[#3B82F6]" />
              <div>
                <p className="font-bold text-[#0F172A] text-sm group-hover:text-[#3B82F6] transition-colors">{delivery.supplierName}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[#64748B]">
                  <User className="h-3 w-3" />
                  <span className="text-xs">{delivery.receivedBy}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#64748B] mb-1">{delivery.date.split(',')[1] || delivery.date}</p>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${delivery.status === 'REÇU' ? 'bg-[#ECFDF5] text-[#3B82F6]' :
                delivery.status === 'EN TRANSIT' ? 'bg-[#FFF7ED] text-[#D97706]' :
                  'bg-[#3B82F6] text-white'
                }`}>
                {delivery.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-[#E2E8F0] text-center">
        <button className="text-[#3B82F6] text-sm font-bold hover:underline">
          Voir tout l'historique
        </button>
      </div>
    </div>
  );
}
