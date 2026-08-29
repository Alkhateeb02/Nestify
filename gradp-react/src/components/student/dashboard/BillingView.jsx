import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, ShieldCheck, Landmark, CheckCircle, Clock, Receipt, Sparkles } from "lucide-react";
import api from "../../../utils/api";

export default function BillingView({ booking, isAr, viewportVariants }) {
  const [payments, setPayments] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [activePayment, setActivePayment] = useState(null); // Selected invoice for checkout modal
  const [processing, setProcessing] = useState(false);

  // CC Input Form State
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const fetchPayments = async () => {
    setFetching(true);
    try {
      const response = await api.get("/payments/logs");
      if (response.success && response.data) {
        setPayments(response.data);
      }
    } catch (err) {
      console.error("Failed to load payment logs:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!activePayment) return;
    setProcessing(true);
    try {
      // Simulate random unique transaction ID
      const fakeTransactionId = "TXN-" + Math.random().toString(36).substring(2, 11).toUpperCase();
      const response = await api.post(`/payments/${activePayment.id}/pay`, {
        transactionId: fakeTransactionId,
        paymentMethod: "visa",
        cardholderName: cardName,
        cardNumber: cardNumber,
        expiryDate: expiry,
        cvv: cvv,
        bankName: "Student Bank"
      });
      if (response.success) {
        alert(isAr ? "تمت عملية الدفع بنجاح!" : "Payment processed successfully!");
        setActivePayment(null);
        // Clear CC fields
        setCardName("");
        setCardNumber("");
        setExpiry("");
        setCvv("");
        fetchPayments();
      }
    } catch (err) {
      console.error("Payment submission failed:", err);
      alert(isAr ? "فشلت عملية الدفع. يرجى المحاولة لاحقاً." : "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const pendingPayments = payments.filter(p => {
    const s = (p.status || "").toLowerCase();
    return s === "pending" || s === "pending payment" || s === "pending_payment";
  });
  const completedPayments = payments.filter(p => {
    const s = (p.status || "").toLowerCase();
    return s === "completed" || s === "paid" || s === "received";
  });

  const cardInputCls = "w-full px-4 py-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-violet-500 dark:focus:border-lime-400 text-slate-900 dark:text-white transition-all";

  return (
    <motion.div
      key="billing"
      variants={viewportVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 text-start"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
          <CreditCard size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "الفواتير والمدفوعات" : "Billing & Payments"}
          </h2>
          <p className="text-slate-500 text-sm">
            {isAr ? "تابع التزاماتك المالية وسدد الإيجار بكل أمان وسهولة" : "Manage your monthly rent payments and financial history securely"}
          </p>
        </div>
      </div>

      {fetching ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4" />
          <p className="text-xs font-bold text-slate-400">
            {isAr ? "جاري تحميل الدفاتر المالية..." : "Loading financial records..."}
          </p>
        </div>
      ) : (
        <>
          {/* Rent Due Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {booking && (booking.status === "pending" || booking.status === "pending_approval") ? (
              <div className="p-6 rounded-[2rem] border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10 flex flex-col justify-center items-center text-center min-h-[180px]">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 shadow-inner">
                  <Clock size={22} className="animate-pulse" />
                </div>
                <h4 className="font-black text-sm text-slate-950 dark:text-white">
                  {isAr ? "الحجز بانتظار موافقة المالك" : "Booking Pending Approval"}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                  {isAr 
                    ? "طلب الحجز والدفع الخاص بك بانتظار موافقة المالك. بمجرد الموافقة، ستتمكن من المتابعة."
                    : "Your booking and payment request is pending landlord approval. Once approved, you can proceed."}
                </p>
              </div>
            ) : pendingPayments.length > 0 ? (
              pendingPayments.map(p => (
                <div key={p.id} className="relative overflow-hidden p-6 rounded-[2rem] border border-red-500/20 bg-gradient-to-br from-rose-500/5 to-orange-500/5 dark:from-rose-500/10 dark:to-orange-500/10 flex flex-col justify-between min-h-[180px]">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      <Clock size={10} />
                      {(p.paymentMethod || '').toLowerCase() === 'cash' 
                        ? (isAr ? "بانتظار تأكيد الدفع" : "Pending Cash Approval")
                        : (isAr ? "مستحق الدفع" : "Payment Due")}
                    </span>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                      {parseFloat(p.amount).toFixed(2)}
                      <span className="text-xs font-black text-slate-500">JOD</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(p.paymentMethod || '').toLowerCase() === 'cash'
                        ? (isAr 
                            ? "يرجى تسليم المبلغ نقداً للمالك ليقوم بتأكيد استلامه." 
                            : "Please hand the cash payment to the landlord. Once they approve/confirm, status will update.")
                        : (isAr 
                            ? `تاريخ الاستحقاق: ${new Date(p.dueDate).toLocaleDateString("ar-JO")}` 
                            : `Due Date: ${new Date(p.dueDate).toLocaleDateString("en-US")}`)}
                    </p>
                  </div>
                  {(p.paymentMethod || '').toLowerCase() !== 'cash' && (
                    <button
                      onClick={() => setActivePayment(p)}
                      className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                      {isAr ? "ادفع الفاتورة الآن" : "Pay Bill Now"}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 flex flex-col justify-center items-center text-center min-h-[180px]">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-inner">
                  <CheckCircle size={22} />
                </div>
                <h4 className="font-black text-sm text-slate-950 dark:text-white">
                  {isAr ? "أنت ملتزم بجميع الدفعات!" : "All Paid Up!"}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                  {isAr ? "لا توجد أي مستحقات إيجار معلقة في حسابك." : "There are no pending rent payments due on your active lease."}
                </p>
              </div>
            )}

            {/* Billing Protection Information */}
            <div className="p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.01] flex flex-col justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck size={12} />
                  {isAr ? "الضمان المالي الفوري" : "Instant Financial Escrow"}
                </p>
                <h4 className="font-black text-sm text-slate-950 dark:text-white">
                  {isAr ? "حماية المدفوعات من Nestify" : "Nestify Secure Payments"}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  {isAr 
                    ? "يتم تأمين جميع المعاملات من خلال نظام حساب الضمان الآمن لدينا. لا يتم تحويل الإيجار للمالك إلا بعد استكمال العقد وتدقيقه."
                    : "Payments are processed securely via our automated escrow accounts. Landlords only receive payouts based on authorized monthly active leases."}
                </p>
              </div>
              <div className="mt-4 flex gap-3 text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1"><Landmark size={12} /> PCI-DSS Compliant</span>
                <span className="flex items-center gap-1"><ShieldCheck size={12} /> SSL Secured</span>
              </div>
            </div>
          </div>

          {/* Payment History Log Table */}
          <div className="space-y-3">
            <h3 className="text-md font-black text-slate-950 dark:text-white flex items-center gap-2">
              <Receipt size={16} className="text-slate-400" />
              {isAr ? "سجل المدفوعات والوصولات" : "Transaction Payout History"}
            </h3>
            {completedPayments.length === 0 ? (
              <div className="p-10 rounded-2xl bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 text-center text-slate-400 text-xs">
                {isAr ? "لا توجد معاملات مكتملة لعرضها حالياً." : "No completed transactions recorded yet."}
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-150 dark:border-white/5 rounded-2xl bg-white dark:bg-white/[0.02]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-5 py-3">{isAr ? "المرجع" : "Transaction ID"}</th>
                        <th className="px-5 py-3">{isAr ? "المبلغ" : "Amount"}</th>
                        <th className="px-5 py-3">{isAr ? "طريقة الدفع" : "Method"}</th>
                        <th className="px-5 py-3">{isAr ? "تاريخ الدفع" : "Date"}</th>
                        <th className="px-5 py-3 text-right">{isAr ? "الحالة" : "Status"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-bold">
                      {completedPayments.map(p => (
                        <tr key={p.id} className="text-slate-700 dark:text-slate-300">
                          <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">{p.transaction_id || "TXN-AUTO"}</td>
                          <td className="px-5 py-3.5 text-slate-900 dark:text-white">{parseFloat(p.amount).toFixed(2)} JOD</td>
                          <td className="px-5 py-3.5">
                            {(() => {
                              const mLower = (p.paymentMethod || '').toLowerCase();
                              const isCard = mLower.includes('visa') || mLower.includes('card') || mLower.includes('credit');
                              return isCard ? (isAr ? "بطاقة ائتمان" : "Credit Card") : (mLower.includes('cash') ? (isAr ? "نقدي" : "Cash") : (p.paymentMethod || "Credit Card"));
                            })()}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 font-medium">{new Date(p.paymentDate || p.dueDate).toLocaleDateString(isAr ? "ar-JO" : "en-US")}</td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="inline-flex px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] uppercase tracking-wider font-black">
                              {(p.status || "").toLowerCase() === "received" ? (isAr ? "مستلمة" : "Received") : (isAr ? "مكتملة" : "Paid")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Premium Glassmorphic CC Checkout Modal */}
      <AnimatePresence>
        {activePayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePayment(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/20 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <span className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center mx-auto mb-2 shadow-lg shadow-violet-500/20">
                    <Sparkles size={18} />
                  </span>
                  <h3 className="text-xl font-black text-slate-950 dark:text-white">
                    {isAr ? "بوابة الدفع الآمنة" : "Secure Payout gateway"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAr ? "أدخل تفاصيل بطاقة الائتمان الخاصة بك لإتمام الدفعة" : "Authorized rental payment via encrypted secure connection"}
                  </p>
                </div>

                {/* Simulated Glass Card View */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-800 text-white shadow-xl relative overflow-hidden space-y-6">
                  <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white/5 -mr-10 -mt-10" />
                  <div className="flex justify-between items-start">
                    <span className="font-black italic text-sm">Nestify Secure</span>
                    <Landmark size={20} />
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{isAr ? "رقم البطاقة" : "Card Number"}</div>
                    <div className="font-mono text-md tracking-wider">
                      {cardNumber ? cardNumber.replace(/(\d{4})/g, "$1 ").trim() : "•••• •••• •••• ••••"}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest opacity-60">{isAr ? "صاحب البطاقة" : "Card Holder"}</div>
                      <div className="font-bold truncate max-w-[150px]">{cardName || "YOUR NAME"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest opacity-60">EXPIRES</div>
                      <div className="font-bold font-mono">{expiry || "MM/YY"}</div>
                    </div>
                  </div>
                </div>

                {/* CC Form inputs */}
                <form onSubmit={handleProcessPayment} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? "الاسم المدون على البطاقة" : "Cardholder Name"}</label>
                    <input
                      required
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      placeholder="JOHN DOE"
                      className={cardInputCls}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? "رقم البطاقة" : "Card Number"}</label>
                    <input
                      required
                      type="text"
                      maxLength="16"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="4000 1234 5678 9010"
                      className={cardInputCls}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EXPIRY</label>
                      <input
                        required
                        type="text"
                        maxLength="5"
                        value={expiry}
                        placeholder="MM/YY"
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.length === 2 && !val.includes("/")) val += "/";
                          setExpiry(val);
                        }}
                        className={cardInputCls}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CVV</label>
                      <input
                        required
                        type="password"
                        maxLength="3"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        placeholder="•••"
                        className={cardInputCls}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActivePayment(null)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      {isAr ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-black text-xs shadow-md shadow-violet-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {processing && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                      {isAr ? "سدد المبلغ الآن" : "Submit Payout"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
