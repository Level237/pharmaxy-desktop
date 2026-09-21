export interface Product {
  id: number;
  uuid: string;
  name: string;
  dci: string;
  form: string;
  dosage: string;
  packaging: string;
  barcode: string;
  selling_price: number;
  min_stock_alert: number;
  category: string;
  stock_quantity?: number; // Calculé en temps réel depuis 'lots'
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = 'cash' | 'mobile_money' | 'credit';

export interface SalePayload {
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountReceived: number;
  change: number;
  discountAmount?: number;
  clientId?: number | null;
  userId?: number;
  notes?: string;
}

export interface SaleSuccessData {
  saleId: number;
  receiptNumber: string;
  totalAmount: number;
  changeAmount: number;
  itemsCount: number;
  createdAt: string;
}
