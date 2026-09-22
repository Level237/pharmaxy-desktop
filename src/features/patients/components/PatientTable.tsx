// src/features/patients/components/PatientTable.tsx
import { useState } from "react";
import { 
  User, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Edit3, 
  Trash2,
  Calendar
} from "lucide-react";
import type { Patient } from "../types";

interface PatientTableProps {
  patients: Patient[];
  onViewDetail: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
}

export function PatientTable({
  patients,
  onViewDetail,
  onEditPatient,
  onDeletePatient
}: PatientTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.max(1, Math.ceil(patients.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;
  const paginatedPatients = patients.slice(startIndex, startIndex + rowsPerPage);

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-5">Patient & État Civil</th>
              <th className="py-3.5 px-5">Coordonnées</th>
              <th className="py-3.5 px-5">Vigilance Médicale (Allergies & Pathologies)</th>
              <th className="py-3.5 px-5 text-right">Crédit / Dette</th>
              <th className="py-3.5 px-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {paginatedPatients.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-slate-400">
                  <User className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-sm">Aucun patient trouvé</p>
                  <p className="text-xs text-slate-400 mt-0.5">Ajustez vos filtres ou enregistrez un nouveau patient.</p>
                </td>
              </tr>
            ) : (
              paginatedPatients.map((p) => {
                const age = calculateAge(p.birth_date);
                const hasAllergies = !!(p.allergies && p.allergies.trim());
                const hasPathologies = !!(p.pathologies && p.pathologies.trim());
                const hasDebt = p.debt_balance > 0;

                return (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                    {/* 1. Patient & État Civil */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          p.gender === 'F' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                        }`}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {p.gender && (
                              <span className="font-semibold">{p.gender === 'F' ? 'Femme' : 'Homme'}</span>
                            )}
                            {age !== null && (
                              <span>• {age} ans</span>
                            )}
                            {p.birth_date && (
                              <span className="text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {p.birth_date}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Coordonnées */}
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        {p.phone ? (
                          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{p.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Sans téléphone</span>
                        )}
                        {p.address && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{p.address}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 3. Vigilance Médicale */}
                    <td className="py-4 px-5 max-w-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {hasAllergies ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 shrink-0 text-rose-600" />
                            <span>Allergie : {p.allergies}</span>
                          </span>
                        ) : null}

                        {hasPathologies ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            <Activity className="w-3 h-3 shrink-0 text-sky-600" />
                            <span>{p.pathologies}</span>
                          </span>
                        ) : null}

                        {!hasAllergies && !hasPathologies && (
                          <span className="text-slate-400 text-xs font-semibold">—</span>
                        )}
                      </div>
                    </td>

                    {/* 4. Crédit / Dette */}
                    <td className="py-4 px-5 text-right">
                      <div className="space-y-0.5">
                        <span className={`text-xs font-black ${
                          hasDebt ? "text-amber-600" : "text-emerald-600"
                        }`}>
                          {p.debt_balance.toLocaleString("fr-FR")} FCFA
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Plafond : {p.max_credit_limit.toLocaleString("fr-FR")} F
                        </p>
                      </div>
                    </td>

                    {/* 5. Actions */}
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onViewDetail(p)}
                          className="p-1.5 text-[#2720ff] hover:bg-[#2720ff]/10 rounded-lg transition-colors cursor-pointer"
                          title="Consulter le dossier médical & achats"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditPatient(p)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Modifier la fiche patient"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeletePatient(p)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer le patient"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {patients.length > 0 && (
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Afficher</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-700 focus:outline-none focus:border-[#2720ff]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>patients par page</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">
              Page {safePage} sur {totalPages} ({patients.length} patients)
            </span>
            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
