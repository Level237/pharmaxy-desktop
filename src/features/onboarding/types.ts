export interface PharmacyData {
  name: string;
  address: string;
  phone: string;
  ownerName: string;
  licenseNumber: string;
}

export interface AdminData {
  name: string;
  pinCode: string;
  confirmPinCode: string;
}

export type OnboardingStep = 0 | 1 | 2;
