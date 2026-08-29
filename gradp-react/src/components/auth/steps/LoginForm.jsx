import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui/Button";
import api from "../../../utils/api";

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

export default function LoginForm({ isAr }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const isJustRegistered = urlParams.get("registered") === "true";

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
                // إذا لم يكن مسجلاً، املأ بياناته وانقله لخطوات اختيار تفضيلات السكن
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
              setError(err.message || "Google login failed");
            } finally {
              setLoading(false);
            }
          }
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t("login_page.error_fields_required", "Please fill in all fields"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password, role: 'student' });// حفظ رمز التوثيق (Token)
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));// توجيه المستخدم أو تحديث السياق بناءً على نوع الحساب
      if (response.data.user.role === 'student') {
        window.location.href = "/student";
      } else {
        window.location.href = "/owner-dashboard";
      }
    } catch (err) {
      setError(err.message || t("login_page.error_login_failed", "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleLogin}>
        <div className={`${isAr ? "text-right" : "text-left"}`}>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {t("login_page.login_title")}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t("login_page.login_desc")}
          </p>
        </div>

        {isJustRegistered && (
          <div className="p-3 text-sm text-lime-900 bg-lime-100 border border-lime-200 rounded-xl animate-in fade-in slide-in-from-top-2">
            {isAr ? "تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول." : "Registration successful! You can now log in."}
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-white bg-red-500 rounded-xl">
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
            placeholder={t("login_page.email")}
            className={`h-14 w-full rounded-2xl border border-slate-200 bg-white px-12 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-700/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400 ${isAr ? "text-right" : "text-left"}`}
          />
        </div>

        <div className="relative">
          <Lock
            size={18}
            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isAr ? "right-4" : "left-4"}`}
          />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("login_page.password")}
            className={`h-14 w-full rounded-2xl border border-slate-200 bg-white px-12 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-700/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400 ${isAr ? "text-right" : "text-left"}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 dark:!bg-slate-900 transition-colors ${isAr ? "left-4" : "right-4"}`}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className={`flex ${isAr ? "justify-start" : "justify-end"}`}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/forgot-password")}
            className="text-[10px] font-bold text-slate-400 hover:text-blue-800 dark:hover:text-lime-500 transition-colors !p-0 !h-auto !bg-transparent hover:!bg-transparent border-none"
          >
            {t("login_page.forgot_password")}
          </Button>
        </div>

        <Button type="submit" size="sm" variant="default" className="!bg-blue-800 dark:!bg-lime-500 !text-white dark:!text-slate-900 rounded-2xl w-full h-14 font-bold shadow-lg shadow-blue-500/20 dark:shadow-lime-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : t("login_page.btn_login")}
        </Button>
      </form>

      <div className="relative flex items-center justify-center py-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        </div>
        <span className="relative px-4 text-xs font-medium uppercase text-slate-400 bg-white dark:bg-[#0e1320] transition-colors">
          {isAr ? "أو بواسطة" : "Or continue with"}
        </span>
      </div>
      {/* زر جوجل الفعلي */}
      <div className="w-full flex justify-center">
        <div id="googleSignInDiv"></div>
      </div>
    </div>
  );
}