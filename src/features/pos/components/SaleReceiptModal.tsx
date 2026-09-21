import { useState, useEffect } from "react";
import { Printer, CheckCircle2, X, RefreshCw } from "lucide-react";
import { getSaleById, type SaleDetail } from "../../../db/saleQueries";
import { getPharmacyInfo } from "../../../db/pharmacyQueries";

interface SaleReceiptModalProps {
  saleId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onNewSale?: () => void;
}

export function SaleReceiptModal({
  saleId,
  isOpen,
  onClose,
  onNewSale
}: SaleReceiptModalProps) {
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [pharmacy, setPharmacy] = useState<{
    name: string;
    owner_name?: string;
    license_number?: string;
    address?: string;
    phone?: string;
  }>({
    name: "Grande Pharmacie Officinale",
    owner_name: "Dr. Pharmacien Titulaire",
    license_number: "MS/DPML/2024-089",
    address: "Avenue Principale, Yaoundé",
    phone: "+237 600 000 000"
  });

  const [paperWidth, setPaperWidth] = useState<"80mm" | "58mm">("80mm");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !saleId) {
      setSale(null);
      return;
    }

    let ignore = false;
    setIsLoading(true);

    async function loadData() {
      try {
        const [saleData, pharmData] = await Promise.all([
          getSaleById(saleId!),
          getPharmacyInfo()
        ]);

        if (!ignore && saleData) {
          setSale(saleData);
        }
        if (!ignore && pharmData && pharmData.length > 0) {
          setPharmacy(pharmData[0]);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des détails du reçu:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [isOpen, saleId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      
      {/* Styles CSS d'isolation pour l'impression thermique ESC/POS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #official-receipt-print, #official-receipt-print * {
            visibility: visible !important;
          }
          #official-receipt-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${paperWidth === "80mm" ? "80mm" : "58mm"} !important;
            max-width: ${paperWidth === "80mm" ? "80mm" : "58mm"} !important;
            margin: 0 !important;
            padding: 3mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            font-family: 'Courier New', Courier, monospace !important;
          }
          @page {
            size: ${paperWidth === "80mm" ? "80mm" : "58mm"} auto;
            margin: 0;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* 1. Barre Supérieure */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Reçu de Caisse Officiel</h3>
              <p className="text-xs text-slate-500 font-medium">
                {sale ? `Ticket N° ${sale.receipt_number}` : "Chargement de la transaction..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sélecteur de largeur rouleau */}
            {sale && (
              <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPaperWidth("80mm")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    paperWidth === "80mm" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  80mm
                </button>
                <button
                  type="button"
                  onClick={() => setPaperWidth("58mm")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    paperWidth === "58mm" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  58mm
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 2. Zone d'aperçu du ticket thermique */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center items-start">
          
          {isLoading ? (
            <div className="min-h-[350px] w-full flex flex-col items-center justify-center text-slate-500 gap-3">
              <div className="h-10 w-10 border-4 border-[#2720ff]/20 border-t-[#2720ff] rounded-full animate-spin" />
              <p className="font-bold text-sm text-slate-800">Génération du reçu de caisse...</p>
              <p className="text-xs text-slate-400">Récupération des lots et conformité MINSANTE</p>
            </div>
          ) : !sale ? (
            <div className="min-h-[300px] w-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-slate-200">
              <p className="font-bold text-slate-800 text-sm mb-1">Transaction introuvable</p>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Impossible de charger les données du reçu N° {saleId}.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Fermer
              </button>
            </div>
          ) : (
            <div
              id="official-receipt-print"
              className={`bg-white p-6 shadow-md border border-slate-200 text-slate-900 font-mono text-xs transition-all duration-200 ${
                paperWidth === "80mm" ? "w-[360px]" : "w-[270px]"
              }`}
            >
            {/* En-tête officiel de l'officine */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="font-black text-sm tracking-wide text-slate-950 uppercase">{pharmacy.name}</h2>
              {pharmacy.owner_name && (
                <p className="text-[11px] font-bold text-slate-700 mt-0.5">Dr. {pharmacy.owner_name}</p>
              )}
              {pharmacy.license_number && (
                <p className="text-[10px] text-slate-600">Agrément MINSANTE: {pharmacy.license_number}</p>
              )}
              {pharmacy.address && (
                <p className="text-[10px] text-slate-600 mt-0.5">{pharmacy.address}</p>
              )}
              {pharmacy.phone && (
                <p className="text-[10px] text-slate-600">Tél: {pharmacy.phone}</p>
              )}
            </div>

            {/* Métadonnées de vente */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">N° Ticket:</span>
                <span className="font-bold">{sale.receipt_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span>{new Date(sale.created_at).toLocaleString("fr-FR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vendeur:</span>
                <span className="font-medium">{sale.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client:</span>
                <span className="font-medium">{sale.client_name || "Comptant"}</span>
              </div>
            </div>

            {/* Tableau des lignes d'articles */}
            <div className="py-2.5 border-b border-dashed border-slate-300">
              <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase mb-1.5">
                <span>Désignation</span>
                <span>Total FCFA</span>
              </div>

              <div className="space-y-2">
                {sale.lines.map((line, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="font-bold text-slate-900 leading-tight">
                      {line.product_name}
                    </div>
                    {line.lot_number && (
                      <div className="text-[10px] text-slate-600">
                        Lot: {line.lot_number} {line.expiry_date ? `| Pér: ${line.expiry_date}` : ""}
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600 text-[10px] mt-0.5">
                      <span>{line.quantity} x {line.unit_price.toLocaleString()} F</span>
                      <span className="font-bold text-slate-900">{line.subtotal.toLocaleString()} F</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totaux & Rendu monnaie */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-sm font-black text-slate-950">
                <span>TOTAL NET :</span>
                <span>{sale.total_amount.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Montant Reçu :</span>
                <span>{sale.paid_amount.toLocaleString()} FCFA</span>
              </div>
              {sale.change_amount > 0 && (
                <div className="flex justify-between font-bold text-emerald-800">
                  <span>Monnaie Rendue :</span>
                  <span>{sale.change_amount.toLocaleString()} FCFA</span>
                </div>
              )}
            </div>

            {/* Mentions légales & Pharmaceutiques */}
            <div className="pt-3 text-center text-[10px] text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Les médicaments ne sont ni repris ni échangés.</p>
              <p>Merci de votre visite.</p>
              <p className="font-bold text-slate-900">Bon rétablissement !</p>
              
              {/* Code barre simulé */}
              <div className="pt-2 flex flex-col items-center justify-center opacity-80">
                <div className="h-8 w-40 flex items-center justify-center gap-0.5">
                  {[4, 2, 6, 1, 3, 5, 2, 7, 3, 2, 5, 1, 4, 3, 6, 2, 3, 5, 2, 4, 6, 2, 3].map((h, i) => (
                    <div
                      key={i}
                      className="bg-slate-900 h-full"
                      style={{ width: `${(h % 3) + 1}px` }}
                    />
                  ))}
                </div>
                <span className="text-[9px] text-slate-600 font-mono mt-0.5">{sale.receipt_number}</span>
              </div>
            </div>

            </div>
          )}

        </div>

        {/* 3. Barre d'actions épurée */}
        {sale && (
          <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
            >
              Fermer
            </button>

            <div className="flex items-center gap-2.5">
              {/* Bouton Imprimer Reçu (Fond blanc délicat, bordure discrète et texte sombre) */}
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl bg-white/90 hover:bg-slate-50 text-slate-800 border border-slate-300/80 hover:border-slate-400 shadow-xs text-xs font-bold transition-all cursor-pointer flex items-center gap-2 active:scale-98"
              >
                <Printer className="h-4 w-4 text-[#2720ff]" />
                <span>Imprimer Reçu</span>
              </button>

              {/* Bouton Nouvelle Vente */}
              {onNewSale && (
                <button
                  onClick={() => {
                    onClose();
                    onNewSale();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#2720ff] hover:bg-[#1f19cc] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-[#2720ff]/20 active:scale-98"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Nouvelle Vente</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
