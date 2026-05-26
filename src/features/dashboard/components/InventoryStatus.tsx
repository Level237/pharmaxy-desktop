export function InventoryStatus() {
  return (
    <div className="bg-[#F0F5FA] p-6 rounded-2xl border border-[#D1E1F0]">
      <h3 className="text-[#475569] text-[11px] font-black uppercase tracking-widest mb-6">État de l'inventaire</h3>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-[#475569]">Stock critique</span>
            <span className="bg-[#FEE2E2] text-[#EF4444] px-2 py-0.5 rounded text-[10px] font-black">3 items</span>
          </div>
          <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
            <div className="h-full bg-[#EF4444] w-[20%]" />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-[#475569]">Stock faible</span>
            <span className="bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 rounded text-[10px] font-black">12 items</span>
          </div>
          <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
            <div className="h-full bg-[#F59E0B] w-[45%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
