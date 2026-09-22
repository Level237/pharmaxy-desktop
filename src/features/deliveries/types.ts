// src/features/deliveries/types.ts
import { 
    SupplierEntity, 
    DeliverySummary, 
    DeliveryDetail, 
    DeliveryItemInput, 
    CreateDeliveryInput, 
    DeliveryKpis, 
    SupplierProductPriceComparison 
} from "../../db/deliveryQueries";

export type {
    SupplierEntity,
    DeliverySummary,
    DeliveryDetail,
    DeliveryItemInput,
    CreateDeliveryInput,
    DeliveryKpis,
    SupplierProductPriceComparison
};

// Aliases pour compatibilité
export type Delivery = DeliverySummary;
export type Supplier = SupplierEntity;
export type DeliveryStats = DeliveryKpis;

export interface DeliveryFiltersState {
    supplierId?: number;
    search: string;
    status: string;
}
