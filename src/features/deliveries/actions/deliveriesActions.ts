// src/features/deliveries/actions/deliveriesActions.ts
import {
    getDeliveries,
    getDeliveryStats,
    getSuppliers,
    getDeliveryById,
    createDeliveryTransaction,
    createSupplier,
    getPriceComparison,
    DeliverySummary,
    DeliveryDetail,
    SupplierEntity,
    DeliveryKpis,
    CreateDeliveryInput,
    SupplierProductPriceComparison
} from "../../../db/deliveryQueries";

export async function fetchDeliveries(filters?: {
    supplierId?: number;
    search?: string;
    status?: string;
}): Promise<DeliverySummary[]> {
    try {
        return await getDeliveries(filters);
    } catch (error) {
        console.error("Erreur fetchDeliveries:", error);
        return [];
    }
}

export async function fetchDeliveryStats(): Promise<DeliveryKpis> {
    try {
        return await getDeliveryStats();
    } catch (error) {
        console.error("Erreur fetchDeliveryStats:", error);
        return {
            monthlyDeliveriesCount: 0,
            monthlyTotalValue: 0,
            activeSuppliersCount: 0,
            totalProductsSupplied: 0
        };
    }
}

export async function fetchSuppliers(): Promise<SupplierEntity[]> {
    try {
        return await getSuppliers();
    } catch (error) {
        console.error("Erreur fetchSuppliers:", error);
        return [];
    }
}

export async function fetchDeliveryDetail(id: number): Promise<DeliveryDetail | null> {
    try {
        return await getDeliveryById(id);
    } catch (error) {
        console.error("Erreur fetchDeliveryDetail:", error);
        return null;
    }
}

export async function createDeliveryAction(input: CreateDeliveryInput): Promise<DeliveryDetail> {
    try {
        return await createDeliveryTransaction(input);
    } catch (error) {
        console.error("Erreur createDeliveryAction:", error);
        throw error;
    }
}

export async function createSupplierAction(data: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    contactPerson?: string;
}): Promise<SupplierEntity> {
    try {
        return await createSupplier(data);
    } catch (error) {
        console.error("Erreur createSupplierAction:", error);
        throw error;
    }
}

export async function fetchPriceComparisonAction(productId?: number): Promise<SupplierProductPriceComparison[]> {
    try {
        return await getPriceComparison(productId);
    } catch (error) {
        console.error("Erreur fetchPriceComparisonAction:", error);
        return [];
    }
}
