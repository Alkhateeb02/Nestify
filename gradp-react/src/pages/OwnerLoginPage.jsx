/* 
 * صفحة تسجيل الدخول للملاك (OwnerLoginPage)
 * بتسمح للمالك يسجل حساب جديد أو يدخل على حسابه الموجود
 */
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import api from "../utils/api";
import InnerNavbar from "../components/layout/InnerNavbar";
import AuthShowcase from "../components/auth/AuthShowcase";
import { User, Phone, Lock, Building, Users, ArrowRight, Mail, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import AboutUsModal from "../components/modals/AboutUsModal";
import { Button } from "../components/ui/Button";
import ownerImg from "../assets/imgs/undraw_select-house_l2l0.svg";
import { useNavigate } from "react-router-dom";
import BackgroundBlobs from "../components/ui/BackgroundBlobs";

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

export default function OwnerLoginPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();
  const formSectionRef = useRef(null);

  // الحالات (States) تاعت الفورم
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ name: '', gender: '', phone: '', email: '', password: '', bankName: '', bankAccountHolderName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [touched, setTouched] = useState({});

  // فحوصات التحقق الحية (Live validation checks)
  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = (phone) => /^07[789]\d{7}$/.test(phone);

  // فحوصات كلمة المرور
  const passLength = formData.password.length >= 8;
  const passNum = /\d/.test(formData.password);
  const passLower = /[a-z]/.test(formData.password);
  const passUpper = /[A-Z]/.test(formData.password);
  const passSpecial = /[@$!%*?&#^()_+=\-[\]{}|;:'",.<>/?`~]/.test(formData.password);
  const isPasswordValid = passLength && passNum && passLower && passUpper && passSpecial;

  const isNameFilled = formData.name.trim().length > 0;
  const isGenderFilled = formData.gender.length > 0;
  const isBankNameFilled = formData.bankName.trim().length >= 2 && /^[a-zA-Z\s\u0600-\u06FF]+$/.test(formData.bankName.trim());
  const isBankAccountHolderNameFilled = formData.bankAccountHolderName.trim().length >= 2 && /^[a-zA-Z\s\u0600-\u06FF]+$/.test(formData.bankAccountHolderName.trim());

  const allRequiredFilled = isLogin 
    ? (isEmailValid(formData.email) && formData.password.length > 0)
    : (isNameFilled && isGenderFilled && isPhoneValid(formData.phone) && isBankNameFilled && isBankAccountHolderNameFilled && isEmailValid(formData.email) && isPasswordValid && agreed);

  // أول ما تفتح الصفحة بنفعل الحركات (Animations)
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // تهيئة تسجيل الدخول بواسطة Google للملاك
  useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "573386894778-teif34kcrdka1r7gfj6euovvc09ustup.apps.googleusercontent.com",
          callback: async (response) => {
            setLoading(true);
            setError("");
            try {
              const res = await api.post("/auth/google-login", { 
                token: response.credential, 
                role: "landlord"
              });
              if (res.success && res.data) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                navigate("/owner-dashboard");
              }
            } catch (err) {
              setError(err.message || "Google login failed");
            } finally {
              setLoading(false);
            }
          }
        });

        window.google.accounts.id.renderButton(
          document.getElementById("ownerGoogleSignInDiv"),
          { 
            theme: "outline", 
            size: "large", 
            shape: "pill",
            width: 380,
            text: "signin_with"
          }
        );
      }
    };

    loadGoogleGsiScript(isAr ? "ar" : "en", initGoogle);
  }, [isAr]);

  // تجهيز النصوص اللي بتظهر في القسم الجانبي (Showcase)
  const content = {
    title: isLogin ? t("owner_login.title_login") : t("owner_login.title_register"),
    subtitle: isLogin ? t("owner_login.subtitle_login") : t("owner_login.subtitle_register"),
    img: ownerImg,
    badge: isLogin ? t("owner_login.badge_login") : t("owner_login.badge_register"),
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // ستايلات موحدة للمدخلات (Inputs)
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

  // تحديث البيانات لما المستخدم يكتب
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const filteredValue = value.replace(/[^a-zA-Z\u0621-\u064A\s]/g, ""); // أحرف عربي وإنجليزي بس
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
      return;
    }

    if (name === "phone") {
      const filteredValue = value.replace(/\D/g, "").slice(0, 10); // أرقام بس لحد 10 خانات
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // عملية الإرسال (Submit) للدخول أو التسجيل
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!allRequiredFilled) {
      setError(isAr ? "يرجى تعبئة الحقول بالشكل الصحيح أولاً" : "Please fill all fields correctly first");
      return;
    }

    setLoading(true);

    try {
      if (!isLogin) {
        // --- مسار التسجيل ---
        // Validation: bankName and bankAccountHolderName are required and must be valid
        if (!formData.bankName || formData.bankName.trim().length < 2) {
          setError(isAr ? "اسم البنك يجب أن يتكون من حرفين على الأقل" : "Bank Name must be at least 2 characters");
          setLoading(false);
          return;
        }
        if (!/^[a-zA-Z\s\u0600-\u06FF]+$/.test(formData.bankName.trim())) {
          setError(isAr ? "اسم البنك يجب أن يحتوي على حروف فقط" : "Bank Name must only contain letters");
          setLoading(false);
          return;
        }
        if (!formData.bankAccountHolderName || formData.bankAccountHolderName.trim().length < 2) {
          setError(isAr ? "اسم صاحب الحساب يجب أن يتكون من حرفين على الأقل" : "Bank Account Holder Name must be at least 2 characters");
          setLoading(false);
          return;
        }
        if (!/^[a-zA-Z\s\u0600-\u06FF]+$/.test(formData.bankAccountHolderName.trim())) {
          setError(isAr ? "اسم صاحب الحساب يجب أن يحتوي على حروف فقط" : "Bank Account Holder Name must only contain letters");
          setLoading(false);
          return;
        }

        // 1. نتأكد إذا الإيميل موجود أصلاً
        const checkEmailRes = await api.post("/auth/check-email", { email: formData.email });
        if (checkEmailRes.exists || checkEmailRes.data?.exists) {
          setError(isAr ? "هذا البريد الإلكتروني مسجل مسبقاً" : "This email is already registered");
          setLoading(false);
          return;
        }

        // 2. نتأكد إذا رقم الهاتف موجود أصلاً
        const checkPhoneRes = await api.post("/auth/check-phone", { phoneNumber: formData.phone });
        if (checkPhoneRes.exists || checkPhoneRes.data?.exists) {
          setError(isAr ? "رقم الهاتف هذا مسجل مسبقاً" : "This phone number is already registered");
          setLoading(false);
          return;
        }
        
        // 3. نسجل الحساب
        const res = await api.post("/auth/register", {
          fullName: formData.name,
          email: formData.email,
          password: formData.password,
          role: "landlord",
          phoneNumber: formData.phone,
          bankName: formData.bankName,
          bankAccountHolderName: formData.bankAccountHolderName
        });
        
        if (res.success) {
          setError("");
          alert(isAr 
            ? "تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب قبل تسجيل الدخول." 
            : "Registration successful! Please check your email to verify your account before logging in."
          );
          setIsLogin(true);
        }
      } else {
        // --- مسار تسجيل الدخول ---
        const res = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
          role: 'landlord'
        });
        
        if (res.success && res.data) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          navigate("/owner-dashboard");
        } else {
          setError(isAr ? "بيانات الدخول غير صحيحة" : "Invalid credentials");
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || (isAr ? "حدث خطأ غير متوقع" : "An unexpected error occurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col font-sans bg-white dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden">
      <BackgroundBlobs />
      <InnerNavbar hideLinks={true} />
      
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 pt-20 px-4 sm:px-8 lg:px-12 relative">
        {/* زر الرجوع للرئيسية */}
        <div className={`absolute top-20 lg:top-24 start-[50px] z-30 transition-opacity duration-1000 ${isMounted ? "opacity-100" : "opacity-0"}`}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-400 hover:text-blue-800 dark:hover:text-lime-500 transition-colors border-none !bg-transparent">
            {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span>{isAr ? "الرئيسية" : "Home"}</span>
          </Button>
        </div>

        {/* القسم الجانبي (Showcase) */}
        <div className={`lg:-mt-1 lg:-translate-y-1 transition-all duration-1000 ease-out transform ${isMounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
          <AuthShowcase content={content} step={1} isLogin={isLogin} />
        </div>

        {/* بوكس الفورم الأساسي */}
        <div className={`
          m-4 sm:m-8 lg:m-12 flex flex-col justify-center
          rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700/50 
          bg-white/80 dark:bg-[#0e1320]/80 backdrop-blur-2xl 
          shadow-[0_40px_60px_-15px_rgba(59,130,246,0.3)] dark:shadow-[0_50px_60px_-15px_rgba(132,204,22,0.1)] 
          transition-all duration-1000 ease-out transform ${isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}
        `}>
          <div ref={formSectionRef} className="flex flex-col items-center justify-center pt-6 sm:pt-12 lg:pt-16 pb-4 sm:pb-8 lg:pb-10 px-6 sm:px-12 lg:px-16 h-full">
            <div className="w-full max-w-md">
              
              {/* تبديل بين (تسجيل | دخول) */}
              <div className="mb-10 w-full flex gap-4 relative border-b-2 border-slate-100 dark:border-slate-800/50 pb-2">
                <div className="absolute bottom-[-2px] h-[2px] bg-blue-800 dark:bg-lime-500 shadow-[0_1px_8px_rgba(59,130,246,0.6)] transition-all duration-500 pointer-events-none"
                  style={{ width: "calc(50% - 8px)", [isAr ? 'right' : 'left']: isLogin ? 'calc(50% + 8px)' : '0%' }}
                />
                <Button variant="ghost" size="sm" onClick={() => setIsLogin(false)} className={`flex-1 !bg-transparent border-none ${!isLogin ? "!text-slate-900 dark:!text-white font-bold" : "!text-slate-400"}`}>
                  {t("owner_login.btn_register_tab")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsLogin(true)} className={`flex-1 !bg-transparent border-none ${isLogin ? "!text-slate-900 dark:!text-white font-bold" : "!text-slate-400"}`}>
                  {t("owner_login.btn_login_tab")}
                </Button>
              </div>

              {/* الفورم الفعلي */}
              <div className="w-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <>
                      <div className="relative group">
                        <User size={18} className={getIconStyle("name", isNameFilled)} />
                        <input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} required placeholder={t("owner_login.full_name")} className={getInputStyle("name", isNameFilled)} />
                      </div>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="relative group">
                          <Users size={18} className={getIconStyle("gender", isGenderFilled)} />
                          <select name="gender" value={formData.gender} onChange={handleChange} onBlur={handleBlur} required className={`${getInputStyle("gender", isGenderFilled)} appearance-none cursor-pointer bg-transparent`}>
                            <option value="" disabled hidden className="dark:bg-slate-900">{t("owner_login.gender")}</option>
                            <option value="male" className="dark:bg-slate-900">{t("owner_login.male")}</option>
                            <option value="female" className="dark:bg-slate-900">{t("owner_login.female")}</option>
                          </select>
                        </div>
                        <div>
                          <div className="relative group">
                            <Phone size={18} className={getIconStyle("phone", isPhoneValid(formData.phone))} />
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} required placeholder={t("owner_login.phone")} className={getInputStyle("phone", isPhoneValid(formData.phone))} />
                          </div>
                          {touched.phone && !isPhoneValid(formData.phone) && (
                            <p className="text-[11px] text-red-500 mt-1 font-bold px-2">
                              {isAr ? "رقم الهاتف غير صحيح (يجب أن يبدأ بـ 077 أو 078 أو 079 ويتكون من 10 أرقام)" : "Invalid phone (must start with 077, 078, or 079 and be 10 digits)"}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="relative group">
                          <Building size={18} className={getIconStyle("bankName", isBankNameFilled)} />
                          <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} onBlur={handleBlur} required placeholder={isAr ? "اسم البنك" : "Bank Name"} className={getInputStyle("bankName", isBankNameFilled)} />
                        </div>
                        <div className="relative group">
                          <User size={18} className={getIconStyle("bankAccountHolderName", isBankAccountHolderNameFilled)} />
                          <input type="text" name="bankAccountHolderName" value={formData.bankAccountHolderName} onChange={handleChange} onBlur={handleBlur} required placeholder={isAr ? "اسم صاحب الحساب" : "Bank Account Holder Name"} className={getInputStyle("bankAccountHolderName", isBankAccountHolderNameFilled)} />
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <div className="relative group">
                      <Mail size={18} className={getIconStyle("email", isEmailValid(formData.email))} />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required placeholder={t("owner_login.email")} className={getInputStyle("email", isEmailValid(formData.email))} />
                    </div>
                    {touched.email && !isEmailValid(formData.email) && (
                      <p className="text-[11px] text-red-500 mt-1 font-bold px-2">
                        {isAr ? "صيغة البريد الإلكتروني غير صحيحة" : "Invalid email format"}
                      </p>
                    )}
                    {error && <p className="text-red-500 text-xs font-medium px-2 mt-1">{error}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="relative group">
                      <Lock size={18} className={getIconStyle("password", isLogin ? formData.password.length > 0 : isPasswordValid)} />
                      <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} required placeholder={t("owner_login.password")} className={getInputStyle("password", isLogin ? formData.password.length > 0 : isPasswordValid)} />
                      <Button type="button" variant="ghost" onClick={() => setShowPassword(!showPassword)} className={`absolute ${isAr ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 text-slate-400 !p-0 !bg-transparent border-none`}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                    
                    {!isLogin && touched.password && (
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

                    {/* رابط نسيت كلمة المرور */}
                    {isLogin && (
                      <div className={`flex ${isAr ? "justify-start" : "justify-end"}`}>
                        <button type="button" onClick={() => navigate("/change-password")} className="text-[10px] font-bold text-slate-400 hover:text-blue-800 dark:hover:text-lime-500 transition-colors">
                          {t("owner_login.forgot_password")}
                        </button>
                      </div>
                    )}
                  </div>

                  {!isLogin && (
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
                  )}

                  <div className="pt-6">
                    <Button type="submit" disabled={loading || !allRequiredFilled} className="w-full h-14 rounded-full !bg-blue-800 text-white dark:!bg-lime-500 dark:!text-slate-900 border-none font-bold shadow-xl transition-all disabled:opacity-50">
                      <span>{loading ? (isAr ? "جاري..." : "Checking...") : isLogin ? t("owner_login.btn_submit_login") : t("owner_login.btn_submit_register")}</span>
                      <ArrowRight size={18} className={isAr ? "rotate-180" : ""} />
                    </Button>
                  </div>
                </form>

                {/* فاصل "أو بواسطة" */}
                <div className="relative flex items-center justify-center py-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
                  <span className="relative px-4 text-xs font-medium uppercase text-slate-400 bg-white dark:bg-[#0e1320]">{isAr ? "أو بواسطة" : "Or continue with"}</span>
                </div>

                {/* زر جوجل الفعلي */}
                <div className="w-full flex justify-center">
                  <div id="ownerGoogleSignInDiv"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isPoliciesOpen && (
          <AboutUsModal isOpen={isPoliciesOpen} onClose={() => setIsPoliciesOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
