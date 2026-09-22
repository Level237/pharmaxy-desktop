// src/features/patients/components/PatientDetailModal.tsx
import { useEffect, useState } from "react";
import { 
  X, 
  Phone, 
  MapPin, 
  Mail, 
  AlertTriangle, 
  Activity, 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp, 
  Edit3,
  Clock
} from "lucide-react";
import { fetchPatientHistory } from "../actions/patientActions";
import type { Patient, PatientPurchase } from "../types";

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onEdit: (patient: Patient) => void;
}

export function PatientDetailModal({
  isOpen,
  onClose,
  patient,
  onEdit
}: PatientDetailModalProps) {
  const [purchases, setPurchases] = useState<PatientPurchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && patient) {
      setLoadingPurchases(true);
      fetchPatientHistory(patient.id)
        .then(setPurchases)
        .catch(err => console.error("Erreur historique patient:", err))
        .finally(() => setLoadingPurchases(false));
    }
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(patient.birth_date);
  const hasAllergies = !!(patient.allergies && patient.allergies.trim());
  const hasPathologies = !!(patient.pathologies && patient.pathologies.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-detail-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 ${
              patient.gender === 'F' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
            }`}>
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="patient-detail-title" className="text-lg font-bold text-slate-900">
                  {patient.name}
                </h2>
                {patient.gender && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                    {patient.gender === 'F' ? 'Femme' : 'Homme'}
                  </span>
                )}
                {age !== null && (
                  <span className="text-xs font-semibold text-slate-500">
                    • {age} ans
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Dossier Patient Officinal #{patient.id.toString().padStart(5, "0")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(patient);
              }}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modifier</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Bandeau d'Alertes Médicales (Prioritaire) */}
          {hasAllergies && (
            <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900 animate-in fade-in duration-200">
              <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-800">
                  ⚠️ Terrain Allergique Signalé
                </h4>
                <p className="text-sm font-bold text-rose-950 mt-0.5">
                  {patient.allergies}
                </p>
                <p className="text-[11px] text-rose-700 mt-1">
                  Vérifier impérativement la compatibilité des molécules avant toute délivrance.
                </p>
              </div>
            </div>
          )}

          {/* Grille Infos de Contact & Pathologies */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Contact */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Coordonnées
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{patient.phone || "Non renseigné"}</span>
              </div>
              {patient.address && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{patient.address}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{patient.email}</span>
                </div>
              )}
            </div>

            {/* Pathologies */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Suivi Pathologies
              </span>
              {hasPathologies ? (
                <div className="flex items-start gap-2 text-sky-900 font-semibold">
                  <Activity className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span>{patient.pathologies}</span>
                </div>
              ) : (
                <p className="text-slate-400 italic">Aucune pathologie chronique signalée.</p>
              )}
            </div>

            {/* Compte Crédit */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Compte Crédit Client
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-slate-500">Solde Dû :</span>
                <span className={`font-black text-sm ${
                  patient.debt_balance > 0 ? "text-amber-600" : "text-emerald-600"
                }`}>
                  {patient.debt_balance.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
              <div className="flex items-baseline justify-between text-[11px] text-slate-500">
                <span>Plafond :</span>
                <span className="font-semibold">{patient.max_credit_limit.toLocaleString("fr-FR")} F</span>
              </div>
            </div>
          </div>

          {/* SECTION HISTORIQUE DES ACHATS & ORDONNANCES */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#2720ff]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Historique des Achats & Ordonnances ({purchases.length})
                </h3>
              </div>
            </div>

            {loadingPurchases ? (
              <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#2720ff] border-t-transparent rounded-full animate-spin" />
                <span>Chargement de l'historique...</span>
              </div>
            ) : purchases.length === 0 ? (
              <div className="py-8 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                Aucun achat enregistré pour ce patient au POS.
              </div>
            ) : (
              <div className="space-y-2">
                {purchases.map((sale) => {
                  const isExpanded = expandedSaleId === sale.id;
                  return (
                    <div 
                      key={sale.id}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-slate-300 transition-all"
                    >
                      {/* Ligne principale vente */}
                      <div 
                        onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)}
                        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2720ff] flex items-center justify-center font-bold text-xs">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">
                                Ticket #{sale.receipt_number || sale.id}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 text-slate-600">
                                {sale.payment_method || "Espèces"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{sale.created_at.replace("T", " ").substring(0, 16)}</span>
                              <span>• {sale.lines.length} produit(s)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-black text-xs text-slate-900">
                              {sale.total_amount.toLocaleString("fr-FR")} FCFA
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Payé : {sale.paid_amount.toLocaleString("fr-FR")} F
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Lignes de médicaments délivrés (Détail étendu) */}
                      {isExpanded && (
                        <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100">
                          <table className="w-full text-left text-[11px]">
                            <thead>
                              <tr className="text-slate-400 font-bold border-b border-slate-200/60 pb-1">
                                <th className="py-1">Médicament</th>
                                <th className="py-1 text-center">N° Lot</th>
                                <th className="py-1 text-center">Quantité</th>
                                <th className="py-1 text-right">Prix Unitaire</th>
                                <th className="py-1 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                              {sale.lines.map((l, idx) => (
                                <tr key={idx} className="py-1">
                                  <td className="py-1.5 font-bold text-slate-900">
                                    {l.product_name} {l.dci && <span className="font-normal text-slate-500">({l.dci})</span>}
                                  </td>
                                  <td className="py-1.5 text-center font-mono text-slate-500">{l.lot_number}</td>
                                  <td className="py-1.5 text-center font-bold text-slate-900">{l.quantity}</td>
                                  <td className="py-1.5 text-right">{l.unit_price.toLocaleString("fr-FR")} F</td>
                                  <td className="py-1.5 text-right font-bold text-[#2720ff]">{l.subtotal.toLocaleString("fr-FR")} F</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
