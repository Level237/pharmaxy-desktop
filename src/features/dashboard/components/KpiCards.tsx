import { TrendingUp, Users, Wallet, Plus, AlertTriangle } from "lucide-react";
import type { DashboardStats } from "../types";

export function KpiCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] relative overflow-hidden group hover:border-[#10B981] transition-all cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div className="h-12 w-12 bg-[#ECFDF5] rounded-xl flex items-center justify-center text-[#10B981]">
            <TrendingUp className="h-6 w-6" />
          </div>
          <span className="text-[#059669] text-xs font-bold flex items-center gap-1">
            <Plus className="h-3 w-3" /> {stats.revenueChange}%
          </span>
        </div>
        <p className="text-[#64748B] text-[11px] font-bold uppercase tracking-wider">CA Aujourd'hui</p>
        <h3 className="text-3xl font-black text-[#0F172A] mt-1">{stats.todayRevenue}</h3>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] group hover:border-[#3B82F6] transition-all cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div className="h-12 w-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center text-[#3B82F6]">
            <Users className="h-6 w-6" />
          </div>
          <span className="text-[#64748B] text-[10px] font-bold uppercase">Total du jour</span>
        </div>
        <p className="text-[#64748B] text-[11px] font-bold uppercase tracking-wider">Clients servis</p>
        <h3 className="text-3xl font-black text-[#0F172A] mt-1">{stats.clientsServed}</h3>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] group hover:border-[#D97706] transition-all cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div className="h-12 w-12 bg-[#FFF7ED] rounded-xl flex items-center justify-center text-[#D97706]">
            <Wallet className="h-6 w-6" />
          </div>
          <span className="text-[#B45309] text-[10px] font-bold uppercase flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Action requise
          </span>
        </div>
        <p className="text-[#64748B] text-[11px] font-bold uppercase tracking-wider">Crédits accordés</p>
        <h3 className="text-3xl font-black text-[#0F172A] mt-1">{stats.creditsGranted}</h3>
      </div>
    </div>
  );
}
