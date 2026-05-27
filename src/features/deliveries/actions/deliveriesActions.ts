import type { Delivery, DeliveryStats } from "../types";

const MOCK_DELIVERIES: Delivery[] = [
  {
    id: "1",
    reference: "DLV-2024-001",
    supplierName: "UNIPhar",
    supplierType: "Grossiste National",
    date: "Aujourd'hui, 09:45",
    status: "REÇU",
    amount: 12450.00,
    itemsCount: 124,
    receivedBy: "Jean-Marc T."
  },
  {
    id: "2",
    reference: "DLV-2024-002",
    supplierName: "Pharmacie Centrale",
    supplierType: "Institutionnel",
    date: "Hier, 14:20",
    status: "REÇU",
    amount: 8500.50,
    itemsCount: 89,
    receivedBy: "Service Log."
  },
  {
    id: "3",
    reference: "DLV-2024-003",
    supplierName: "Laborex",
    supplierType: "Spécialiste Pharma",
    date: "Hier",
    status: "EN TRANSIT",
    amount: 15200.00,
    itemsCount: 210,
    receivedBy: "Direct Lab"
  },
  {
    id: "4",
    reference: "DLV-2024-004",
    supplierName: "EuroMed Supplies",
    supplierType: "International",
    date: "14 Oct 2023",
    status: "REÇU",
    amount: 6780.25,
    itemsCount: 45,
    receivedBy: "Service Log."
  },
  {
    id: "5",
    reference: "DLV-2024-005",
    supplierName: "Sanofi Distribution",
    supplierType: "Laboratoire",
    date: "Il y a 3h",
    status: "REÇU",
    amount: 25400.00,
    itemsCount: 562,
    receivedBy: "Amélie Laurent"
  }
];

const MOCK_STATS: DeliveryStats = {
  monthlyDeliveries: 248,
  percentageChange: 12,
  totalValue: 42850.00
};

export async function fetchDeliveries(): Promise<Delivery[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_DELIVERIES;
}

export async function fetchDeliveryStats(): Promise<DeliveryStats> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_STATS;
}
