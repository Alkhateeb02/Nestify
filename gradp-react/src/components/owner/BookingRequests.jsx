
import React from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, CreditCard, Banknote, ThumbsUp, ThumbsDown,
  CheckCircle2, X, Phone, Calendar, Clock, User
} from "lucide-react";

export default function BookingRequests({
  bookingRequests,      // المصفوفة اللي فيها كل طلبات الحجز
  handleBookingAction,  // عشان نوافق أو نرفض الطلب
  isAr,                 // مشان نعرف إذا اللغة عربي ولا إنجليزي
  t,                    // مشان الترجمة
  fadeUp,               // حركات الأنميشن
  stagger               // عشان العناصر تطلع ورا بعض
}) {

  /*عشان نرتب شكل التاريخ ويطلع مرتب */
  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  /*  عشان نترجم فترة الإيجار (شهري، يومي، فصلي)  */
  const rentalLabel = (period) => {
    const map = {
      monthly: t("owner_booking.monthly"),
      daily: t("owner_booking.daily"),
      seasonal: t("owner_booking.seasonal"),
    };
    return map[period] || t("owner_booking.monthly");
  };

  return (
    <motion.div
      key="bookings"
      variants={stagger}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
      className="flex flex-col gap-6"
    >
      {/*  عنوان الصفحة ووصفها  */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl xl:text-3xl font-black">
          {t("owner_booking.title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t("owner_booking.desc")}
        </p>
      </motion.div>

      {/*  الصندوق الرئيسي اللي جواه كل الطلبات  */}
      <motion.div
        variants={fadeUp}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        {/* ترويسة القائمة */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-black text-base">{t("owner_booking.incoming")}</h2>
          <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full">
            {bookingRequests.length} {bookingRequests.length === 1 ? t("owner_booking.request_single") : t("owner_booking.request_plural")}
          </span>
        </div>

        {/*  إذا ما في أي طلبات بنعرض هاي الشاشة  */}
        {bookingRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 grid place-items-center mb-5">
              <ClipboardList size={34} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-black text-xl text-slate-400 dark:text-slate-500">
              {t("owner_booking.no_requests")}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-600 mt-2">
              {t("owner_booking.no_requests_desc")}
            </p>
          </div>
        ) : (
          /*  قائمة الطلبات الحقيقية  */
          <motion.ul
            variants={stagger}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-100 dark:divide-slate-800"
          >
            {bookingRequests.map((req, idx) => (
              <motion.li
                key={idx}
                variants={fadeUp}
                className="px-7 py-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                  {/* صورة الطالب الرمزية */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 grid place-items-center text-white shrink-0 shadow-md">
                    <User size={22} />
                  </div>

                  {/* معلومات الطالب وتفاصيل الحجز */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* اسم الطالب وحالة طلبه (مقبول/مرفوض/انتظار) */}
                      <p className="font-black text-base">{req.studentName}</p>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${req.status === "approved"
                        ? "bg-emerald-100/60 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : req.status === "rejected"
                          ? "bg-rose-100/60 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                          : "bg-amber-100/60 text-amber-700 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                        }`}>
                        {req.status === "approved" ? t("owner_booking.status_approved") : req.status === "rejected" ? t("owner_booking.status_rejected") : t("owner_booking.status_pending")}
                      </span>
                    </div>

                    {/* معلومات التواصل، السكن، وطريقة الدفع */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                      {req.studentPhone && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Phone size={11} /> {req.studentPhone}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        📍 {req.propertyTitle}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {(() => {
                          const mLower = (req.payMethod || "").toLowerCase();
                          const isCard = mLower.includes("visa") || mLower.includes("card") || mLower.includes("credit");
                          return (
                            <>
                              {isCard ? <CreditCard size={11} /> : <Banknote size={11} />}
                              {isCard ? (isAr ? "بطاقة ائتمان" : "Credit Card") : (isAr ? "نقدي" : "Cash")}
                            </>
                          );
                        })()}
                      </span>
                    </div>

                    {/* تواريخ الحجز وكم رح يقعد */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      {req.rentalPeriod && (
                        <span className="text-xs font-bold text-blue-600 dark:text-lime-400 flex items-center gap-1">
                          <Clock size={11} /> {rentalLabel(req.rentalPeriod)}
                        </span>
                      )}
                      {req.startDate && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar size={11} /> {fmtDate(req.startDate)} → {fmtDate(req.endDate)}
                        </span>
                      )}
                    </div>

                    {/* متى قدم الطلب */}
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">
                      {fmtDate(req.requestDate)}
                    </p>
                  </div>

                  {/* ── أزرار القبول والرفض ── */}
                  {/* بتبين بس إذا الطلب لسا قيد الانتظار */}
                  {req.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <motion.button
                        onClick={() => handleBookingAction(idx, "approve")}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl !bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-colors shadow-md shadow-emerald-500/20"
                      >
                        <ThumbsUp size={14} /> {t("owner_booking.approve")}
                      </motion.button>
                      <motion.button
                        onClick={() => handleBookingAction(idx, "reject")}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl !bg-rose-500 hover:bg-rose-600 text-white text-xs font-black transition-colors shadow-md shadow-rose-500/20"
                      >
                        <ThumbsDown size={14} /> {t("owner_booking.reject")}
                      </motion.button>
                    </div>
                  )}
                  {/* إذا وافقنا أو رفضنا، بنبين النتيجة النهائية هون */}
                  {req.status !== "pending" && (
                    <div className={`flex items-center gap-1.5 text-xs font-black shrink-0 ${req.status === "approved" ? "text-emerald-500" : "text-rose-400"}`}>
                      {req.status === "approved" ? <CheckCircle2 size={16} /> : <X size={16} />}
                      {req.status === "approved" ? t("owner_booking.approved_done") : t("owner_booking.rejected_done")}
                    </div>
                  )}
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </motion.div>
    </motion.div>
  );
}
