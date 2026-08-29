import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Lock, ShieldCheck, ArrowLeft, Eye, EyeOff, Save, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import Navbar from "../components/layout/Navbar";
import BackgroundBlobs from "../components/ui/BackgroundBlobs";
import api from "../utils/api";

export default function ChangePasswordPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const toggleShow = (field) => {
    setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (formData.newPassword !== formData.confirmPassword) {
      setError(isAr ? "كلمات المرور الجديدة غير متطابقة" : "New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError(isAr ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setSuccess(true);
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      // Redirect after 2 seconds
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        navigate(user.role === 'landlord' ? "/owner-dashboard" : "/student-dashboard");
      }, 2000);
    } catch (err) {
      setError(err.message || (isAr ? "حدث خطأ أثناء تغيير كلمة المرور" : "Failed to change password"));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = `w-full ${isAr ? "pr-12 text-right" : "pl-12"} py-4 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-lime-500 text-slate-900 dark:text-white font-medium backdrop-blur-xl`;
  const iconStyle = `absolute ${isAr ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 dark:group-focus-within:text-lime-500 transition-colors`;
  const toggleStyle = `absolute ${isAr ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1`;

  return (
    <div className="min-h-screen w-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden">
      <BackgroundBlobs />
      <Navbar hideLinks={true} />

      <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4 relative z-10">
        <div className={`w-full max-w-lg transition-all duration-1000 transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>

          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-8 group flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:hover:text-lime-500 transition-all border-none !bg-transparent"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">{isAr ? "الرجوع" : "Go Back"}</span>
          </Button>

          <div className="bg-white/80 dark:bg-[#0e1320]/80 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700/50 p-8 sm:p-12 shadow-2xl shadow-blue-500/10 dark:shadow-lime-500/5">

            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 dark:bg-lime-500/10 text-blue-600 dark:text-lime-500 mb-6">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
                {isAr ? "تغيير كلمة المرور" : "Change Password"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {isAr ? "قم بتحديث كلمة المرور الخاصة بك لتأمين حسابك" : "Update your password to keep your account secure"}
              </p>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {isAr ? "تم التغيير بنجاح!" : "Changed Successfully!"}
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  {isAr ? "سيتم توجيهك الآن إلى لوحة التحكم..." : "You are being redirected to your dashboard..."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    {isAr ? "كلمة المرور الحالية" : "Current Password"}
                  </label>
                  <div className="relative group">
                    <Lock size={18} className={iconStyle} />
                    <input
                      type={showPass.current ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                      className={inputStyle}
                    />
                    <button type="button" onClick={() => toggleShow('current')} className={toggleStyle}>
                      {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800/50 my-2" />

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    {isAr ? "كلمة المرور الجديدة" : "New Password"}
                  </label>
                  <div className="relative group">
                    <Lock size={18} className={iconStyle} />
                    <input
                      type={showPass.new ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      className={inputStyle}
                    />
                    <button type="button" onClick={() => toggleShow('new')} className={toggleStyle}>
                      {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    {isAr ? "تأكيد كلمة المرور" : "Confirm Password"}
                  </label>
                  <div className="relative group">
                    <Lock size={18} className={iconStyle} />
                    <input
                      type={showPass.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className={inputStyle}
                    />
                    <button type="button" onClick={() => toggleShow('confirm')} className={toggleStyle}>
                      {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 dark:from-lime-500 dark:to-lime-600 text-white shadow-xl shadow-blue-500/20 dark:shadow-lime-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save size={20} />
                      <span>{isAr ? "حفظ التغييرات" : "Save Changes"}</span>
                    </div>
                  )}
                </Button>

              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
