// src/features/cash/types.ts
import type { CashSession, CashMovement, CashSessionSummary } from "../../db/cashQueries";

export type { CashSession, CashMovement, CashSessionSummary };

export interface OpenSessionFormData {
  openingAmount: number;
  notes?: string;
}

export interface CashMovementFormData {
  type: 'withdrawal' | 'deposit';
  amount: number;
  reason: string;
  notes?: string;
}

export interface CloseSessionFormData {
  closingAmountReal: number;
  notes?: string;
}
