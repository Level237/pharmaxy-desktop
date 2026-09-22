// src/features/patients/components/PatientFormModal.tsx
import { useState, useActionState } from "react";
import { X, User, AlertTriangle, Activity, AlertCircle, Phone, MapPin, Mail, Calendar, ShieldCheck } from "lucide-react";
import { createPatientAction, updatePatientAction } from "../actions/patientActions";
import type { Patient, NewPatientInput } from "../types";

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientToEdit?: Patient | null;
  onSuccess: () => void;
}

const COMMON_ALLERGIES = [
  "Pénicilline",
  "AINS (Aspirine / Ibuprofène)",
  "Sulfamides",
  "Paracétamol",
  "Bêta-lactamines",
  "Céphalosporines"
];

const COMMON_PATHOLOGIES = [
  "Hypertension artérielle (HTA)",
  "Diabète type 2",
  "Asthme",
  "Ulcère gastro-duodénal",
  "Drépanocytose",
  "Insuffisance rénale"
];

export function PatientFormModal({
  isOpen,
  onClose,
  patientToEdit,
  onSuccess
}: PatientFormModalProps) {
  const isEditing = !!patientToEdit;

  const [formData, setFormData] = useState<NewPatientInput>(() => {
    if (patientToEdit) {
      return {
        name: patientToEdit.name,
        phone: patientToEdit.phone || "",
        email: patientToEdit.email || "",
        birth_date: patientToEdit.birth_date || "",
        gender: patientToEdit.gender || null,
        address: patientToEdit.address || "",
        allergies: patientToEdit.allergies || "",
        pathologies: patientToEdit.pathologies || "",
        max_credit_limit: patientToEdit.max_credit_limit || 50000
      };
    }
    return {
      name: "",
      phone: "",
      email: "",
      birth_date: "",
      gender: null,
      address: "",
      allergies: "",
      pathologies: "",
      max_credit_limit: 50000
    };
  });

  const handleAddTag = (field: 'allergies' | 'pathologies', tag: string) => {
    const current = formData[field] || "";
    if (!current) {
      setFormData(prev => ({ ...prev, [field]: tag }));
    } else if (!current.includes(tag)) {
      setFormData(prev => ({ ...prev, [field]: `${current}, ${tag}` }));
    }
  };

  const [actionState, formAction, isPending] = useActionState(
    async (_prevState: { error?: string } | null, data: FormData) => {
      const name = (data.get("name") as string)?.trim();
      const phone = (data.get("phone") as string)?.trim();
      const email = (data.get("email") as string)?.trim();
      const birthDate = (data.get("birth_date") as string)?.trim();
      const gender = (data.get("gender") as 'M' | 'F' | 'other') || null;
      const address = (data.get("address") as string)?.trim();
      const allergies = (data.get("allergies") as string)?.trim();
      const pathologies = (data.get("pathologies") as string)?.trim();
      const maxCredit = parseInt(data.get("max_credit_limit") as string, 10) || 50000;

      if (!name) {
        return { error: "Le nom complet du patient est obligatoire." };
      }

      try {
        if (isEditing && patientToEdit) {
          await updatePatientAction(patientToEdit.id, {
            name,
            phone,
            email,
            birth_date: birthDate,
            gender,
            address,
            allergies,
            pathologies,
            max_credit_limit: maxCredit
          });
        } else {
          await createPatientAction({
            name,
            phone,
            email,
            birth_date: birthDate,
            gender,
            address,
            allergies,
            pathologies,
            max_credit_limit: maxCredit
          });
        }

        onSuccess();
        onClose();
        return null;
      } catch (err: unknown) {
        return {
          error: err instanceof Error ? err.message : "Erreur lors de l'enregistrement du patient."
        };
      }
    },
    null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2720ff]/10 text-[#2720ff] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 id="patient-form-title" className="text-lg font-bold text-slate-900">
                {isEditing ? "Modifier le Dossier Patient" : "Nouveau Patient Officinal"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isEditing ? `Mise à jour de la fiche de ${patientToEdit?.name}` : "Enregistrement de l'état civil et des antécédents médicaux"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form action={formAction} className="p-6 overflow-y-auto space-y-4">
          {actionState?.error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionState.error}</span>
            </div>
          )}

          {/* Nom & Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Nom complet *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: M. EBODÉ Jean-Pierre"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Sexe
              </label>
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={(e) => setFormData({ ...formData, gender: (e.target.value as any) || null })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
              >
                <option value="">Non précisé</option>
                <option value="M">Homme</option>
                <option value="F">Femme</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          {/* Téléphone & Date de naissance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ex: 699 00 00 00"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date de Naissance
              </label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date || ""}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Adresse & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Adresse / Quartier
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ex: Bastos, Yaoundé"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email (Optionnel)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@email.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* SECTION MEDICALE : ALLERGIES */}
          <div className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Terrain Allergique & Contre-indications
              </span>
            </div>
            <input
              type="text"
              name="allergies"
              value={formData.allergies || ""}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="Ex: Allergie sévère à la Pénicilline, intolérance Aspirine..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-rose-200 bg-white text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-hidden"
            />
            {/* Suggestions allergies */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_ALLERGIES.map((alg) => (
                <button
                  key={alg}
                  type="button"
                  onClick={() => handleAddTag('allergies', alg)}
                  className="px-2 py-0.5 text-[10px] font-bold bg-white text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-md transition-colors"
                >
                  + {alg}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION MEDICALE : PATHOLOGIES CHRONIQUES */}
          <div className="p-3.5 bg-sky-50/60 border border-sky-200/80 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-sky-800">
              <Activity className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Pathologies Chroniques & Suivi
              </span>
            </div>
            <input
              type="text"
              name="pathologies"
              value={formData.pathologies || ""}
              onChange={(e) => setFormData({ ...formData, pathologies: e.target.value })}
              placeholder="Ex: Diabète type 2, Traitement antihypertenseur continu..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-sky-200 bg-white text-sky-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-hidden"
            />
            {/* Suggestions pathologies */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_PATHOLOGIES.map((pat) => (
                <button
                  key={pat}
                  type="button"
                  onClick={() => handleAddTag('pathologies', pat)}
                  className="px-2 py-0.5 text-[10px] font-bold bg-white text-sky-700 border border-sky-200 hover:bg-sky-100 rounded-md transition-colors"
                >
                  + {pat}
                </button>
              ))}
            </div>
          </div>

          {/* Plafond de crédit */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              Plafond Maximum de Crédit Autorisé (FCFA)
            </label>
            <input
              type="number"
              name="max_credit_limit"
              value={formData.max_credit_limit}
              onChange={(e) => setFormData({ ...formData, max_credit_limit: Math.max(0, parseInt(e.target.value) || 0) })}
              min={0}
              step={5000}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 text-xs font-bold text-white bg-[#2720ff] hover:bg-[#201ac9] rounded-xl shadow-md shadow-[#2720ff]/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>{isEditing ? "Enregistrer les modifications" : "Créer le Patient"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
