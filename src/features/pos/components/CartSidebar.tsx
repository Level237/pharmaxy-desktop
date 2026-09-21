import { ShoppingBag, Minus, Plus, Trash2, Wallet, Smartphone, Banknote, Printer, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { useState, useActionState } from "react";
import type { CartItem, PaymentMethod, SalePayload, SaleSuccessData } from "../types";
import { createSaleAction } from "../actions/posActions";

interface CartSidebarProps {
  items: CartItem[];
  cartError: string | null;
  onClearError: () => void;
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  totalAmount: number;
  onClose: () => void;
  isOpen: boolean;
  onSaleSuccess?: (saleData: SaleSuccessData) => void;
  onOpenReceipt?: (saleId: number) => void;
}

export function CartSidebar({
  items,
  cartError,
  onClearError,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  totalAmount,
  onClose,
  isOpen,
  onSaleSuccess,
  onOpenReceipt
}: CartSidebarProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [lastSale, setLastSale] = useState<SaleSuccessData | null>(null);

  const receivedNum = parseFloat(amountReceived) || 0;
  const change = Math.max(0, receivedNum - totalAmount);

  // Utilisation de useActionState (React 19) pour la transaction de vente asynchrone
  const [actionError, submitAction, isPending] = useActionState(
    async (_prev: string | null): Promise<string | null> => {
      try {
        if (paymentMethod === 'cash' && receivedNum < totalAmount) {
          return `Le montant reçu (${receivedNum.toLocaleString()} F) est inférieur au total (${totalAmount.toLocaleString()} F).`;
        }

        const payload: SalePayload = {
          items,
          totalAmount,
          paymentMethod,
          amountReceived: paymentMethod === 'cash' ? receivedNum : totalAmount,
          change: paymentMethod === 'cash' ? change : 0
        };

        const result = await createSaleAction(payload);
        setLastSale(result);
        onClearCart();
        onSaleSuccess?.(result);
        return null;
      } catch (err: any) {
        console.error("Erreur détaillée lors de la vente:", err);
        const errorMsg = typeof err === 'string'
          ? err
          : err?.message || (typeof err === 'object' ? JSON.stringify(err) : "Erreur lors de l'enregistrement de la vente.");
        return errorMsg;
      }
    },
    null
  );

  const handleQuickCash = (amt: number) => {
    setAmountReceived(amt.toString());
  };

  const handleResetForNewSale = () => {
    setLastSale(null);
    setAmountReceived('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-white shadow-2xl z-50 flex flex-col font-sans animate-in slide-in-from-right duration-300">
      
      {/* 1. En-tête du panier */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#2720ff] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#2720ff]/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900">Encaissement Caisse</h2>
            <p className="text-xs text-slate-500">Validation de la commande</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={onClearCart}
              title="Vider le panier"
              className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <Plus className="h-5 w-5 rotate-45" />
          </button>
        </div>
      </div>

      {/* 2. Message de succès après vente */}
      {lastSale ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-emerald-50/40">
          <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6 shadow-md">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full uppercase tracking-wider mb-2">
            Vente Enregistrée
          </span>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">
            N° {lastSale.receiptNumber}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Stock mis à jour automatiquement (Règle FEFO).
          </p>

          {/* Récapitulatif ticket */}
          <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Articles vendus :</span>
              <span className="font-bold text-slate-900">{lastSale.itemsCount}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Montant Total :</span>
              <span className="font-bold text-[#2720ff] text-base">{lastSale.totalAmount.toLocaleString()} FCFA</span>
            </div>
            {lastSale.changeAmount > 0 && (
              <div className="flex justify-between border-t border-slate-100 pt-2 text-emerald-700 font-bold">
                <span>Monnaie rendue :</span>
                <span>{lastSale.changeAmount.toLocaleString()} FCFA</span>
              </div>
            )}
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => {
                if (onOpenReceipt && lastSale) {
                  onOpenReceipt(lastSale.saleId);
                } else {
                  window.print();
                }
              }}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer / Voir le Reçu Officiel</span>
            </button>

            <button
              onClick={handleResetForNewSale}
              className="w-full py-3.5 bg-[#2720ff] hover:bg-[#1f19cc] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#2720ff]/20 transition-all active:scale-98"
            >
              <span>Nouvelle Vente</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Alerte Erreur Stock ou Vente */}
          {(cartError || actionError) && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs font-semibold">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{cartError || actionError}</p>
              </div>
              <button 
                onClick={onClearError} 
                className="text-red-400 hover:text-red-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* 3. Liste des articles dans le panier */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ShoppingBag className="h-16 w-16 mb-4 opacity-30 stroke-[1.5]" />
                <p className="font-bold text-base text-slate-500">Le panier est vide</p>
                <p className="text-xs text-slate-400 mt-1 text-center max-w-xs">
                  Sélectionnez des articles dans le catalogue ou scannez leur code-barres.
                </p>
              </div>
            ) : (
              items.map(item => (
                <div 
                  key={item.id} 
                  className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3 transition-all hover:bg-slate-50"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.selling_price.toLocaleString()} FCFA × {item.quantity}
                    </p>
                  </div>

                  {/* Contrôles Quantité */}
                  <div className="flex items-center gap-1.5 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                      title="Diminuer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                      title="Augmenter"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="text-right pl-2">
                    <span className="text-sm font-bold text-slate-900 block">
                      {(item.selling_price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-[10px] text-red-500 hover:underline font-semibold mt-0.5"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 4. Section Règlement & Validation */}
          <div className="p-6 border-t border-slate-200 bg-white space-y-5">
            
            {/* Montant Total */}
            <div className="flex justify-between items-baseline bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Total à payer
              </span>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-[#2720ff]">
                  {totalAmount.toLocaleString()}
                </span>
                <span className="text-sm font-bold ml-1.5 text-slate-700">FCFA</span>
              </div>
            </div>

            {/* Mode de règlement */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block tracking-wider">
                Mode de règlement
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cash' as PaymentMethod, icon: Banknote, label: 'Espèces' },
                  { id: 'mobile_money' as PaymentMethod, icon: Smartphone, label: 'Orange / MTN' },
                  { id: 'credit' as PaymentMethod, icon: Wallet, label: 'À Crédit' },
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method.id);
                      if (method.id !== 'cash') setAmountReceived(totalAmount.toString());
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border font-bold transition-all ${
                      paymentMethod === method.id
                        ? "bg-[#2720ff] border-[#2720ff] text-white shadow-md shadow-[#2720ff]/25"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <method.icon className="h-4 w-4 mb-1" />
                    <span className="text-[11px]">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Espèces : Montant reçu & Monnaie */}
            {paymentMethod === 'cash' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Montant reçu (FCFA)
                    </label>
                    <input
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 font-bold text-base text-slate-900 focus:bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-none transition-all"
                      placeholder={totalAmount > 0 ? totalAmount.toString() : "0"}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Rendu monnaie
                    </label>
                    <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl py-2.5 px-3 font-bold text-base text-emerald-700 flex items-center justify-end">
                      {change.toLocaleString()} FCFA
                    </div>
                  </div>
                </div>

                {/* Boutons d'accès rapide billets FCFA */}
                {totalAmount > 0 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    <button
                      type="button"
                      onClick={() => handleQuickCash(totalAmount)}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      Montant exact
                    </button>
                    {[1000, 2000, 5000, 10000].map(cash => (
                      <button
                        key={cash}
                        type="button"
                        onClick={() => handleQuickCash(cash)}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        {cash.toLocaleString()} F
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bouton de validation final */}
            <form action={submitAction}>
              <button
                type="submit"
                disabled={isPending || items.length === 0}
                className="w-full bg-[#2720ff] hover:bg-[#1f19cc] text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#2720ff]/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isPending ? (
                  <span>Validation & décrémentation des stocks...</span>
                ) : (
                  <>
                    <span>Valider & Encaisser la Vente</span>
                    <Printer className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </>
      )}
    </aside>
  );
}
