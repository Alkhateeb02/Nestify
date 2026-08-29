/* 
 * شريط التنقل العلوي الرئيسي (Navbar).
 * يستخدم في الصفحة الرئيسية فقط ويحتوي على روابط التنقل الداخلية.
 */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Menu, X, Home, LayoutGrid, Info, Phone } from "lucide-react";
import { Button } from "../ui/Button";
import logo from "../../assets/imgs/logo.png";
import logotext from "../../assets/imgs/logo.text.png"
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ hideLinks = false }) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = isAr ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const navLinks = !hideLinks ? [
    { name: t("nav.home"), path: "#hero", icon: Home },
    { name: t("nav.rooms"), path: "#user-paths", icon: LayoutGrid },
    { name: t("nav.features"), path: "#Fe-grid-main", icon: Info },
    { name: t("nav.contact"), path: "#footer", icon: Phone },
  ] : [];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled
          ? "py-[0.8] bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-lg border-b border-slate-200/50 dark:border-slate-700/50"
          : "py-6 bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

          {/* الشعار */}
          <div className="flex-1 flex justify-start items-center">
            <a href="/" aria-label="Go to homepage" className="relative group flex flex-col items-center">
              <img
                src={logo}
                alt="Nestify Logo"
                className={`transition-all duration-500 cursor-pointer object-contain
                  ${scrolled ? "h-8 md:h-10" : "h-12 md:h-16"}
                  drop-shadow-2xl group-hover:scale-105`}
              />
              <img
                src={logotext}
                alt="Nestify Logo Text"
                className="h-4 md:h-15 w-auto cursor-pointer object-contain drop-shadow-xl mt-[-5px] transition-transform group-hover:scale-105"
              />
              <div className="absolute -inset-2 bg-indigo-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </a>
          </div>

          {/* منيو الكمبيوتر (Links) */}
          {navLinks.length > 0 && (
            <div className="hidden md:flex mt-[-30px] items-center justify-center gap-10 flex-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  className={`text-[13px] !font-bold uppercase tracking-[0.15em] transition-all duration-300 relative group
                    ${scrolled ? "text-slate-700 dark:text-slate-200" : "text-white drop-shadow-md"} 
                    hover:text-indigo-600 dark:hover:text-lime-400`}
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#004A8D] to-[#82BC00] transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </div>
          )}

          {/* أزرار (اللغة + الدارك مود) */}
          <div className="hidden md:flex items-center mt-[-30px] justify-end flex-1 gap-4">
            <ThemeToggle />

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
          </div>

          {/* الهامبرغر زر الموبايل */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center !bg-white text-black dark:!bg-gray-800 dark:text-white dark:border-slate-700/40"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav >

      {/* القائمة الجانبية للموبايل */}
      {
        isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] md:hidden" onClick={() => setIsOpen(false)} />
        )
      }

      <div className={`fixed inset-y-0 ${isAr ? 'left-0' : 'right-0'} w-80 bg-white dark:bg-slate-900 z-[120] md:hidden transform transition-transform duration-500 ease-out shadow-2xl ${isOpen ? "translate-x-0" : (isAr ? "-translate-x-full" : "translate-x-full")
        }`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex justify-between items-center border-b border-slate-50 dark:border-slate-800">
            <a href="/" onClick={() => setIsOpen(false)}>
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

          <div className="flex-1 overflow-y-auto p-6 space-y-2 no-scrollbar">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 p-4 text-slate-600 dark:text-slate-300 font-bold hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-[#004A8D] rounded-2xl transition-all ${isAr ? 'flex-row-reverse text-right' : ''}`}
                >
                  <Icon size={22} className="text-[#82BC00]" />
                  <span className="text-lg">{link.name}</span>
                </a>
              );
            })}
          </div>

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
    </>
  );
}