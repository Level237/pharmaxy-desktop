import { ShoppingBag, Minus, Plus, Wallet, Smartphone, Banknote, Printer } from "lucide-react";
import { useState, useActionState } from "react";
import type { CartItem, PaymentMethod, SalePayload } from "../types";
import { createSaleAction } from "../actions/posActions";

interface CartSidebarProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  totalAmount: number;
  onClose: () => void;
  isOpen: boolean;
}

export function CartSidebar({ items, onUpdateQuantity, totalAmount, onClose, isOpen }: CartSidebarProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountReceived, setAmountReceived] = useState<string>('');

  const receivedNum = parseFloat(amountReceived) || 0;
  const change = Math.max(0, receivedNum - totalAmount);

  const [_, action, isPending] = useActionState(
    async (_prev: unknown) => {
      const payload: SalePayload = {
        items,
        totalAmount,
        paymentMethod,
        amountReceived: receivedNum,
        change
      };
      await createSaleAction(payload);
      return { success: true };
    },
    null
  );

  if (!isOpen) return null;

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#587dff] rounded-xl flex items-center justify-center text-white">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <h2 className="font-bold text-lg text-[#0F172A]">Panier Actuel</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#587dff] text-white px-3 py-1 rounded-full text-xs font-black">
            {items.length} ARTICLES
          </span>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] p-2">
            <Plus className="h-6 w-6 rotate-45" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#94A3B8]">
            <ShoppingBag className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-medium text-sm">Le panier est vide</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-slate-50 p-4 rounded-2xl border border-[#E2E8F0] flex items-center gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[#0F172A] mb-0.5">{item.name}</h4>
                <p className="text-[11px] text-[#64748B]">{item.selling_price.toLocaleString()} F / unité</p>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg border border-[#E2E8F0] p-1">
                <button
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="p-1 hover:bg-slate-100 rounded text-[#64748B]"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-sm font-black">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="p-1 hover:bg-slate-100 rounded text-[#64748B]"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <div className="text-right w-20">
                <span className="text-sm font-black text-[#0F172A]">{(item.selling_price * item.quantity).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 border-t border-[#587dff] bg-white space-y-6">
        <div className="flex justify-between items-end">
          <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider">TOTAL À PAYER</span>
          <div className="text-right">
            <span className="text-4xl font-black text-[#0F172A]">{totalAmount.toLocaleString()}</span>
            <span className="text-sm font-bold ml-1 text-[#0F172A]">FCFA</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1.5 block">MONTANT REÇU</label>
            <input
              type="number"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              className="w-full bg-slate-50 border border-[#587dff] rounded-xl py-3 px-4 font-black text-lg focus:ring-2 focus:ring-[#587dff]/20 focus:border-[#587dff] outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1.5 block">RENDU MONNAIE</label>
            <div className="w-full bg-emerald-50 border border-emerald-100 rounded-xl py-3 px-4 font-black text-lg text-emerald-600 flex items-center justify-end">
              {change.toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-[#64748B] uppercase mb-3 block">MODE DE PAIEMENT</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cash' as PaymentMethod, icon: Banknote, label: 'Espèces' },
              { id: 'mobile_money' as PaymentMethod, icon: Smartphone, label: 'Mobile' },
              { id: 'credit' as PaymentMethod, icon: Wallet, label: 'Crédit' },
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${paymentMethod === method.id
                  ? "bg-[#587dff] border-[#587dff] text-white shadow-lg "
                  : "bg-slate-50 border-[#E2E8F0] text-[#64748B] hover:bg-slate-100"
                  }`}
              >
                <method.icon className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-bold">{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form action={action}>
          <button
            type="submit"
            disabled={isPending || items.length === 0}
            className="w-full bg-[#587dff] hover:bg-[#587dff] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isPending ? "Traitement..." : (
              <>
                <span>Valider la vente</span>
                <Printer className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </aside>
  );
}
