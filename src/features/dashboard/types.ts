export interface Pharmacy {
  name: string;
  address: string;
}

export interface Sale {
  id: string;
  client: string;
  products: string;
  amount: string;
  time: string;
  status: 'Payé' | 'Crédit';
}

export interface DashboardStats {
  todayRevenue: string;
  revenueChange: number;
  clientsServed: number;
  creditsGranted: string;
}
