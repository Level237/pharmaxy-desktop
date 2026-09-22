// src/features/cash/actions/cashActions.ts
import {
  getActiveCashSession,
  openCashSession,
  recordCashMovement,
  getCashSessionSummary,
  closeCashSession,
  getCashSessionsHistory,
  type CashSession,
  type CashMovement,
  type CashSessionSummary
} from "../../../db/cashQueries";

export async function fetchActiveCashSession(userId?: number): Promise<CashSession | null> {
  return await getActiveCashSession(userId);
}

export async function openSessionAction(
  userId: number,
  openingAmount: number,
  notes?: string
): Promise<CashSession> {
  return await openCashSession(userId, openingAmount, notes);
}

export async function recordMovementAction(
  sessionId: number,
  userId: number,
  type: 'withdrawal' | 'deposit',
  amount: number,
  reason: string,
  notes?: string
): Promise<CashMovement> {
  return await recordCashMovement(sessionId, userId, type, amount, reason, notes);
}

export async function fetchSessionSummary(sessionId: number): Promise<CashSessionSummary> {
  return await getCashSessionSummary(sessionId);
}

export async function closeSessionAction(
  sessionId: number,
  closingAmountReal: number,
  notes?: string
): Promise<CashSession> {
  return await closeCashSession(sessionId, closingAmountReal, notes);
}

export async function fetchCashHistory(limit: number = 50): Promise<CashSession[]> {
  return await getCashSessionsHistory(limit);
}
