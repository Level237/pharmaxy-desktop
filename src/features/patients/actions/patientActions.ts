// src/features/patients/actions/patientActions.ts
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientPurchases,
  getPatientStats,
  type Patient,
  type NewPatientInput,
  type PatientPurchase,
  type PatientStats
} from "../../../db/patientQueries";

export async function fetchPatientsList(search?: string): Promise<Patient[]> {
  return await getAllPatients(search);
}

export async function fetchPatientDetails(id: number): Promise<Patient | null> {
  return await getPatientById(id);
}

export async function createPatientAction(input: NewPatientInput): Promise<number> {
  return await createPatient(input);
}

export async function updatePatientAction(id: number, input: Partial<NewPatientInput>): Promise<void> {
  await updatePatient(id, input);
}

export async function deletePatientAction(id: number): Promise<void> {
  await deletePatient(id);
}

export async function fetchPatientHistory(clientId: number): Promise<PatientPurchase[]> {
  return await getPatientPurchases(clientId);
}

export async function fetchPatientKpis(): Promise<PatientStats> {
  return await getPatientStats();
}
