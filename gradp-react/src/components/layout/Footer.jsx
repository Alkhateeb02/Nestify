/* 
 * تذييل الصفحة (Footer) الذي يحتوي على روابط سريعة ومعلومات التواصل.
 */
import React from "react";
import { Mail, MapPin, Phone, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "../../assets/imgs/logo.png";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const quickLinks = [
    { name: t("footer.links.home"), path: "#hero" },
    { name: t("footer.links.find_room"), path: "#user-paths" },
    { name: t("footer.links.features"), path: "#features" },
    { name: t("footer.links.about_maan"), path: "https://ar.wikipedia.org/wiki/معان" },
  ];

  const supportLinks = [
    { name: t("footer.links.faq") },
    { name: t("footer.links.privacy") },
    { name: t("footer.links.terms") },
    { name: t("footer.links.contact_us") },
  ];

  return (
    <footer id="footer" className="relative bg-white dark:bg-slate-950 pt-24 pb-12 overflow-hidden border-t border-slate-100 dark:border-slate-900 font-sans transition-colors duration-500">

      {/* خط علوي متدرج */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#004A8D] to-[#82BC00] opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

          {/* العمود الأول: الشعار */}
          <div className="space-y-8">
            <div className="relative inline-flex flex-col items-center group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full opacity-0 dark:opacity-100 transition-opacity" />
              <img
                src={logo}
                alt="Nestify Logo"
                className="h-20 md:h-24 w-auto relative z-10 drop-shadow-2xl transition-transform group-hover:scale-105 duration-500 cursor-pointer object-contain"
              />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-lg">
              {t("footer.description")}
            </p>
          </div>

          {/* العمود الثاني: روابط التنقل */}
          <div className={`${isAr ? 'lg:pr-10' : 'lg:pl-10'}`}>
            <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm mb-8 flex items-center gap-2">
              {t("footer.quick_links")}
            </h3>
            <ul className="space-y-5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.path} className={`text-slate-500 dark:text-slate-400 font-bold hover:text-[#004A8D] dark:hover:text-[#82BC00] transition-all inline-block hover:${isAr ? '-translate-x-2' : 'translate-x-2'}`}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* العمود الثالث: الدعم */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm mb-8">
              {t("footer.support")}
            </h3>
            <ul className="space-y-5">
              {supportLinks.map((info) => (
                <li key={info.name} className="text-slate-500 dark:text-slate-400 font-bold hover:text-[#82BC00] cursor-pointer transition-colors">
                  {info.name}
                </li>
              ))}
            </ul>
          </div>

          {/* العمود الرابع: التواصل */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
            <h3 className="text-[#004A8D] dark:text-[#82BC00] font-black uppercase tracking-widest text-sm mb-8">
              {t("footer.contact")}
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4 text-slate-600 dark:text-slate-300 font-bold">
                <MapPin size={22} className="text-[#82BC00] shrink-0" />
                <span className="text-sm">{t("footer.location")}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300 font-bold">
                <Phone size={22} className="text-[#004A8D] shrink-0" />
                <span className="text-sm" dir="ltr">+962 7X XXX XXXX</span>
              </div>
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300 font-bold">
                <Mail size={22} className="text-[#82BC00] shrink-0" />
                <span className="text-sm">support@nestify.jo</span>
              </div>
            </div>
          </div>

        </div>

        {/* الجزء السفلي */}
        <div className="pt-10 border-t border-slate-100 dark:border-slate-900 flex flex-col items-center gap-4 text-center">
          <p className="text-slate-400 dark:text-slate-500 font-bold text-xs tracking-widest uppercase">
            © {new Date().getFullYear()} NESTIFY. {t("footer.rights")}
          </p>

          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-black text-sm uppercase tracking-tighter">
            {t("footer.built_with")}
            <Heart size={18} className="text-[#82BC00] fill-[#82BC00] animate-pulse" />
            {t("footer.for_students")}
          </div>
        </div>
      </div>
    </footer>
  );
}