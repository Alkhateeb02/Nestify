/* 
 * مكون PersonalInfo (المعلومات الشخصية للطالب)
 * هاد أول جزء بطلع للطالب لما يجي يسجل حساب جديد
 */
import React, { useState, useEffect } from "react";
import { User, Mail, Lock, Phone, GraduationCap, ArrowRight, CalendarDays, Users, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatePresence } from "framer-motion";
import AboutUsModal from "../../../components/modals/AboutUsModal";
import api from "../../../utils/api";
import { Button } from "../../../components/ui/Button";

function loadGoogleGsiScript(lang, callback) {
  const existing = document.querySelectorAll('script[src*="accounts.google.com/gsi/client"]');
  existing.forEach(s => s.remove());

  const script = document.createElement("script");
  script.src = `https://accounts.google.com/gsi/client?hl=${lang}`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    if (callback) callback();
  };
  document.head.appendChild(script);
}

export default function PersonalInfo({ onNext, formData }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [agreed, setAgreed] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);

  // تخزين بيانات الطالب المدخلة (مسبقة التعبئة إذا كان مسجل بجوجل)
  const [localData, setLocalData] = useState({
    name: formData?.name || "",
    phone: formData?.phone || "",
    major: formData?.major || "",
    email: formData?.email || "",
    password: formData?.password || "",
    gender: formData?.gender || "",
    semester: formData?.semester || "",
    year: formData?.year || ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  // فحوصات التحقق الحية (Live validation checks)
  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = (phone) => /^07[789]\d{7}$/.test(phone);

  // فحوصات كلمة المرور
  const passLength = localData.password.length >= 8;
  const passNum = /\d/.test(localData.password);
  const passLower = /[a-z]/.test(localData.password);
  const passUpper = /[A-Z]/.test(localData.password);
  const passSpecial = /[@$!%*?&#^()_+=\-[\]{}|;:'",.<>/?`~]/.test(localData.password);
  const isPasswordValid = passLength && passNum && passLower && passUpper && passSpecial;

  const isNameFilled = localData.name.trim().length > 0;
  const isMajorFilled = localData.major.trim().length > 0;
  const isGenderFilled = localData.gender.length > 0;
  const isYearFilled = localData.year.length > 0;
  const isSemesterFilled = localData.semester.length > 0;

  const allRequiredFilled = formData?.isGoogle 
    ? (isNameFilled && isPhoneValid(localData.phone) && isMajorFilled && isGenderFilled && isYearFilled && isSemesterFilled && agreed)
    : (isNameFilled && isPhoneValid(localData.phone) && isMajorFilled && isEmailValid(localData.email) && isPasswordValid && isGenderFilled && isYearFilled && isSemesterFilled && agreed);

  // تحديث البيانات عند تغير formData من الأب
  useEffect(() => {
    if (formData?.email) {
      setLocalData(prev => ({
        ...prev,
        name: formData.name || prev.name,
        email: formData.email || prev.email,
        phone: formData.phone || prev.phone,
        major: formData.major || prev.major,
        gender: formData.gender || prev.gender,
        semester: formData.semester || prev.semester,
        year: formData.year || prev.year,
      }));
    }
  }, [formData]);

  // تهيئة تسجيل الدخول الفعلي بواسطة Google للتسجيل
  useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "573386894778-teif34kcrdka1r7gfj6euovvc09ustup.apps.googleusercontent.com",
          callback: async (response) => {
            setLoading(true);
            setError("");
            try {
              const googleToken = response.credential;
              const base64Url = googleToken.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              const payload = JSON.parse(jsonPayload);
              
              // تحقق إذا كان الإيميل مسجل مسبقاً في النظام
              const checkRes = await api.post("/auth/check-email", { email: payload.email });
              const emailExists = checkRes?.exists || checkRes?.data?.exists;
              
              if (emailExists) {
                // إذا كان مسجل مسبقاً، سجل دخوله مباشرة!
                const res = await api.post("/auth/google-login", { token: googleToken });
                if (res.success && res.data) {
                  localStorage.setItem("token", res.data.token);
                  localStorage.setItem("user", JSON.stringify(res.data.user));
                  window.location.href = res.data.user.role === 'student' ? "/student" : "/owner-dashboard";
                }
              } else {
                // إذا كان مستخدم جديد، نملأ البيانات وننقله للخطوة الثانية
                if (typeof window.onGoogleSignUpPrefill === "function") {
                  window.onGoogleSignUpPrefill({
                    name: payload.name,
                    email: payload.email,
                    profile_image: payload.picture,
                    isGoogle: true,
                    googleToken: googleToken
                  });
                }
              }
            } catch (err) {
              setError(err.message || "Google signup failed");
            } finally {
              setLoading(false);
            }
          }
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignUpDiv"),
          { 
            theme: "outline", 
            size: "large", 
            shape: "pill",
            width: 380,
            text: "signup_with"
          }
        );
      }
    };

    loadGoogleGsiScript(isAr ? "ar" : "en", initGoogle);
  }, [isAr]);

  // دالة لتحديث البيانات مع شروط بسيطة (مثلاً الاسم بس أحرف، التلفون بس أرقام)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const filteredValue = value.replace(/[^a-zA-Z\u0621-\u064A\s]/g, ""); // أحرف عربي وإنجليزي بس
      setLocalData(prev => ({ ...prev, [name]: filteredValue }));
      return;
    }

    if (name === "phone") {
      const filteredValue = value.replace(/\D/g, "").slice(0, 10); // أرقام بس لحد 10 خانات
      setLocalData(prev => ({ ...prev, [name]: filteredValue }));
      return;
    }

    setLocalData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // ستايلات الحقول (Inputs) مع التحقق المباشر
  const getInputStyle = (name, isValid = true) => {
    const isError = touched[name] && !isValid;
    return `w-full ${isAr ? "pr-10 text-right" : "pl-10"} py-3.5 bg-transparent border-b outline-none text-sm transition-all text-slate-900 dark:text-white font-medium ${
      isError 
        ? "border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500" 
        : "border-slate-200 dark:border-slate-800 focus:border-blue-800 dark:focus:border-lime-500 hover:border-slate-300"
    }`;
  };

  const getIconStyle = (name, isValid = true) => {
    const isError = touched[name] && !isValid;
    return `absolute ${isAr ? "right-2" : "left-2"} top-1/2 -translate-y-1/2 transition-colors ${
      isError 
        ? "text-red-500" 
        : "text-slate-400 group-focus-within:text-blue-800 dark:group-focus-within:text-lime-500"
    }`;
  };

  // لما الطالب يكبس "التالي"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!allRequiredFilled) {
      setError(isAr ? "يرجى تعبئة الحقول بالشكل الصحيح أولاً" : "Please fill all fields correctly first");
      return;
    }

    setLoading(true);
    try {
      // فقط إذا لم يكن مستخدم جوجل، نقوم بفحص البريد الإلكتروني (لأن جوجل تم فحصه بالفعل)
      if (!formData?.isGoogle) {
        const emailRes = await api.post("/auth/check-email", { email: localData.email });
        if (emailRes.exists || emailRes.data?.exists) {
          setError(isAr ? "هذا البريد الإلكتروني مسجل مسبقاً" : "This email is already registered");
          setLoading(false);
          return;
        }
      }

      // التأكد إذا رقم الهاتف مستخدم قبل هيك
      const phoneRes = await api.post("/auth/check-phone", { phoneNumber: localData.phone });
      if (phoneRes.exists || phoneRes.data?.exists) {
        setError(isAr ? "رقم الهاتف هذا مسجل مسبقاً" : "This phone number is already registered");
        setLoading(false);
        return;
      }

      onNext(localData); // انتقل للخطوة اللي بعدها
    } catch (err) {
      console.error(err);
      setError(isAr ? "حدث خطأ أثناء التحقق" : "Verification error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* العناوين */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          {t("login_page.personal_info")}
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          {t("login_page.form_subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* الاسم ورقم الهاتف */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="relative group">
            <User size={18} className={getIconStyle("name", isNameFilled)} />
            <input type="text" name="name" value={localData.name} onChange={handleChange} onBlur={handleBlur} placeholder={t("login_page.full_name")} className={getInputStyle("name", isNameFilled)} required disabled={!!formData?.isGoogle} />
          </div>
          <div>
            <div className="relative group">
              <Phone size={18} className={getIconStyle("phone", isPhoneValid(localData.phone))} />
              <input type="tel" name="phone" value={localData.phone} onChange={handleChange} onBlur={handleBlur} placeholder={t("login_page.phone")} className={getInputStyle("phone", isPhoneValid(localData.phone))} required />
            </div>
            {touched.phone && !isPhoneValid(localData.phone) && (
              <p className="text-[11px] text-red-500 mt-1 font-bold px-2">
                {isAr ? "رقم الهاتف غير صحيح (يجب أن يبدأ بـ 077 أو 078 أو 079 ويتكون من 10 أرقام)" : "Invalid phone (must start with 077, 078, or 079 and be 10 digits)"}
              </p>
            )}
          </div>
        </div>

        {/* التخصص والبريد الإلكتروني */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="relative group">
            <GraduationCap size={18} className={getIconStyle("major", isMajorFilled)} />
            <input type="text" name="major" value={localData.major} onChange={handleChange} onBlur={handleBlur} placeholder={t("login_page.major")} className={getInputStyle("major", isMajorFilled)} required />
          </div>
          <div>
            <div className="relative group">
              <Mail size={18} className={getIconStyle("email", isEmailValid(localData.email))} />
              <input type="email" name="email" value={localData.email} onChange={handleChange} onBlur={handleBlur} placeholder={t("login_page.email")} className={getInputStyle("email", isEmailValid(localData.email))} required disabled={!!formData?.isGoogle} />
            </div>
            {touched.email && !isEmailValid(localData.email) && (
              <p className="text-[11px] text-red-500 mt-1 font-bold px-2">
                {isAr ? "صيغة البريد الإلكتروني غير صحيحة" : "Invalid email format"}
              </p>
            )}
          </div>
        </div>
        {error && <p className="text-red-500 text-xs font-medium px-2 mt-1">{error}</p>}

        {/* كلمة المرور - تظهر فقط في حالة التسجيل العادي (غير جوجل) */}
        {!formData?.isGoogle && (
          <div>
            <div className="relative group">
              <Lock size={18} className={getIconStyle("password", isPasswordValid)} />
              <input type="password" name="password" value={localData.password} onChange={handleChange} onBlur={handleBlur} placeholder={t("login_page.password")} className={getInputStyle("password", isPasswordValid)} required />
            </div>
            {touched.password && (
              <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2">
                <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
                  {isAr ? "شروط كلمة المرور:" : "Password Requirements:"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { label: isAr ? "8 خانات على الأقل" : "At least 8 characters", met: passLength },
                    { label: isAr ? "يحتوي على أرقام" : "Contains numbers", met: passNum },
                    { label: isAr ? "حروف صغيرة وكبيرة" : "Lowercase & uppercase", met: passLower && passUpper },
                    { label: isAr ? "رمز خاص (مثل @$!%*?&)" : "Special character (e.g. @$!%*?&)", met: passSpecial },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${req.met ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                      <span className={`font-semibold ${req.met ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}>
                        {req.met ? "✓ " : "✗ "}{req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* الجنس، السنة الدراسية، والفصل */}
        <div className="space-y-5">
          <div className="relative group">
            <Users size={18} className={getIconStyle("gender", isGenderFilled)} />
            <select name="gender" value={localData.gender} onChange={handleChange} onBlur={handleBlur} required className={`${getInputStyle("gender", isGenderFilled)} appearance-none cursor-pointer text-slate-500 dark:focus:text-white bg-transparent`}>
              <option value="" disabled hidden className="dark:bg-slate-900">{t("login_page.user_gender")}</option>
              <option value="male" className="dark:bg-slate-900">{t("login_page.gender.male")}</option>
              <option value="female" className="dark:bg-slate-900">{t("login_page.gender.female")}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="relative group">
              <GraduationCap size={18} className={getIconStyle("year", isYearFilled)} />
              <select name="year" value={localData.year} onChange={handleChange} onBlur={handleBlur} required className={`${getInputStyle("year", isYearFilled)} appearance-none cursor-pointer text-slate-500 bg-transparent`}>
                <option value="" disabled hidden className="dark:bg-slate-900">{t("login_page.select_year")}</option>
                <option value="0" className="dark:bg-slate-900">{t("login_page.years.0")}</option>
                <option value="1" className="dark:bg-slate-900">{t("login_page.years.1")}</option>
                <option value="2" className="dark:bg-slate-900">{t("login_page.years.2")}</option>
                <option value="3" className="dark:bg-slate-900">{t("login_page.years.3")}</option>
              </select>
            </div>

            <div className="relative group">
              <CalendarDays size={18} className={getIconStyle("semester", isSemesterFilled)} />
              <select name="semester" value={localData.semester} onChange={handleChange} onBlur={handleBlur} required className={`${getInputStyle("semester", isSemesterFilled)} appearance-none cursor-pointer text-slate-500 bg-transparent`}>
                <option value="" disabled hidden className="dark:bg-slate-900">{t("login_page.select_semester")}</option>
                <option value="0" className="dark:bg-slate-900">{t("login_page.semesters.0")}</option>
                <option value="1" className="dark:bg-slate-900">{t("login_page.semesters.1")}</option>
                <option value="2" className="dark:bg-slate-900">{t("login_page.semesters.2")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Checkbox for Privacy Policy */}
        <div className="flex items-center gap-3 px-2 py-1">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="peer w-5 h-5 rounded-md border-2 border-slate-200 dark:border-slate-800 checked:bg-indigo-600 checked:border-indigo-600 dark:checked:bg-lime-500 dark:checked:border-lime-500 transition-all appearance-none cursor-pointer"
                required
              />
              <CheckCircle2 size={12} className="absolute left-1 text-white dark:text-slate-900 opacity-0 peer-checked:opacity-100 pointer-events-none" />
            </div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-lime-500 transition-colors">
              {t("policies.agree_prefix")}
              <button
                type="button"
                onClick={() => setIsPoliciesOpen(true)}
                className="text-blue-800 dark:text-lime-500 underline font-extrabold hover:text-blue-900 dark:hover:text-lime-400 transition-colors mx-1"
              >
                {t("policies.agree_link")}
              </button>
            </span>
          </label>
        </div>

        {/* زر الانتقال للخطوة التالية */}
        <div className="pt-6">
          <Button type="submit" disabled={loading || !allRequiredFilled} className="w-full flex items-center justify-center gap-3 rounded-full !bg-blue-800 hover:!bg-blue-900 text-white dark:!bg-lime-500 dark:!text-slate-900 border-none font-bold shadow-xl transition-all disabled:opacity-50 h-14">
            <span>{loading ? (isAr ? "جاري..." : "Checking...") : t("login_page.btn_submit")}</span>
            <ArrowRight size={18} className={isAr ? "rotate-180" : ""} />
          </Button>
        </div>

        {/* فاصل "أو بواسطة" وزر جوجل الفعلي */}
        <div className="relative flex items-center justify-center py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
          <span className="relative px-4 text-xs font-medium uppercase text-slate-400 bg-white dark:bg-[#0e1320]">{isAr ? "أو بواسطة" : "Or continue with"}</span>
        </div>

        <div className="w-full flex justify-center">
          <div id="googleSignUpDiv"></div>
        </div>
      </form>

      <AnimatePresence>
        {isPoliciesOpen && (
          <AboutUsModal isOpen={isPoliciesOpen} onClose={() => setIsPoliciesOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}