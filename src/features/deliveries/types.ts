export interface Delivery {
  id: string;
  reference: string;
  supplierName: string;
  supplierType: string;
  date: string;
  status: 'REÇU' | 'EN TRANSIT' | 'ANNULÉ' | 'EN ATTENTE';
  amount: number;
  itemsCount: number;
  receivedBy?: string;
}

export interface Supplier {
  id: string;
  name: string;
  type: string;
  totalDeliveries: number;
  lastContact: string;
  logo?: string;
}

export interface DeliveryStats {
  monthlyDeliveries: number;
  percentageChange: number;
  totalValue: number;
}
