
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BookingVisaForm from "./BookingVisaForm";
import { BookingDatesStep, BookingMethodStep, BookingCashStep, BookingSuccessStep } from "./BookingSteps";
import { createBookingObject, saveBooking, calculateEndDate } from "../../utils/bookingUtils";

export default function BookingPanel({ property, onClose }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();

  const rentalPeriod = property.rentalPeriod || "monthly";

  /* 
   * هون عرفنا المتغيرات تبع حالة الحجز: تاريخ البداية، طريقة الدفع، المرحلة الحالية، وبيانات الفيزا.
   */
  const [startDate, setStartDate] = useState("");
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [payMethod, setPayMethod] = useState(null);
  const [step, setStep] = useState("dates");
  const [visaData, setVisaData] = useState({
    cardHolder: "", cardNumber: "", expiry: "", cvc: "", pin: "", bankName: ""
  });

  /* 
   * استخدمنا useMemo مشان الكود ما يضل يعيد حساب تاريخ النهاية عالفاضي، 
   * بس بيحسبه لما يتغير تاريخ البداية أو مدة الإيجار أو عدد الأيام.
   * وحطينا if بالبداية عشان ما يضرب الكود إذا لسا مش مختار تاريخ.
   */
  const endDate = useMemo(() => {
    if (!startDate) return null;
    return calculateEndDate(startDate, rentalPeriod, numberOfDays);
  }, [startDate, rentalPeriod, numberOfDays]);

  /*
   * هون كمان استخدمنا useMemo عشان ننسق شكل التاريخ (عربي أو إنجليزي)،
   * وما بنعيد التنسيق إلا إذا تغير التاريخ نفسه (endDate) أو لغة الموقع (isAr).
   */
  const formattedEnd = useMemo(() => {
    if (!endDate) return "";
    return new Date(endDate).toLocaleDateString(isAr ? "ar-JO" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }, [endDate, isAr]);

  /* ── إتمام الحجز ── */
  const completeBooking = async (method) => {
    try {
      const extraPaymentData = method === "visa" ? {
        cardholderName: visaData.cardHolder,
        cardNumber: visaData.cardNumber,
        expiryDate: visaData.expiry,
        cvv: visaData.cvc,
        pin: visaData.pin,
        bankName: visaData.bankName
      } : {};
      await saveBooking(
        createBookingObject(property, method, { rentalPeriod, startDate, numberOfDays }),
        extraPaymentData
      );
      setStep("done");
      setTimeout(() => navigate("/student-dashboard"), 2000);
    }
    catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || t("booking_panel.done.failed");
      alert(isAr ? `فشل إرسال الطلب: ${errMsg}` : `Failed to send request: ${errMsg}`);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">

      {/* رأس اللوحة */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <p className="text-sm font-black text-slate-900 dark:text-white">
          {step === "dates" && t("booking_panel.steps.dates")}
          {step === "method" && t("booking_panel.steps.method")}
          {step === "visa" && t("booking_panel.steps.visa")}
          {step === "cash" && t("booking_panel.steps.cash")}
          {step === "done" && t("booking_panel.steps.done")}
        </p>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 grid place-items-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">

          {/* ── مرحلة التاريخ ── */}
          {step === "dates" && (
            <BookingDatesStep
              startDate={startDate}
              setStartDate={setStartDate}
              numberOfDays={numberOfDays}
              setNumberOfDays={setNumberOfDays}
              endDate={endDate}
              formattedEnd={formattedEnd}
              rentalPeriod={rentalPeriod}
              listingType={property.listingType}
              onContinue={() => setStep("method")}
            />
          )}

          {/* ── المرحلة: اختيار الطريقة ── */}
          {step === "method" && (
            <BookingMethodStep
              payMethod={payMethod}
              setPayMethod={setPayMethod}
              onBack={() => setStep("dates")}
              onContinue={() => setStep(payMethod === "visa" ? "visa" : "cash")}
            />
          )}

          {/* ── فورم الفيزا ── */}
          {step === "visa" && (
            <motion.div key="visa" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <BookingVisaForm
                visaData={visaData}
                setVisaData={setVisaData}
                onSubmit={(e) => { e.preventDefault(); completeBooking("visa"); }}
                onBack={() => setStep("method")}
                isAr={isAr}
              />
            </motion.div>
          )}

          {/* ── تأكيد النقد ── */}
          {step === "cash" && (
            <BookingCashStep
              onBack={() => setStep("method")}
              onComplete={() => completeBooking("cash")}
            />
          )}

          {/* ── النجاح ── */}
          {step === "done" && <BookingSuccessStep />}

        </AnimatePresence>
      </div>
    </div>
  );
}
