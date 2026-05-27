export function StockOptimizationCard() {
  return (
    <div className="relative rounded-[32px] overflow-hidden h-48 group cursor-pointer shadow-xl shadow-black/10">
      <img
        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"
        alt="Stock Optimization"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
        <h4 className="text-white font-bold text-lg leading-tight">Optimisation Stock</h4>
        <p className="text-white/70 text-xs mt-1">Analyse prédictive des ruptures</p>
      </div>
    </div>
  );
}
