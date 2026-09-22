// src/features/credits/actions/creditActions.ts
import {
    getCreditClients,
    getCreditKpis,
    getClientCreditLedger,
    recordDebtRepayment,
    CreditClientSummary,
    CreditKpis,
    ClientCreditLedger,
    RecordRepaymentInput,
    RepaymentReceiptData
} from "../../../db/creditQueries";

export async function fetchCreditClientsAction(filters?: {
    search?: string;
    statusFilter?: 'all' | 'overdue' | 'critical' | 'settled';
}): Promise<CreditClientSummary[]> {
    try {
        return await getCreditClients(filters);
    } catch (error) {
        console.error("Erreur fetchCreditClientsAction:", error);
        throw error;
    }
}

export async function fetchCreditKpisAction(): Promise<CreditKpis> {
    try {
        return await getCreditKpis();
    } catch (error) {
        console.error("Erreur fetchCreditKpisAction:", error);
        return {
            totalDebtAmount: 0,
            debtorCount: 0,
            overdueDebtAmount: 0,
            criticalDebtAmount: 0,
            totalRepaidThisMonth: 0
        };
    }
}

export async function fetchClientLedgerAction(clientId: number): Promise<ClientCreditLedger | null> {
    try {
        return await getClientCreditLedger(clientId);
    } catch (error) {
        console.error("Erreur fetchClientLedgerAction:", error);
        throw error;
    }
}

export async function submitDebtRepaymentAction(input: RecordRepaymentInput): Promise<RepaymentReceiptData> {
    try {
        return await recordDebtRepayment(input);
    } catch (error) {
        console.error("Erreur submitDebtRepaymentAction:", error);
        throw error;
    }
}
