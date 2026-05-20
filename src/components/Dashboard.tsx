// src/components/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  ShoppingBag, 
  Package, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  RefreshCw, 
  Database,
  User,
  Settings
} from "lucide-react";
import { getPharmacyInfo } from "../db/pharmacyQueries";
import logo2 from "../assets/logo-2.png";

interface Pharmacy {
  name: string;
  address: string;
  phone: string;
  owner_name: string;
  license_number: string;
  api_token: string;
  sync_status: string;
}

interface CurrentUser {
  name: string;
  role: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // 1. Récupérer l'utilisateur connecté dans la session
    const userJson = sessionStorage.getItem("currentUser");
    if (!userJson) {
      navigate("/login");
      return;
    }
    setCurrentUser(JSON.parse(userJson));

    // 2. Charger les infos de la pharmacie depuis SQLite
    async function loadPharmacyInfo() {
      try {
        const info = await getPharmacyInfo();
        if (info && info.length > 0) {
          setPharmacy(info[0]);
        }
      } catch (err) {
        console.error("Erreur de chargement des détails de la pharmacie", err);
      }
    }
    loadPharmacyInfo();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#060814] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Glows d'ambiance */}
      <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-[#2720ff]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full bg-[#67dcff]/5 blur-[150px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-white/5 bg-white/[0.01] backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo2} alt="Logo" className="h-9 object-contain" />
            <span className="text-gray-500 font-medium">|</span>
            <span className="text-sm font-bold bg-gradient-to-r from-[#67dcff] to-[#587dff] bg-clip-text text-transparent">
              {pharmacy?.name || "Pharmaxy"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Indicateur Synchro */}
            <button 
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 text-xs font-semibold cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#67dcff] ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Synchronisation..." : "Synchroniser"}</span>
            </button>

            {/* Session Infos */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-xs">
              <User className="h-3.5 w-3.5 text-[#587dff]" />
              <span className="font-semibold text-gray-200">{currentUser.name}</span>
              <span className="text-[10px] bg-[#67dcff]/10 text-[#67dcff] px-1.5 py-0.5 rounded uppercase font-bold">
                {currentUser.role === "admin" ? "Gérant" : "Caissier"}
              </span>
            </div>

            {/* Déconnexion */}
            <button 
              onClick={handleLogout}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 cursor-pointer transition-all active:scale-95"
              title="Déconnexion de la caisse"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 w-full">
        
        {/* Titre Bienvenue */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Tableau de Bord Officine</h1>
          <p className="text-gray-400 text-sm mt-1">
            Suivi temps réel des ventes, de la caisse locale et de la conformité réglementaire.
          </p>
        </div>

        {/* Dashboard Grid - KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:border-[#67dcff]/20 transition-all">
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Chiffre d'Affaires</span>
              <h3 className="text-2xl font-black text-white mt-1">0 FCFA</h3>
              <p className="text-[10px] text-gray-500 mt-1">Ventes nettes aujourd'hui</p>
            </div>
            <div className="p-4 bg-[#67dcff]/10 rounded-xl text-[#67dcff]">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:border-[#587dff]/20 transition-all">
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Médicaments en Stock</span>
              <h3 className="text-2xl font-black text-white mt-1">0</h3>
              <p className="text-[10px] text-gray-500 mt-1">Boîtes physiques répertoriées</p>
            </div>
            <div className="p-4 bg-[#587dff]/10 rounded-xl text-[#587dff]">
              <Package className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:border-red-500/20 transition-all">
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Alertes Péremption</span>
              <h3 className="text-2xl font-black text-red-400 mt-1">0</h3>
              <p className="text-[10px] text-gray-500 mt-1">Lots expirant sous 3 mois (FEFO)</p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-xl text-red-400">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:border-emerald-500/20 transition-all">
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Ruptures Stock</span>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">0</h3>
              <p className="text-[10px] text-gray-500 mt-1">Produits sous le stock d'alerte</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl text-emerald-400">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Info Base SQL & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Métadonnées SQLite Locales */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl lg:col-span-2">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
              <Database className="h-5 w-5 text-[#67dcff]" />
              Connexion SQLite Active & Paramètres Officine
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 block text-xs">Nom officiel :</span>
                  <span className="text-white font-medium">{pharmacy?.name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Adresse physique :</span>
                  <span className="text-white font-medium">{pharmacy?.address || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Téléphone :</span>
                  <span className="text-white font-medium">{pharmacy?.phone || "Non renseigné"}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 block text-xs">Pharmacien Titulaire :</span>
                  <span className="text-white font-medium">{pharmacy?.owner_name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Agrément MINSANTE :</span>
                  <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded text-xs border border-white/5 text-[#67dcff]">
                    {pharmacy?.license_number || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Token de Synchro API (Laravel) :</span>
                  <span className="text-white font-mono text-[10px] block truncate max-w-xs bg-white/5 p-1 rounded border border-white/5">
                    {pharmacy?.api_token || "Non configuré"}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3 text-xs text-emerald-400">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Base SQLite locale connectée et synchronisée avec le moteur de synchronisation distant.</span>
            </div>
          </div>

          {/* Raccourcis Actions Rapides */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                <Settings className="h-5 w-5 text-[#587dff]" />
                Raccourcis Opérateurs
              </h3>
              
              <ul className="space-y-3">
                <li>
                  <button className="w-full text-left bg-white/5 hover:bg-[#587dff]/20 hover:border-[#587dff]/30 border border-white/5 p-3 rounded-xl transition-all flex items-center justify-between text-sm group">
                    <span className="font-semibold text-gray-200 group-hover:text-white">Caisse / Vente Directe</span>
                    <ShoppingBag className="h-4 w-4 text-[#67dcff]" />
                  </button>
                </li>
                <li>
                  <button className="w-full text-left bg-white/5 hover:bg-[#587dff]/20 hover:border-[#587dff]/30 border border-white/5 p-3 rounded-xl transition-all flex items-center justify-between text-sm group">
                    <span className="font-semibold text-gray-200 group-hover:text-white">Catalogue & DCI</span>
                    <Package className="h-4 w-4 text-[#67dcff]" />
                  </button>
                </li>
                <li>
                  <button className="w-full text-left bg-white/5 hover:bg-[#587dff]/20 hover:border-[#587dff]/30 border border-white/5 p-3 rounded-xl transition-all flex items-center justify-between text-sm group">
                    <span className="font-semibold text-gray-200 group-hover:text-white">Gestion Clients & Dettes</span>
                    <Users className="h-4 w-4 text-[#67dcff]" />
                  </button>
                </li>
              </ul>
            </div>
            
            <p className="text-gray-500 text-[10px] text-center mt-6">
              Pharmaxy v0.1.0 • Module Offline First v1
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}
