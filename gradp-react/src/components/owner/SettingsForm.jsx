
import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Users, Mail, Lock, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import api from "../../utils/api";

/*
 * مكوّن تعديل بيانات المالك (الإعدادات).
 */
export default function SettingsForm({
  ownerInfo,      // كائن يحتوي على بيانات المالك (اسم، إيميل، هاتف، إلخ)
  setOwnerInfo,   // دالة لتحديث بيانات المالك في الـ State
  underlineInput, // ستايل الـ CSS الموحد للحقول (الخط السفلي)
  iconPos,        // مكان الأيقونة داخل الحقل
  t,              // دالة الترجمة
  isAr,           // لغة الواجهة الحالية
  fadeUp,         // تأثير الحركة للظهور للأعلى
  stagger         // تأثير تتابع ظهور العناصر
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!ownerInfo.bankName || ownerInfo.bankName.trim().length < 2) {
      alert(isAr ? "اسم البنك يجب أن يتكون من حرفين على الأقل" : "Bank Name must be at least 2 characters");
      setLoading(false);
      return;
    }
    if (!/^[a-zA-Z\s\u0600-\u06FF]+$/.test(ownerInfo.bankName.trim())) {
      alert(isAr ? "اسم البنك يجب أن يحتوي على حروف فقط" : "Bank Name must only contain letters");
      setLoading(false);
      return;
    }
    if (!ownerInfo.bankAccountHolderName || ownerInfo.bankAccountHolderName.trim().length < 2) {
      alert(isAr ? "اسم صاحب الحساب يجب أن يتكون من حرفين على الأقل" : "Bank Account Holder Name must be at least 2 characters");
      setLoading(false);
      return;
    }
    if (!/^[a-zA-Z\s\u0600-\u06FF]+$/.test(ownerInfo.bankAccountHolderName.trim())) {
      alert(isAr ? "اسم صاحب الحساب يجب أن يحتوي على حروف فقط" : "Bank Account Holder Name must only contain letters");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        fullName: ownerInfo.name,
        phoneNumber: ownerInfo.phone,
        email: ownerInfo.email,
        bankName: ownerInfo.bankName,
        bankAccountHolderName: ownerInfo.bankAccountHolderName
      };

      if (ownerInfo.password && ownerInfo.password !== "password123") {
        payload.password = ownerInfo.password;
      }

      const res = await api.put("/users/profile", payload);
      if (res.success) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const parsed = JSON.parse(userStr);
          const updatedUser = {
            ...parsed,
            name: ownerInfo.name,
            fullName: ownerInfo.name,
            phone_number: ownerInfo.phone,
            email: ownerInfo.email,
            bankName: ownerInfo.bankName,
            bankAccountHolderName: ownerInfo.bankAccountHolderName
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        window.dispatchEvent(new Event("userUpdate"));
        alert(isAr ? "تم حفظ التغييرات بنجاح!" : "Settings saved successfully!");
      }
    } catch (err) {
      console.error("Failed to update landlord settings:", err);
      alert(isAr ? "فشل حفظ التغييرات. يرجى المحاولة مرة أخرى." : "Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="settings"
      variants={stagger}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
      className="flex flex-col gap-6"
    >
      {/* ── عنوان صفحة الإعدادات (Page Title) ── */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl xl:text-3xl font-black">
          {t("owner_dashboard.settings_title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t("owner_dashboard.settings_desc")}
        </p>
      </motion.div>

      {/* ── الحاوية الرئيسية للفورم (Settings Container) ── */}
      <motion.div
        variants={fadeUp}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        {/* ترويسة الإعدادات: تعرض صورة رمزية (أول حرف) والاسم والإيميل الحالي */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/60 to-lime-50/40 dark:from-blue-900/10 dark:to-lime-900/10 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-lime-400 grid place-items-center text-white text-2xl font-black shadow-lg shadow-blue-500/25">
            {ownerInfo.name.charAt(0)}
          </div>
          <div>
            <p className="font-black text-xl">{ownerInfo.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{ownerInfo.email}</p>
          </div>
        </div>

        {/* ── نموذج التعديل (Edit Form) ── */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-7 max-w-2xl"
        >
          {/* حقل الاسم الكامل */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{t("owner_login.full_name")}</label>
            <div className="relative group">
              <User size={17} className={iconPos} />
              <input
                required type="text"
                value={ownerInfo.name}
                onChange={e => setOwnerInfo({ ...ownerInfo, name: e.target.value })}
                className={underlineInput}
              />
            </div>
          </div>

          {/* شبكة تحتوي على رقم الهاتف والجنس */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* حقل رقم الهاتف */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">{t("owner_login.phone")}</label>
              <div className="relative group">
                <Phone size={17} className={iconPos} />
                <input
                  required type="tel"
                  value={ownerInfo.phone}
                  onChange={e => setOwnerInfo({ ...ownerInfo, phone: e.target.value })}
                  className={underlineInput}
                />
              </div>
            </div>
            {/* حقل اختيار الجنس */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">{t("owner_login.gender")}</label>
              <div className="relative group">
                <Users size={17} className={iconPos} />
                <select
                  value={ownerInfo.gender}
                  onChange={e => setOwnerInfo({ ...ownerInfo, gender: e.target.value })}
                  className={`${underlineInput} appearance-none cursor-pointer bg-transparent`}
                >
                  <option value="male">{t("owner_login.male")}</option>
                  <option value="female">{t("owner_login.female")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* حقل البريد الإلكتروني */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{t("owner_login.email")}</label>
            <div className="relative group">
              <Mail size={17} className={iconPos} />
              <input
                required type="email"
                value={ownerInfo.email}
                onChange={e => setOwnerInfo({ ...ownerInfo, email: e.target.value })}
                className={underlineInput}
              />
            </div>
          </div>

          {/* حقل كلمة المرور الجديدة */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{t("owner_login.password")}</label>
            <div className="relative group">
              <Lock size={17} className={iconPos} />
              <input
                required type="password"
                value={ownerInfo.password}
                onChange={e => setOwnerInfo({ ...ownerInfo, password: e.target.value })}
                className={underlineInput}
              />
            </div>
          </div>

          {/* حقول المعلومات البنكية للمالك */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">{isAr ? "اسم البنك" : "Bank Name"}</label>
              <div className="relative group">
                <input
                  required type="text"
                  value={ownerInfo.bankName}
                  onChange={e => setOwnerInfo({ ...ownerInfo, bankName: e.target.value })}
                  className={underlineInput}
                  placeholder={isAr ? "مثال: البنك العربي" : "e.g., Arab Bank"}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">{isAr ? "اسم صاحب الحساب" : "Bank Account Holder Name"}</label>
              <div className="relative group">
                <input
                  required type="text"
                  value={ownerInfo.bankAccountHolderName}
                  onChange={e => setOwnerInfo({ ...ownerInfo, bankAccountHolderName: e.target.value })}
                  className={underlineInput}
                  placeholder={isAr ? "الاسم الكامل لصاحب الحساب" : "Full account holder name"}
                />
              </div>
            </div>
          </div>

          {/* ── أزرار الحفظ (Action Buttons) ── */}
          <div className="pt-3 flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button type="submit" disabled={loading} className="!bg-blue-600 hover:!bg-blue-700 !text-white !rounded-2xl !px-8 !py-3 font-black border-none shadow-lg shadow-blue-500/20 disabled:opacity-50">
                {loading ? (isAr ? "جاري الحفظ..." : "Saving...") : t("owner_dashboard.save_settings")}
              </Button>
            </motion.div>
            {/* ملاحظة صغيرة بجانب الزر */}
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <AlertCircle size={13} /> {isAr ? "يتم تطبيق التغييرات فوراً" : "Changes apply immediately"}
            </span>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
