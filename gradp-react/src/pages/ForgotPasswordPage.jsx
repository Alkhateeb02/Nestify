/* 
 * صفحة "نسيت كلمة المرور" (Forgot Password Page)
 * بتحتوي على حقل إيميل وزر إرسال رابط الإعادة.
 * بعد الإرسال بتظهر رسالة نجاح ثم بتُعيد المستخدم لصفحة تسجيل الدخول.
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight, CheckCircle, Send, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import InnerNavbar from "../components/layout/InnerNavbar";
import BackgroundBlobs from "../components/ui/BackgroundBlobs";
import { Button } from "../components/ui/Button";

export default function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();

  // الحالات (States) الخاصة بالنموذج
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // تأثير دخول الصفحة (Mount Animation)
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // معالجة الضغط على زر "إرسال رابط الإعادة"
  const handleSubmit = (e) => {
    e.preventDefault();

    // التحقق من الإيميل (Validation)
    if (!email.trim()) {
      setError(t("forgot_password_page.error_empty"));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t("forgot_password_page.error_invalid"));
      return;
    }

    setError("");
    setLoading(true);

    // محاكاة الإرسال للباك إند (Simulation)
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  // وظيفة العودة لصفحة تسجيل الدخول
  const handleBackToLogin = () => {
    navigate("/login?registered=true");
  };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen w-screen flex flex-col font-sans bg-white dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden"
    >
      <BackgroundBlobs />
      <InnerNavbar hideLinks={true} />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 pt-24 pb-12">
        {/* زر العودة (Back Button) */}
        <div
          className={`absolute top-20 lg:top-24 start-[50px] z-30 transition-opacity duration-700 ${isMounted ? "opacity-100" : "opacity-0"
            }`}
        >
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-slate-400 hover:text-[#004A8D] dark:hover:text-lime-500 transition-colors text-sm font-medium"
          >
            {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span>{t("forgot_password_page.back_to_login")}</span>
          </button>
        </div>

        {/* كارد النموذج (Main Form Card) */}
        <div
          className={`
            w-full max-w-md
            rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700/50
            bg-white/80 dark:bg-[#0e1320]/80 backdrop-blur-2xl
            shadow-[0_40px_60px_-15px_rgba(132,204,22,0.9)] dark:shadow-[0_50px_60px_-15px_rgba(132,204,22,0.3)]
            transition-all duration-1000 ease-out hover:shadow-[0_30px_70px_-15px_rgba(132,204,22,0.7)]
            transform ${isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}
            p-8 sm:p-12
          `}
        >
          {sent ? (
            /* حالة النجاح (Success State) */
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-lime-50 dark:bg-lime-900/30 flex items-center justify-center animate-bounce-once">
                <CheckCircle size={44} className="text-lime-500" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {t("forgot_password_page.success_title")}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {t("forgot_password_page.success_msg", { email })}
                </p>
              </div>

              {/* ملاحظة بسيطة للمستخدم */}
              <div className="w-full p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-500/20 text-start">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  {t("forgot_password_page.note_title")}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {t("forgot_password_page.note_msg")}
                </p>
              </div>

              <Button
                onClick={handleBackToLogin}
                variant="default"
                size="default"
                className="!bg-blue-800 dark:!bg-lime-500 !text-white dark:!text-slate-900 rounded-2xl w-full h-14 font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t("forgot_password_page.back_to_login")}
              </Button>
            </div>
          ) : (
            /* نموذج إدخال البريد (Form Input) */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={isAr ? "text-right" : "text-left"}>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                  <Mail size={28} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {t("forgot_password_page.form_title")}
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {t("forgot_password_page.form_desc")}
                </p>
              </div>

              {error && (
                <div className="p-3 text-sm text-white bg-red-500 rounded-xl animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div className="relative">
                <Mail
                  size={18}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isAr ? "right-4" : "left-4"}`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("forgot_password_page.email_ph")}
                  className={`h-14 w-full rounded-2xl border border-slate-200 bg-white px-12 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-700/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400 transition-all ${isAr ? "text-right" : "text-left"
                    }`}
                />
              </div>

              <Button
                type="submit"
                size="default"
                variant="default"
                disabled={loading}
                className="!bg-blue-800 dark:!bg-lime-500 !text-white dark:!text-slate-900 rounded-2xl w-full h-14 font-bold shadow-lg shadow-blue-500/20 dark:shadow-lime-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Send size={18} className={isAr ? "ms-2" : "me-2"} />
                    {t("forgot_password_page.send_btn")}
                  </>
                )}
              </Button>

              <p className={`text-center text-sm text-slate-500 ${isAr ? "text-right" : "text-left"}`}>
                {t("forgot_password_page.remember_pwd")}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-bold text-blue-600 dark:text-lime-500 hover:underline"
                >
                  {t("forgot_password_page.sign_in_btn")}
                </button>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
