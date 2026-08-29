
import React from "react";
import { User, CreditCard, Calendar, Hash, Lock, Building } from "lucide-react";
import { Button } from "../ui/Button";
import { formatCardNumber, formatExpiry } from "../../utils/bookingUtils";
import { useTranslation } from "react-i18next";

export default function BookingVisaForm({ visaData, setVisaData, onSubmit, onBack, isAr }) {
  const { t } = useTranslation();
  const boxInput = `w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all duration-200`;

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* اسم حامل البطاقة */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
          {t("booking_panel.visa_form.cardholder")}
        </label>
        <div className="relative">
          <User size={14} className={`absolute top-1/2 -translate-y-1/2 ${isAr ? "right-3" : "left-3"} text-slate-400`} />
          <input required type="text"
            value={visaData.cardHolder}
            onChange={e => setVisaData({ ...visaData, cardHolder: e.target.value })}
            placeholder="Ahmad Al-Saad"
            className={`${boxInput} ${isAr ? "pr-8" : "pl-8"}`}
          />
        </div>
      </div>
      {/* رقم البطاقة */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
          {t("booking_panel.visa_form.card_number")}
        </label>
        <div className="relative">
          <CreditCard size={14} className={`absolute top-1/2 -translate-y-1/2 ${isAr ? "right-3" : "left-3"} text-slate-400`} />
          <input required type="text" maxLength={19}
            value={visaData.cardNumber}
            onChange={e => setVisaData({ ...visaData, cardNumber: formatCardNumber(e.target.value) })}
            placeholder="0000 0000 0000 0000"
            className={`${boxInput} ${isAr ? "pr-8" : "pl-8"} font-mono tracking-widest`}
          />
        </div>
      </div>
      {/* تاريخ الانتهاء + CVC */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            {t("booking_panel.visa_form.expiry")}
          </label>
          <div className="relative">
            <Calendar size={13} className={`absolute top-1/2 -translate-y-1/2 ${isAr ? "right-3" : "left-3"} text-slate-400`} />
            <input required type="text" maxLength={5}
              value={visaData.expiry}
              onChange={e => setVisaData({ ...visaData, expiry: formatExpiry(e.target.value) })}
              placeholder="MM/YY"
              className={`${boxInput} ${isAr ? "pr-7" : "pl-7"} font-mono`}
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">CVC</label>
          <div className="relative">
            <Hash size={13} className={`absolute top-1/2 -translate-y-1/2 ${isAr ? "right-3" : "left-3"} text-slate-400`} />
            <input required type="password" maxLength={3}
              value={visaData.cvc}
              onChange={e => setVisaData({ ...visaData, cvc: e.target.value.replace(/\D/g, "").slice(0, 3) })}
              placeholder="•••"
              className={`${boxInput} ${isAr ? "pr-7" : "pl-7"} font-mono`}
            />
          </div>
        </div>
      </div>
      {/* PIN + البنك */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">PIN</label>
          <div className="relative">
            <Lock size={13} className={`absolute top-1/2 -translate-y-1/2 ${isAr ? "right-3" : "left-3"} text-slate-400`} />
            <input required type="password"
              value={visaData.pin}
              onChange={e => setVisaData({ ...visaData, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              placeholder="••••"
              className={`${boxInput} ${isAr ? "pr-7" : "pl-7"} font-mono`}
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            {t("booking_panel.visa_form.bank")}
          </label>
          <div className="relative">
            <Building size={13} className={`absolute top-1/2 -translate-y-1/2 ${isAr ? "right-3" : "left-3"} text-slate-400`} />
            <input required type="text"
              value={visaData.bankName}
              onChange={e => setVisaData({ ...visaData, bankName: e.target.value })}
              placeholder="Arab Bank"
              className={`${boxInput} ${isAr ? "pr-7" : "pl-7"}`}
            />
          </div>
        </div>
      </div>
      {/* أزرار التحكم */}
      <div className="flex gap-2 pt-1">
        <Button type="submit" className="flex-1 !rounded-xl !bg-blue-800 hover:!bg-blue-900 dark:!bg-lime-500 dark:hover:!bg-lime-600 !text-white dark:!text-slate-900 font-bold border-none text-sm">
          {t("booking_panel.visa_form.pay_now")}
        </Button>
        <button type="button" onClick={onBack}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold transition-colors">
          {t("booking_panel.visa_form.back")}
        </button>
      </div>
    </form>
  );
}
