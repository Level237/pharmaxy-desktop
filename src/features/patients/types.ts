// src/features/patients/types.ts
import type { 
  Patient, 
  NewPatientInput, 
  PatientPurchase, 
  PatientPurchaseLine, 
  PatientStats 
} from "../../db/patientQueries";

export type { Patient, NewPatientInput, PatientPurchase, PatientPurchaseLine, PatientStats };

export type PatientFilterStatus = 'all' | 'allergies' | 'chronic' | 'debt';

export interface PatientFiltersState {
  search: string;
  status: PatientFilterStatus;
}
