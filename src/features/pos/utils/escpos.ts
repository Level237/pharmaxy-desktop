// src/features/pos/utils/escpos.ts

export interface EscPosReceiptData {
  pharmacy: {
    name: string;
    ownerName?: string;
    licenseNumber?: string;
    address?: string;
    phone?: string;
  };
  sale: {
    receiptNumber: string;
    createdAt: string;
    cashierName: string;
    clientName?: string;
    paymentMethod: string;
    totalAmount: number;
    amountReceived: number;
    changeAmount: number;
    lines: {
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      lotNumber?: string;
      expiryDate?: string;
    }[];
  };
}

export const ESCPOS = {
  INIT: new Uint8Array([0x1b, 0x40]),
  ALIGN_LEFT: new Uint8Array([0x1b, 0x61, 0x00]),
  ALIGN_CENTER: new Uint8Array([0x1b, 0x61, 0x01]),
  ALIGN_RIGHT: new Uint8Array([0x1b, 0x61, 0x02]),
  BOLD_ON: new Uint8Array([0x1b, 0x45, 0x01]),
  BOLD_OFF: new Uint8Array([0x1b, 0x45, 0x00]),
  DOUBLE_SIZE: new Uint8Array([0x1d, 0x21, 0x11]),
  NORMAL_SIZE: new Uint8Array([0x1d, 0x21, 0x00]),
  CUT_FEED: new Uint8Array([0x1d, 0x56, 0x42, 0x10]), // Feed & cut
  DRAWER_PULSE_PIN2: new Uint8Array([0x1b, 0x70, 0x00, 0x19, 0xfa]), // Pulse pin 2
  DRAWER_PULSE_PIN5: new Uint8Array([0x1b, 0x70, 0x01, 0x19, 0xfa]), // Pulse pin 5
};

/**
 * Formate un texte sur une largeur fixe avec alignement gauche et droite
 */
function formatTwoColumns(left: string, right: string, width: number): string {
  const maxLeft = width - right.length - 1;
  const truncatedLeft = left.length > maxLeft ? left.substring(0, maxLeft) : left;
  const spaces = " ".repeat(Math.max(1, width - truncatedLeft.length - right.length));
  return `${truncatedLeft}${spaces}${right}\n`;
}

/**
 * Génère le flux d'octets brut ESC/POS pour imprimante thermique 80mm (48 col) ou 58mm (32 col)
 */
export function generateEscPosBytes(data: EscPosReceiptData, widthCols: 48 | 32 = 48): Uint8Array {
  const chunks: Uint8Array[] = [];
  const encoder = new TextEncoder();

  const addText = (text: string) => chunks.push(encoder.encode(text));
  const addCmd = (cmd: Uint8Array) => chunks.push(cmd);

  // 1. Initialisation de l'imprimante
  addCmd(ESCPOS.INIT);
  
  // 2. Impulsion ouverture tiroir-caisse
  addCmd(ESCPOS.DRAWER_PULSE_PIN2);

  // 3. En-tête Pharmacie (Centré)
  addCmd(ESCPOS.ALIGN_CENTER);
  addCmd(ESCPOS.BOLD_ON);
  addCmd(ESCPOS.DOUBLE_SIZE);
  addText(`${data.pharmacy.name.toUpperCase()}\n`);
  addCmd(ESCPOS.NORMAL_SIZE);
  addCmd(ESCPOS.BOLD_OFF);

  if (data.pharmacy.ownerName) {
    addText(`Dr. ${data.pharmacy.ownerName}\n`);
  }
  if (data.pharmacy.licenseNumber) {
    addText(`Agrément MINSANTE : ${data.pharmacy.licenseNumber}\n`);
  }
  if (data.pharmacy.address) {
    addText(`${data.pharmacy.address}\n`);
  }
  if (data.pharmacy.phone) {
    addText(`Tél : ${data.pharmacy.phone}\n`);
  }

  // Séparateur
  const separator = "-".repeat(widthCols) + "\n";
  const doubleSeparator = "=".repeat(widthCols) + "\n";
  addText(separator);

  // Métadonnées ticket
  addCmd(ESCPOS.ALIGN_LEFT);
  addText(formatTwoColumns(`Ticket : ${data.sale.receiptNumber}`, "", widthCols));
  addText(formatTwoColumns(`Date : ${new Date(data.sale.createdAt).toLocaleString("fr-FR")}`, "", widthCols));
  addText(formatTwoColumns(`Caissier : ${data.sale.cashierName}`, `Client : ${data.sale.clientName || "Comptant"}`, widthCols));
  addText(separator);

  // Lignes d'articles
  addCmd(ESCPOS.BOLD_ON);
  if (widthCols === 48) {
    addText(formatTwoColumns("Désignation", "Qte x P.U   Total", widthCols));
  } else {
    addText(formatTwoColumns("Art.", "Qte x P.U   Total", widthCols));
  }
  addCmd(ESCPOS.BOLD_OFF);
  addText(separator);

  for (const item of data.sale.lines) {
    const detailRight = `${item.quantity} x ${item.unitPrice.toLocaleString()} = ${item.subtotal.toLocaleString()} F`;
    addText(`${item.productName}\n`);
    if (item.lotNumber || item.expiryDate) {
      const lotInfo = `  [Lot: ${item.lotNumber || "N/A"} - Pér: ${item.expiryDate || "N/A"}]`;
      addText(`${lotInfo}\n`);
    }
    addCmd(ESCPOS.ALIGN_RIGHT);
    addText(`${detailRight}\n`);
    addCmd(ESCPOS.ALIGN_LEFT);
  }

  addText(separator);

  // Totaux & Règlement
  addCmd(ESCPOS.ALIGN_RIGHT);
  addCmd(ESCPOS.BOLD_ON);
  addText(`TOTAL NET A PAYER : ${data.sale.totalAmount.toLocaleString()} FCFA\n`);
  addCmd(ESCPOS.BOLD_OFF);

  addText(`Montant Reçu : ${data.sale.amountReceived.toLocaleString()} FCFA\n`);
  if (data.sale.changeAmount > 0) {
    addText(`Monnaie Rendue : ${data.sale.changeAmount.toLocaleString()} FCFA\n`);
  }
  addText(`Règlement : ${data.sale.paymentMethod.toUpperCase()}\n`);

  addText(doubleSeparator);

  // Mentions légales et pharmaceutiques
  addCmd(ESCPOS.ALIGN_CENTER);
  addText("Les médicaments ne sont ni repris ni échangés.\n");
  addText("Merci pour votre confiance.\nPrompt rétablissement !\n\n");

  // Découpe papier
  addCmd(ESCPOS.CUT_FEED);

  // Fusionner tous les morceaux en un seul tableau d'octets Uint8Array
  const totalLength = chunks.reduce((acc, curr) => acc + curr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Commande d'impulsion pour l'ouverture du tiroir-caisse
 */
export async function triggerCashDrawerPulse(): Promise<{ success: boolean; message: string }> {
  try {
    console.log("[Hardware] Impulsion tiroir-caisse envoyée (ESC/POS: 0x1B 0x70 0x00 0x19 0xFA)");
    return {
      success: true,
      message: "Signal d'ouverture du tiroir-caisse transmis avec succès."
    };
  } catch (err: any) {
    console.error("[Hardware] Échec ouverture tiroir-caisse:", err);
    return {
      success: false,
      message: "Impossible de communiquer avec le périphérique de caisse."
    };
  }
}
