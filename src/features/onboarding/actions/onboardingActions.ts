import { savePharmacyLocally } from "../../../db/pharmacyQueries";
import { saveUserLocally } from "../../../db/userQueries";
import type { PharmacyData, AdminData } from "../types";

export async function submitOnboardingAction(pharmacyData: PharmacyData, adminData: AdminData) {
  const pharmacyUuid = crypto.randomUUID();
  const adminUuid = crypto.randomUUID();
  const apiToken = `pharmaxy_tok_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

  await savePharmacyLocally({
    uuid: pharmacyUuid,
    name: pharmacyData.name,
    address: pharmacyData.address,
    phone: pharmacyData.phone,
    owner_name: pharmacyData.ownerName,
    license_number: pharmacyData.licenseNumber,
    api_token: apiToken,
  });

  await saveUserLocally({
    uuid: adminUuid,
    name: adminData.name,
    pin_code: adminData.pinCode,
    role: "admin",
  });
}
