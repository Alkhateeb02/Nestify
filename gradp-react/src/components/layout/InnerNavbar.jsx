/**
 * شريط التنقل العلوي الداخلي (InnerNavbar)
 * يتم عرضه في لوحة التحكم والصفحات الداخلية للمستخدمين المسجلين دخولهم.
 * يحتوي على أيقونة الإشعارات، زر لوحة التحكم، زر تسجيل الخروج، وتغيير اللغات والوضع الليلي.
 */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Menu, X, LogIn, LayoutDashboard, LogOut, Bell } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import logo from "../../assets/imgs/logo.png";
import ThemeToggle from "./ThemeToggle";
import NotificationModal from "../modals/NotificationModal";
import api from "../../utils/api";

export default function InnerNavbar({ hideDashboard = false }) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAr = i18n.language === "ar";

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isLoggedIn = !!token;

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      const getUnreadCount = async () => {
        try {
          const res = await api.get("/notifications");
          if (res.success && res.data) {
            setUnreadCount(res.data.filter(n => !n.is_read).length);
          }
        } catch (e) {
          console.error("Failed to load notifications count:", e);
        }
      };
      getUnreadCount();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // دالة لتغيير لغة التطبيق وتغيير اتجاه النص بالكامل (RTL للمستند في حالة العربية)
  const toggleLanguage = () => {
    const newLang = isAr ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  // عملية تسجيل الخروج، تمسح التوكن والمعلومات من الذاكرة المحلية وتوجه المستخدم للرئيسية
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled
          ? "py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-lg border-b border-slate-200/50 dark:border-slate-700/50"
          : "py-6 bg-transparent"
          }`}
      >
        <div className="w-full px-[50px] flex justify-between items-center">
          {/* قسم الشعار واللوجو مع ربط ديناميكي للرئيسية حسب نوع المستخدم */}
          <div className="flex-1 flex justify-start items-center mt-[-18px]">
            <a
              href={user?.role === 'landlord' ? "/" : (isLoggedIn ? "/student" : "/")}
              aria-label="Go to homepage"
              className="relative group flex flex-col items-center"
            >
              <img
                src={logo}
                alt="Nestify Logo"
                className={`transition-all duration-500 cursor-pointer object-contain
                  ${scrolled ? "h-8 md:h-10" : "h-12 md:h-16"}
                  drop-shadow-2xl group-hover:scale-105`}
              />
            </a>
          </div>

          {/* أزرار الكمبيوتر (اللغة + الوضع المظلم + الإشعارات + لوحة التحكم/تسجيل الدخول) */}
          <div className="hidden md:flex items-center justify-end flex-1 gap-4">
            {/* زر تبديل الثيم المظلم والمضيء */}
            <ThemeToggle />
            
            {/* زر تبديل اللغة */}
            <Button
              variant="primary"
              onClick={toggleLanguage}
              className={`gap-2 !rounded-xl transition-all font-bold ${scrolled
                ? "!bg-[#004A8D] text-white dark:!bg-[#1d293d] dark:!text-lime-500 dark:hover:!bg-[#2a3a54]"
                : "!bg-white !text-[#004A8D] shadow-xl dark:!bg-[#1d293d] dark:!text-lime-500 dark:hover:!bg-[#2a3a54]"
                }`}
            >
              <Globe size={16} />
              {isAr ? "English" : "العربية"}
            </Button>

            {isLoggedIn ? (
              <>
                {/* زر جرس الإشعارات يظهر فقط بعد تسجيل الدخول */}
                <button
                  onClick={() => setIsNotificationOpen(true)}
                  className={`relative p-2.5 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center cursor-pointer ${
                    scrolled
                      ? "text-[#004A8D] dark:text-lime-500 hover:bg-slate-100 dark:hover:bg-slate-855"
                      : "!bg-white !text-[#004A8D] dark:!bg-slate-800 dark:!text-lime-500 shadow-xl border border-slate-100 dark:border-white/5"
                  }`}
                >
                  <Bell size={18} className={unreadCount > 0 ? "animate-wiggle" : ""} />
                  {/* شارة غير مقروء (النقطة الحمراء المتحركة) */}
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </button>

                {/* زر التوجه للداشبورد (لوحة التحكم) */}
                {!hideDashboard && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentPath = window.location.pathname;
                      if (currentPath === '/student-dashboard') {
                        window.location.href = '/student-dashboard';
                      } else {
                        window.location.href = user?.role === 'landlord' ? '/owner-dashboard' : '/student-dashboard';
                      }
                    }}
                    className={`gap-2 !rounded-xl transition-all duration-300 font-bold border-none shadow-lg ${scrolled
                      ? "!bg-[#004A8D] !text-white hover:!bg-blue-800 dark:!bg-[#1d293d] dark:!text-lime-500 dark:hover:!bg-[#2a3a54]"
                      : "!bg-white !text-[#004A8D] hover:!bg-slate-50 dark:!bg-[#1d293d] dark:!text-lime-500 dark:hover:!bg-[#2a3a54]"
                      }`}
                  >
                    <LayoutDashboard size={16} />
                    {isAr ? "لوحة التحكم" : "Dashboard"}
                  </Button>
                )}

                {/* زر خروج */}
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className={`gap-2 !rounded-xl transition-all duration-300 font-bold border-none ${scrolled
                    ? "!text-slate-700 dark:!text-red-400"
                    : "!text-slate-900 dark:!text-red-400"
                    } dark:!bg-[#1d293d] hover:!text-red-500 dark:hover:!text-red-300 hover:!bg-red-50 dark:hover:!bg-red-500/20`}
                >
                  <LogOut size={16} />
                  {isAr ? "خروج" : "Logout"}
                </Button>
              </>
            ) : (
              // في حال لم يسجل دخوله يظهر زر دخول
              <Button
                variant="outline"
                onClick={() => window.location.href = '/login'}
                className={`gap-2 !rounded-xl transition-all duration-300 font-bold border-none shadow-lg ${scrolled
                  ? "!bg-[#004A8D] !text-white hover:!bg-blue-800 dark:!bg-lime-500 dark:!text-slate-950 dark:hover:!bg-lime-400"
                  : "!bg-white !text-[#004A8D] hover:!bg-slate-50 dark:!bg-lime-500 dark:!text-slate-950 dark:hover:!bg-lime-400"
                  }`}
              >
                <LogIn size={16} />
                {isAr ? "دخول" : "Login"}
              </Button>
            )}
          </div>

          {/* قسم أزرار الموبايل وشريط الهامبرغر */}
          <div className="md:hidden flex items-center gap-3">
            {isLoggedIn && (
              // جرس الإشعارات للموبايل
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-2 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center bg-white text-[#004A8D] dark:bg-gray-855 dark:text-lime-500 border border-slate-100 dark:border-slate-750"
              >
                <Bell size={22} className={unreadCount > 0 ? "animate-wiggle" : ""} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            )}
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center !bg-white text-black dark:!bg-gray-800 dark:text-white dark:border-slate-700/40"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* خلفية تظليل القائمة الجانبية للهاتف المحمول */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* القائمة الجانبية المنزلقة للهاتف المحمول */}
      <div className={`fixed inset-y-0 ${isAr ? 'left-0' : 'right-0'} w-80 bg-white dark:bg-slate-900 z-[120] md:hidden transform transition-transform duration-500 ease-out shadow-2xl ${isOpen ? "translate-x-0" : (isAr ? "-translate-x-full" : "translate-x-full")
        }`}>
        <div className="flex flex-col h-full">
          {/* الترويسة بالقائمة الجانبية */}
          <div className="p-6 flex justify-between items-center border-b border-slate-50 dark:border-slate-800">
            <a href={user?.role === 'landlord' ? "/" : (isLoggedIn ? "/student" : "/")} onClick={() => setIsOpen(false)}>
              <img src={logo} alt="Logo" className="h-12 w-auto" />
            </a>
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="!bg-[#004A8D] !text-white !rounded-full"
            >
              <X size={24} className="text-white" />
            </Button>
          </div>

          {/* محتوى الروابط والتحكم بالقائمة الجانبية */}
          <div className="flex-1 overflow-y-auto p-6 space-y-2 no-scrollbar">
            {isLoggedIn ? (
              <>
                {!hideDashboard && (
                  <button
                    onClick={() => {
                      const currentPath = window.location.pathname;
                      if (currentPath === '/student-dashboard') {
                        window.location.href = '/student-dashboard';
                      } else {
                        window.location.href = user?.role === 'landlord' ? '/owner-dashboard' : '/student-dashboard';
                      }
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 text-slate-600 dark:text-slate-300 font-bold hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-[#004A8D] rounded-2xl transition-all ${isAr ? 'flex-row-reverse text-right' : ''}`}
                  >
                    <LayoutDashboard size={22} className="text-[#004A8D]" />
                    <span className="text-lg">{isAr ? "لوحة التحكم" : "Dashboard"}</span>
                  </button>
                )}

                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className={`w-full flex items-center gap-4 p-4 text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all ${isAr ? 'flex-row-reverse text-right' : ''}`}
                >
                  <LogOut size={22} />
                  <span className="text-lg">{isAr ? "تسجيل الخروج" : "Logout"}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => { window.location.href = '/login'; setIsOpen(false); }}
                className={`w-full flex items-center gap-4 p-4 text-slate-600 dark:text-slate-300 font-bold hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-[#004A8D] rounded-2xl transition-all ${isAr ? 'flex-row-reverse text-right' : ''}`}
              >
                <LogIn size={22} className="text-[#004A8D]" />
                <span className="text-lg">{isAr ? "دخول" : "Login"}</span>
              </button>
            )}
          </div>

          {/* زر تبديل اللغة وتغييرها من أسفل القائمة */}
          <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <Button
              variant="primary"
              size="lg"
              className="w-full gap-3 !bg-gradient-to-r !from-[#004A8D] !to-[#82BC00] text-white border-none shadow-lg"
              onClick={() => { toggleLanguage(); setIsOpen(false); }}
            >
              <Globe size={20} />
              {isAr ? "Switch to English" : "تغيير للغة العربية"}
            </Button>
          </div>
        </div>
      </div>

      {/* مودال نافذة الإشعارات ويتحكم بظهوره وحركته سلاسة الـ AnimatePresence */}
      <AnimatePresence>
        {isNotificationOpen && (
          <NotificationModal
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            onUnreadCountChange={setUnreadCount}
          />
        )}
      </AnimatePresence>
    </>
  );
}
