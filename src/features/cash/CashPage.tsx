// src/features/cash/CashPage.tsx
import { useState, useEffect, useTransition, use } from "react";
import { 
  Coins, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Lock, 
  History, 
  RefreshCw, 
  PlusCircle, 
  FileText, 
  TrendingUp, 
  Smartphone,
  Clock
} from "lucide-react";
import { Layout } from "../../shared/components/Layout";
import { AuthContext } from "../../shared/context/AuthContext";
import { 
  fetchActiveCashSession, 
  fetchSessionSummary, 
  fetchCashHistory 
} from "./actions/cashActions";
import { OpenCashSessionModal } from "./components/OpenCashSessionModal";
import { CashMovementModal } from "./components/CashMovementModal";
import { CloseCashSessionModal } from "./components/CloseCashSessionModal";
import { CashZReceiptModal } from "./components/CashZReceiptModal";
import type { CashSession, CashSessionSummary } from "./types";

export function CashPage() {
  const auth = use(AuthContext);
  const currentUserId = auth?.user?.id || 1;
  const currentUserName = auth?.user?.name || "Caissier";

  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [session, setSession] = useState<CashSession | null>(null);
  const [summary, setSummary] = useState<CashSessionSummary | null>(null);
  const [history, setHistory] = useState<CashSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modals
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementDefaultType, setMovementDefaultType] = useState<'withdrawal' | 'deposit'>('withdrawal');
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [ticketZSession, setTicketZSession] = useState<CashSession | null>(null);
  const [ticketZSummary, setTicketZSummary] = useState<CashSessionSummary | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const active = await fetchActiveCashSession(currentUserId);
      setSession(active);

      if (active) {
        const sum = await fetchSessionSummary(active.id);
        setSummary(sum);
      } else {
        setSummary(null);
      }

      const hist = await fetchCashHistory(50);
      setHistory(hist);
    } catch (err) {
      console.error("Erreur chargement module caisse:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const handleOpenMovement = (type: 'withdrawal' | 'deposit') => {
    setMovementDefaultType(type);
    setIsMovementModalOpen(true);
  };

  const handleClosedSuccess = (closedSession: CashSession, closedSummary: CashSessionSummary) => {
    setTicketZSession(closedSession);
    setTicketZSummary(closedSummary);
    loadData();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête de la page */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2720ff] text-white flex items-center justify-center shadow-lg shadow-[#2720ff]/20">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Caisse & Clôtures Journalières
              </h1>
              <p className="text-xs text-slate-500 font-semibold">
                Gestion des fonds de caisse, mouvements d'espèces et tickets Z officiels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs"
              title="Actualiser les données"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#2720ff]" : ""}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Navigation par Onglets */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
          <button
            type="button"
            onClick={() => startTransition(() => setActiveTab('current'))}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'current'
                ? "border-[#2720ff] text-[#2720ff] bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Session de Caisse Active</span>
            {session && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
          <button
            type="button"
            onClick={() => startTransition(() => setActiveTab('history'))}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'history'
                ? "border-[#2720ff] text-[#2720ff] bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historique des Clôtures ({history.length})</span>
          </button>
        </div>

        {/* ONGLET 1 : SESSION ACTIVE */}
        {activeTab === 'current' && (
          <div className={`space-y-6 transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}>
            {!session ? (
              /* Aucune session ouverte */
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto my-8 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Coins className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    Aucune session de caisse ouverte
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Pour enregistrer des ventes dans le POS et encaisser des paiements, veuillez ouvrir la caisse avec votre fond initial.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpenModalOpen(true)}
                  className="px-6 py-3 text-sm font-bold text-white bg-[#2720ff] hover:bg-[#201ac9] rounded-xl shadow-md shadow-[#2720ff]/25 transition-all inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Ouvrir une Caisse</span>
                </button>
              </div>
            ) : (
              /* Session Ouverte */
              <>
                {/* Bandeau d'état et Actions Rapides */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          Session #{session.id.toString().padStart(5, "0")}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-emerald-100 text-emerald-800">
                          Ouverte
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Ouverte le {session.opened_at.replace("T", " ").substring(0, 16)} par {session.user_name || currentUserName}
                      </p>
                    </div>
                  </div>

                  {/* Boutons d'actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleOpenMovement('withdrawal')}
                      className="px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <ArrowDownCircle className="w-4 h-4" />
                      <span>Sortie de Caisse</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenMovement('deposit')}
                      className="px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      <span>Apport d'Espèces</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCloseModalOpen(true)}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Clôturer la Caisse (Z)</span>
                    </button>
                  </div>
                </div>

                {/* Cartes Métriques */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Espèces Théoriques */}
                  <div className="bg-[#2720ff] text-white p-5 rounded-2xl shadow-md shadow-[#2720ff]/20">
                    <div className="flex items-center justify-between opacity-80 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Espèces en Tiroir</span>
                      <Coins className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">
                      {(summary?.expectedCash || 0).toLocaleString("fr-FR")}
                      <span className="text-sm font-semibold opacity-80 ml-1">FCFA</span>
                    </h2>
                    <p className="text-[11px] opacity-75 mt-1">
                      Fond : {(summary?.openingAmount || 0).toLocaleString("fr-FR")} F • Ventes : +{(summary?.cashSales || 0).toLocaleString("fr-FR")} F
                    </p>
                  </div>

                  {/* Chiffre d'Affaires Global */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Chiffre d'Affaires</span>
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">
                      {(summary?.totalSales || 0).toLocaleString("fr-FR")}
                      <span className="text-sm font-semibold text-slate-400 ml-1">FCFA</span>
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {summary?.salesCount || 0} vente(s) réalisée(s)
                    </p>
                  </div>

                  {/* Mobile Money & Carte */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Mobile Money / Carte</span>
                      <Smartphone className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">
                      {((summary?.momoSales || 0) + (summary?.cardSales || 0)).toLocaleString("fr-FR")}
                      <span className="text-sm font-semibold text-slate-400 ml-1">FCFA</span>
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-1">
                      MoMo : {(summary?.momoSales || 0).toLocaleString("fr-FR")} F • Carte : {(summary?.cardSales || 0).toLocaleString("fr-FR")} F
                    </p>
                  </div>

                  {/* Sorties / Décaissements */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Décaissements</span>
                      <ArrowDownCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <h2 className="text-2xl font-black text-rose-600">
                      {(summary?.withdrawals || 0).toLocaleString("fr-FR")}
                      <span className="text-sm font-semibold text-slate-400 ml-1">FCFA</span>
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Dépenses courantes déduites
                    </p>
                  </div>
                </div>

                {/* Tableau des Mouvements d'Espèces de la Session */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Mouvements de Caisse de la Session ({(summary?.movements || []).length})
                    </h3>
                  </div>

                  {(!summary?.movements || summary.movements.length === 0) ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Aucun mouvement d'espèces enregistré sur cette session.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Motif</th>
                            <th className="px-6 py-3">Bénéficiaire / Réf</th>
                            <th className="px-6 py-3">Heure</th>
                            <th className="px-6 py-3 text-right">Montant</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {summary.movements.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50/80">
                              <td className="px-6 py-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  m.type === 'withdrawal'
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-emerald-50 text-emerald-700"
                                }`}>
                                  {m.type === 'withdrawal' ? (
                                    <>
                                      <ArrowDownCircle className="w-3 h-3" />
                                      <span>Décaissement</span>
                                    </>
                                  ) : (
                                    <>
                                      <ArrowUpCircle className="w-3 h-3" />
                                      <span>Dépôt</span>
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-3 font-semibold text-slate-900">{m.reason}</td>
                              <td className="px-6 py-3 text-slate-500">{m.notes || "—"}</td>
                              <td className="px-6 py-3 text-slate-500">
                                {m.created_at.substring(11, 16)}
                              </td>
                              <td className="px-6 py-3 text-right font-bold">
                                <span className={m.type === 'withdrawal' ? "text-rose-600" : "text-emerald-600"}>
                                  {m.type === 'withdrawal' ? "-" : "+"}
                                  {m.amount.toLocaleString("fr-FR")} FCFA
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ONGLET 2 : HISTORIQUE DES CLÔTURES */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Historique des Sessions Clôturées ({history.length})
              </h3>
            </div>

            {history.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                Aucune clôture de caisse passée n'a été trouvée.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Session</th>
                      <th className="px-6 py-3">Caissier</th>
                      <th className="px-6 py-3">Date Ouverture / Clôture</th>
                      <th className="px-6 py-3 text-right">Fond Initial</th>
                      <th className="px-6 py-3 text-right">Espèces Réelles</th>
                      <th className="px-6 py-3 text-right">Écart</th>
                      <th className="px-6 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {history.map((h) => {
                      const diff = h.difference ?? 0;
                      return (
                        <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-3 font-bold text-slate-900">
                            #{h.id.toString().padStart(5, "0")}
                          </td>
                          <td className="px-6 py-3 font-semibold text-slate-800">
                            {h.user_name || "Caissier"}
                          </td>
                          <td className="px-6 py-3 text-slate-500 leading-tight">
                            <div>{h.opened_at.replace("T", " ").substring(0, 16)}</div>
                            <div className="text-[10px] text-slate-400">
                              au {h.closed_at ? h.closed_at.replace("T", " ").substring(0, 16) : "—"}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right font-medium">
                            {h.opening_amount.toLocaleString("fr-FR")} F
                          </td>
                          <td className="px-6 py-3 text-right font-bold text-slate-900">
                            {(h.closing_amount_real || 0).toLocaleString("fr-FR")} F
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              diff === 0
                                ? "bg-emerald-50 text-emerald-700"
                                : diff < 0
                                ? "bg-rose-50 text-rose-700"
                                : "bg-blue-50 text-blue-700"
                            }`}>
                              {diff === 0 ? "0 F (Conforme)" : `${diff > 0 ? "+" : ""}${diff.toLocaleString("fr-FR")} F`}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setTicketZSession(h);
                                setTicketZSummary(null);
                              }}
                              className="px-3 py-1.5 text-[11px] font-bold text-[#2720ff] hover:bg-[#2720ff]/10 rounded-lg transition-colors inline-flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Ticket Z</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODALS */}
        <OpenCashSessionModal
          isOpen={isOpenModalOpen}
          onClose={() => setIsOpenModalOpen(false)}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onSuccess={() => {
            loadData();
            setIsOpenModalOpen(false);
          }}
        />

        {session && (
          <CashMovementModal
            isOpen={isMovementModalOpen}
            onClose={() => setIsMovementModalOpen(false)}
            sessionId={session.id}
            currentUserId={currentUserId}
            defaultType={movementDefaultType}
            onSuccess={loadData}
          />
        )}

        {session && (
          <CloseCashSessionModal
            isOpen={isCloseModalOpen}
            onClose={() => setIsCloseModalOpen(false)}
            session={session}
            onSuccess={handleClosedSuccess}
          />
        )}

        {ticketZSession && (
          <CashZReceiptModal
            isOpen={!!ticketZSession}
            onClose={() => {
              setTicketZSession(null);
              setTicketZSummary(null);
            }}
            session={ticketZSession}
            summary={ticketZSummary}
          />
        )}
      </div>
    </Layout>
  );
}
