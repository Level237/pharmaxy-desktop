// src/features/credits/types.ts
import { 
    CreditClientSummary, 
    CreditKpis, 
    ClientCreditLedger, 
    ClientCreditSaleItem, 
    ClientRepaymentItem,
    RecordRepaymentInput,
    RepaymentReceiptData 
} from "../../db/creditQueries";

export type {
    CreditClientSummary,
    CreditKpis,
    ClientCreditLedger,
    ClientCreditSaleItem,
    ClientRepaymentItem,
    RecordRepaymentInput,
    RepaymentReceiptData
};

export type CreditStatusFilter = 'all' | 'overdue' | 'critical' | 'settled';

export interface CreditFiltersState {
    search: string;
    statusFilter: CreditStatusFilter;
}
