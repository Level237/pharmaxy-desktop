import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Truck, 
  CreditCard, 
  BarChart3, 
  Plus 
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: ShoppingBag, label: "Point of Sale", path: "/pos" },
  { icon: Package, label: "Stock", path: "/stock" },
  { icon: Truck, label: "Suppliers", path: "/suppliers" },
  { icon: CreditCard, label: "Credits", path: "/credits" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-[260px] bg-[#E9F2FB] border-r border-[#D1E1F0] flex flex-col p-6 fixed inset-y-0">
      <div className="mb-10 flex flex-col items-center">
        <img src={logo} alt="Pharmaxy Logo" className="h-12 w-auto mb-2" />
        <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">
          Central Management
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center cursor-pointer gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-[#10B981] text-white shadow-lg shadow-emerald-500/20 font-bold"
                  : "text-[#475569] hover:bg-[#DDE9F5]"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-[#64748B]"}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button 
        onClick={() => navigate("/pos")}
        className="mt-auto w-full bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/10"
      >
        <Plus className="h-5 w-5" />
        <span>New Sale</span>
      </button>
    </aside>
  );
}
