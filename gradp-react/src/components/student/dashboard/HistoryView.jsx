import React, { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, MapPin, CreditCard, Calendar, Clock, CheckCircle, AlertCircle, User, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../../../utils/api";

function BookingRatingWidget({ booking, onRatingSubmitted, isAr, t }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(booking.hasRated);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      const propertyId = booking.unit?.property_id || booking.propertyId || booking.unit?.property?.property_id;
      const unitId = booking.unitId || booking.unit?.unit_id;
      if (!propertyId) {
        alert("Property ID not found.");
        return;
      }
      const response = await api.post("/reviews", {
        propertyId: propertyId.toString(),
        unitId: unitId ? unitId.toString() : undefined,
        rating: rating,
        comment: "Rated via history dashboard"
      });
      if (response.success) {
        setSubmitted(true);
        if (onRatingSubmitted) {
          onRatingSubmitted(booking.id || booking.booking_id || booking.bookingID);
        }
      } else {
        alert(response.message || "Failed to submit rating.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting rating: " + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/20 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
        <span className="text-emerald-500">✓</span>
        <span>{isAr ? "تم التقييم بنجاح!" : "Rated Successfully!"}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 px-4 py-2 rounded-2xl border border-slate-100 dark:border-white/5 animate-fade-up">
      <span className="text-xs font-black text-slate-500 dark:text-slate-400">
        {isAr ? "قيم إقامتك:" : "Rate your stay:"}
      </span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none cursor-pointer"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            disabled={isSubmitting}
          >
            <Star
              size={18}
              className={`transition-all duration-150 ${
                (hoverRating || rating) >= star
                  ? "fill-amber-500 text-amber-500 scale-110"
                  : "text-slate-300 dark:text-slate-600 hover:text-amber-400"
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="text-xs font-black bg-blue-600 hover:bg-blue-700 text-white dark:bg-lime-500 dark:text-slate-900 px-3 py-1 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (isAr ? "جاري الإرسال..." : "Submitting...") : (isAr ? "إرسال" : "Submit")}
        </button>
      )}
    </div>
  );
}

export default function HistoryView({ allBookings = [], isAr, formatD, viewportVariants, onCancelBooking }) {
  const { t } = useTranslation();

  const getEndDateForBooking = (b) => {
    const checkin = b.checkInDate || b.startDate || b.requestDate || b.checkin_date;
    const start = checkin ? new Date(checkin) : new Date();
    if (b.checkoutDate) return new Date(b.checkoutDate);
    if (b.checkout_date) return new Date(b.checkout_date);
    if (b.endDate) return new Date(b.endDate);
    
    const period = b.rentalType || b.rentalPeriod || "monthly";
    const end = new Date(start.getTime());
    if (period === "daily") {
      end.setDate(end.getDate() + 1);
    } else if (period === "seasonal" || period === "semester") {
      end.setMonth(end.getMonth() + 4);
    } else {
      end.setMonth(end.getMonth() + 1);
    }
    return end;
  };

  const getStatusBadge = (status) => {
    const mapping = {
      approved: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        text: "text-emerald-600 dark:text-emerald-400",
        icon: CheckCircle,
        label: isAr ? "مقبول" : "Approved"
      },
      confirmed: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        text: "text-emerald-600 dark:text-emerald-400",
        icon: CheckCircle,
        label: isAr ? "مؤكد" : "Confirmed"
      },
      pending: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        text: "text-amber-600 dark:text-amber-400",
        icon: AlertCircle,
        label: isAr ? "قيد الانتظار" : "Pending"
      },
      rejected: {
        bg: "bg-rose-50 dark:bg-rose-900/20",
        text: "text-rose-600 dark:text-rose-400",
        icon: AlertCircle,
        label: isAr ? "مرفوض" : "Rejected"
      },
      cancelled: {
        bg: "bg-slate-100 dark:bg-slate-800 text-slate-500",
        text: "text-slate-600 dark:text-slate-400",
        icon: AlertCircle,
        label: isAr ? "ملغي" : "Cancelled"
      }
    };

    const config = mapping[status] || mapping.pending;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${config.bg} ${config.text}`}>
        <Icon size={12} />
        <span>{config.label}</span>
      </div>
    );
  };

  if (!allBookings || allBookings.length === 0) {
    return (
      <motion.div key="history-empty" variants={viewportVariants} initial="initial" animate="animate" exit="exit">
        <div className="flex flex-col items-center justify-center h-[450px] text-center space-y-6">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
            <ClipboardList size={42} className="text-slate-300 dark:text-slate-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t("student_history.no_history_title")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm">
              {t("student_history.no_history_desc")}
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/student")}
            className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm"
          >
            {t("student_history.browse_btn")}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="history"
      variants={viewportVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      {/* هيدر الصفحة (Header) */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <ClipboardList size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {t("student_history.title")}
          </h2>
          <p className="text-slate-500 text-sm">{t("student_history.subtitle")}</p>
        </div>
      </div>

      {/* قائمة الكروت */}
      <div className="space-y-6">
        {allBookings.map((b, idx) => {
          const checkin = b.checkInDate || b.startDate || b.requestDate || b.checkin_date;
          const startDateObj = checkin ? new Date(checkin) : new Date();
          const endDateObj = getEndDateForBooking(b);
          const isCurrent = idx === 0;

          return (
            <motion.div
              key={b.id || b.booking_id || idx}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`p-6 rounded-[2rem] border relative overflow-hidden transition-all bg-white dark:bg-slate-900/90 shadow-lg ${
                isCurrent
                  ? "border-blue-500/30 dark:border-lime-500/30 ring-1 ring-blue-500/10 dark:ring-lime-500/10"
                  : "border-slate-100 dark:border-white/5"
              }`}
            >
              {/* شارة التمييز (الحالي / السابق) والحالة في الهيدر */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider ${
                    isCurrent
                      ? "bg-blue-600 text-white dark:bg-lime-500 dark:text-slate-955 shadow-md shadow-blue-500/10"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {isCurrent
                    ? (isAr ? "💡 حجز حالي" : "✨ Current Booking")
                    : (isAr ? "📋 حجز سابق" : "📅 Previous Booking")
                  }
                </span>

                <div className="flex gap-2 items-center">
                  {getStatusBadge(b.status)}
                </div>
              </div>

              {/* تفاصيل العقار */}
              <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-white/5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {b.propertyTitle || b.unit?.property?.title || (isAr ? "غير محدد" : "N/A")}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  <User size={13} className="text-slate-400" />
                  <span>
                    {isAr ? `المالك: ${b.ownerName}` : `Owner: ${b.ownerName}`}
                  </span>
                </div>
              </div>

              {/* تفاصيل الحجز */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center shrink-0">
                    <MapPin size={15} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {t("student_history.location")}
                    </p>
                    <p className="text-xs font-black text-slate-950 dark:text-white truncate max-w-[120px]">
                      {b.location || b.unit?.property?.address || (isAr ? "غير محدد" : "N/A")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center shrink-0">
                    <Calendar size={15} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {t("student_history.start_date")}
                    </p>
                    <p className="text-xs font-black text-slate-955 dark:text-white">
                      {formatD(startDateObj)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center shrink-0">
                    <Clock size={15} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {t("student_history.end_date")}
                    </p>
                    <p className="text-xs font-black text-slate-955 dark:text-white">
                      {formatD(endDateObj)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center shrink-0">
                    <CreditCard size={15} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {isAr ? "وسيلة الدفع والقدر" : "Payment & Price"}
                    </p>
                    <p className="text-xs font-black text-slate-955 dark:text-white">
                      {(() => {
                        const mLower = (b.payMethod || "").toLowerCase();
                        const isCard = mLower.includes("visa") || mLower.includes("card") || mLower.includes("credit");
                        return isCard ? (isAr ? "بطاقة ائتمان" : "Credit Card") : (isAr ? "نقدي" : "Cash");
                      })()}
                      {` (${b.payment?.amount || b.unit?.price || 0} JOD)`}
                    </p>
                  </div>
                </div>
              </div>

              {(() => {
                const isEnded = endDateObj && endDateObj < new Date();
                const showRatingWidget = (b.status === "confirmed" || b.status === "approved") && (isEnded || !isCurrent);

                return (
                  <div className="mt-5 flex justify-between items-center flex-wrap gap-4">
                    {showRatingWidget ? (
                      <BookingRatingWidget
                        booking={b}
                        isAr={isAr}
                        t={t}
                        onRatingSubmitted={() => {
                          if (b.hasRated === undefined) {
                            b.hasRated = true;
                          }
                        }}
                      />
                    ) : <div />}

                    {b.status !== "cancelled" && b.status !== "rejected" && !isEnded && (
                      <button
                        onClick={() => onCancelBooking && onCancelBooking(b.id || b.booking_id || b.bookingID)}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        {isAr ? "إلغاء الحجز" : "Cancel Reservation"}
                      </button>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
