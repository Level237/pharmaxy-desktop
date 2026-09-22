// src/features/patients/PatientsPage.tsx
import { useState, useEffect, useTransition, useMemo } from "react";
import { Users, RefreshCw, AlertTriangle, Trash2, X } from "lucide-react";
import { Layout } from "../../shared/components/Layout";
import { 
  fetchPatientsList, 
  fetchPatientKpis, 
  deletePatientAction 
} from "./actions/patientActions";
import { PatientKpisBanner } from "./components/PatientKpisBanner";
import { PatientFilters } from "./components/PatientFilters";
import { PatientTable } from "./components/PatientTable";
import { PatientFormModal } from "./components/PatientFormModal";
import { PatientDetailModal } from "./components/PatientDetailModal";
import type { Patient, PatientFiltersState, PatientFilterStatus, PatientStats } from "./types";

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<PatientStats>({
    totalPatients: 0,
    patientsWithAllergies: 0,
    patientsWithPathologies: 0,
    patientsWithDebt: 0,
    totalDebtAmount: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filtres
  const [filters, setFilters] = useState<PatientFiltersState>({
    search: "",
    status: "all"
  });

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [patientDetail, setPatientDetail] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [list, kpis] = await Promise.all([
        fetchPatientsList(),
        fetchPatientKpis()
      ]);
      setPatients(list);
      setStats(kpis);
    } catch (err) {
      console.error("Erreur chargement patients:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrage des patients (dérivé pendant le rendu)
  const filteredPatients = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return patients.filter((p) => {
      // 1. Recherche texte
      if (query) {
        const nameMatch = p.name.toLowerCase().includes(query);
        const phoneMatch = (p.phone || "").toLowerCase().includes(query);
        const allergyMatch = (p.allergies || "").toLowerCase().includes(query);
        const pathologyMatch = (p.pathologies || "").toLowerCase().includes(query);
        if (!nameMatch && !phoneMatch && !allergyMatch && !pathologyMatch) {
          return false;
        }
      }

      // 2. Filtre statut
      switch (filters.status) {
        case "allergies":
          return !!(p.allergies && p.allergies.trim().length > 0);
        case "chronic":
          return !!(p.pathologies && p.pathologies.trim().length > 0);
        case "debt":
          return p.debt_balance > 0;
        case "all":
        default:
          return true;
      }
    });
  }, [patients, filters]);

  // Handlers avec useTransition
  const handleSearchChange = (search: string) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, search }));
    });
  };

  const handleStatusChange = (status: PatientFilterStatus) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, status }));
    });
  };

  const handleOpenNewPatient = () => {
    setPatientToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditPatient = (p: Patient) => {
    setPatientToEdit(p);
    setIsFormModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      setDeleteError(null);
      await deletePatientAction(patientToDelete.id);
      setPatientToDelete(null);
      loadData();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Erreur lors de la suppression du patient.");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2720ff] text-white flex items-center justify-center shadow-lg shadow-[#2720ff]/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Annuaire & Dossiers Patients
              </h1>
              <p className="text-xs text-slate-500 font-semibold">
                Gestion des fiches médicales, vigilance allergies, pathologies chroniques et historique d'achats
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs"
              title="Actualiser les données"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#2720ff]" : ""}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <PatientKpisBanner stats={stats} />

        {/* Filtres */}
        <PatientFilters
          filters={filters}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onOpenNewPatientModal={handleOpenNewPatient}
        />

        {/* Tableau */}
        <div className={`transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}>
          <PatientTable
            patients={filteredPatients}
            onViewDetail={(p) => setPatientDetail(p)}
            onEditPatient={handleEditPatient}
            onDeletePatient={(p) => {
              setDeleteError(null);
              setPatientToDelete(p);
            }}
          />
        </div>

        {/* Modal Création / Édition */}
        {isFormModalOpen && (
          <PatientFormModal
            isOpen={isFormModalOpen}
            onClose={() => {
              setIsFormModalOpen(false);
              setPatientToEdit(null);
            }}
            patientToEdit={patientToEdit}
            onSuccess={loadData}
          />
        )}

        {/* Modal Détails & Historique Achats */}
        {patientDetail && (
          <PatientDetailModal
            isOpen={!!patientDetail}
            onClose={() => setPatientDetail(null)}
            patient={patientDetail}
            onEdit={handleEditPatient}
          />
        )}

        {/* Modal Confirmation de Suppression */}
        {patientToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <Trash2 className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={() => setPatientToDelete(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Supprimer ce patient ?
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Êtes-vous certain de vouloir supprimer le dossier de{" "}
                  <span className="font-bold text-slate-900">{patientToDelete.name}</span> ?
                </p>

                {deleteError && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{deleteError}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPatientToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all"
                >
                  Supprimer Définitivement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
