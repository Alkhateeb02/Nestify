import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Landmark, TrendingUp, Receipt, Users, Clock, CheckCircle } from "lucide-react";
import api from "../../utils/api";

export default function LandlordFinancialsView({ isAr, t, viewportVariants }) {
  const [logs, setLogs] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get("/payments/logs");
        if (response.success && response.data) {
          setLogs(response.data);
        }
      } catch (err) {
        console.error("Failed to load landlord financial logs:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchLogs();
  }, []);

  const handleMarkPaid = async (paymentId) => {
    try {
      const generatedTxn = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const res = await api.post(`/payments/${paymentId}/pay`, {
        transactionId: generatedTxn,
        paymentMethod: 'cash'
      });
      if (res.success) {
        setLogs(prev => prev.map(l => {
          if (l.id === paymentId || l.paymentID === paymentId || l.payment_id === paymentId) {
            return { ...l, status: 'received', transaction_id: generatedTxn, transactionId: generatedTxn };
          }
          return l;
        }));
      }
    } catch (err) {
      console.error("Failed to mark payment as paid:", err);
      alert(isAr ? "فشل تحديث حالة الدفع." : "Failed to mark payment as paid.");
    }
  };

  const completedTxns = logs.filter(l => {
    const s = (l.status || "").toLowerCase();
    return s === "completed" || s === "paid" || s === "received";
  });
  const pendingTxns = logs.filter(l => {
    const s = (l.status || "").toLowerCase();
    return s === "pending" || s === "pending payment" || s === "pending_payment";
  });

  // Calculations
  const grossRevenue = completedTxns.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0);
  const pendingRevenues = pendingTxns.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0);
  const activeTenants = new Set(logs.map(l => l.studentName)).size;

  const cardCls = "p-6 rounded-[2.2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-[0_16px_32px_-12px_rgba(0,0,0,0.03)] flex items-center justify-between";

  return (
    <motion.div
      key="landlord-financials"
      variants={viewportVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 text-start"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-lime-500/10 dark:bg-lime-500/20 flex items-center justify-center text-lime-600 dark:text-lime-400">
          <DollarSign size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "التقارير المالية والأرباح" : "Financials & Profits"}
          </h2>
          <p className="text-slate-500 text-sm">
            {isAr ? "تابع العوائد المالية، الأرباح، وسجل التحصيلات النقدية من عقاراتك" : "Monitor rental payouts, gross earnings, and incoming tenant deposits"}
          </p>
        </div>
      </div>

      {fetching ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-lime-500/20 border-t-lime-500 rounded-full animate-spin mb-4" />
          <p className="text-xs font-bold text-slate-400">
            {isAr ? "جاري احتساب الدفاتر والميزانيات..." : "Calculating ledger metrics..."}
          </p>
        </div>
      ) : (
        <>
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Net Profits */}
            <div className={cardCls}>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <TrendingUp size={12} className="text-lime-500" />
                  {isAr ? "إجمالي الأرباح" : "Net Profits"}
                </p>
                <h3 className="text-3xl font-black text-slate-950 dark:text-white flex items-baseline gap-1">
                  {grossRevenue.toFixed(2)}
                  <span className="text-xs font-bold text-slate-400">JOD</span>
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-lime-500/10 flex items-center justify-center text-lime-500">
                <DollarSign size={22} />
              </div>
            </div>

            {/* Pending Payouts */}
            <div className={cardCls}>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={12} className="text-orange-400" />
                  {isAr ? "مستحقات معلقة" : "Pending Payouts"}
                </p>
                <h3 className="text-3xl font-black text-slate-950 dark:text-white flex items-baseline gap-1">
                  {pendingRevenues.toFixed(2)}
                  <span className="text-xs font-bold text-slate-400">JOD</span>
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Landmark size={22} />
              </div>
            </div>

            {/* Total Paid Invoices count */}
            <div className={cardCls}>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Users size={12} className="text-blue-500" />
                  {isAr ? "المستأجرين النشطين" : "Active Tenants"}
                </p>
                <h3 className="text-3xl font-black text-slate-950 dark:text-white flex items-baseline gap-1">
                  {activeTenants}
                  <span className="text-xs font-bold text-slate-400">{isAr ? "طلاب" : "Students"}</span>
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Users size={22} />
              </div>
            </div>
          </div>

          {/* Ledger Table logs */}
          <div className="space-y-3">
            <h3 className="text-md font-black text-slate-950 dark:text-white flex items-center gap-2">
              <Receipt size={16} className="text-slate-400" />
              {isAr ? "تفاصيل التحصيلات والمعاملات" : "Income Transaction Ledger"}
            </h3>
            {logs.length === 0 ? (
              <div className="p-12 rounded-2xl bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 text-center text-slate-400 text-xs">
                {isAr ? "لا توجد أي معاملات مسجلة لعقاراتك حالياً." : "No rental transactions recorded on your properties."}
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-150 dark:border-white/5 rounded-2xl bg-white dark:bg-white/[0.02]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-5 py-3">{isAr ? "المستأجر" : "Tenant"}</th>
                        <th className="px-5 py-3">{isAr ? "العقار" : "Property"}</th>
                        <th className="px-5 py-3">{isAr ? "المبلغ" : "Amount"}</th>
                        <th className="px-5 py-3">{isAr ? "طريقة الدفع" : "Method"}</th>
                        <th className="px-5 py-3">{isAr ? "رقم المرجع" : "Ref / Txn"}</th>
                        <th className="px-5 py-3 text-right">{isAr ? "الحالة" : "Status"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-bold">
                      {logs.map(l => {
                        const sLower = (l.status || "").toLowerCase();
                        const isCompleted = sLower === "completed" || sLower === "paid" || sLower === "received";
                        const isReceived = sLower === "received";
                        const mLower = (l.paymentMethod || '').toLowerCase();
                        const isCard = mLower.includes('visa') || mLower.includes('card') || mLower.includes('credit');
                        const methodText = isCard 
                          ? (isAr ? "بطاقة ائتمان" : "Credit Card") 
                          : (mLower.includes('cash') ? (isAr ? "نقدي" : "Cash") : "—");

                        return (
                          <tr key={l.id || l.paymentID} className="text-slate-700 dark:text-slate-300">
                            <td className="px-5 py-4 text-slate-950 dark:text-white">{l.studentName || "Ahmad Student"}</td>
                            <td className="px-5 py-4 font-semibold text-slate-500">{l.propertyTitle || "Property"}</td>
                            <td className="px-5 py-4 text-slate-950 dark:text-white">{parseFloat(l.amount).toFixed(2)} JOD</td>
                            <td className="px-5 py-4 text-slate-950 dark:text-white font-medium">{methodText}</td>
                            <td className="px-5 py-4 font-mono text-[11px] text-slate-400">{l.transaction_id || l.transactionId || "PENDING-CLR"}</td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-black border ${
                                  isCompleted
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                }`}>
                                  {isReceived 
                                    ? (isAr ? "مستلمة" : "Received") 
                                    : (isCompleted ? (isAr ? "مدفوعة" : "Cleared") : (isAr ? "مستحقة" : "Pending"))}
                                </span>
                                {!isCompleted && (
                                  <button
                                    onClick={() => handleMarkPaid(l.id)}
                                    className="px-2 py-1 text-[9px] font-black rounded bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm transition-all"
                                  >
                                    {isAr ? "تأكيد الدفع" : "Mark Paid"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
