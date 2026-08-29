/* 
* مكون HeroSection الخاص بواجهة المستخدم.
*/
import React, { useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, MapPin, Sparkles, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import AboutUsModal from "../../../components/modals/AboutUsModal";
import heroImg from "../../../assets/imgs/hero_building.jpg";

export function HeroSection() {
  const { t, i18n } = useTranslation();
  const heroRef = useRef(null);
  const isAr = i18n.language === "ar";
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(".hero-content > *", { opacity: 0, x: isAr ? 60 : -60, stagger: 0.2, duration: 1 })
        .from(".hero-image-wrapper", { opacity: 0, scale: 0.9, duration: 1.2 }, "-=0.8")
        .from(".stat-item", { opacity: 0, y: 10, stagger: 0.1, duration: 0.8 }, "-=0.5");

      gsap.to(".hero-image-wrapper", {
        y: -16,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, heroRef);
    return () => ctx.revert();
  }, [isAr]);

  const scrollToPath = () => {
    const element = document.getElementById("user-paths");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center bg-[#F9FAFB] dark:bg-slate-950 overflow-hidden pt-30 font-sans transition-colors duration-500">

      {/* نافذة القوانين والسياسات (About Us) */}
      <AnimatePresence>
        {isAboutOpen && (
          <AboutUsModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        )}
      </AnimatePresence>

      {/* نمط الخلفية المنقطة */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(#4f46e5 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      {/* دوائر الإضاءة الملونة في الخلفية */}
      <div className="absolute top-[-10%] left-[-5%] w-150 h-150 bg-indigo-600/10 dark:bg-indigo-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[0%] right-[0%] w-125 h-125 bg-rose-500/5 dark:bg-rose-500/2 blur-[100px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-6 w-full h-full">
        {/* شبكة التقسيم الرئيسية بين النص والصورة */}
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${isAr ? 'direction-rtl' : 'direction-ltr'}`}>

          {/* القسم النصي والأزرار */}
          <div className={`hero-content space-y-8 pt-10 flex flex-col items-center ${isAr ? "lg:items-start text-right" : "lg:items-start text-left"}`}>

            <div className="w-full flex justify-center lg:justify-center">
              {/* شارة التميز (Badge) */}
              <Badge className="flex items-center justify-center lg:text-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-widest bg-indigo-100! dark:bg-gray-300 text-indigo-900 rounded-full w-fit border-none ">
                <Sparkles size={18} className="text-[#82BC00] fill-[#82BC00]" />
                <span>{t('hero.badge')}</span>
              </Badge>
            </div>

            {/* العنوان الرئيسي الكبير */}
            <h1 className="hero-title text-center lg:justify-center text-6xl md:text-8xl font-[1000] leading-[1.1] tracking-tight w-full text-slate-900 dark:text-white">
              {t('hero.welcome')} <br />
              <span className="bg-gradient-to-r from-blue-800 via-blue-600 to-lime-500 bg-clip-text text-transparent font-black italic 
                 dark:bg-none dark:text-[#82BC00] dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] 
                 transition-all duration-500">NESTIFY.</span>
            </h1>

            {/* النص الوصفي تحت العنوان */}
            <p className="hero-p mx-auto text-center text-xl text-slate-600 dark:text-slate-400 w-full md:w-3/4 leading-relaxed font-medium">
              {t('hero.description')}
            </p>

            {/* أزرار التفاعل (Get Started & About Us) */}
            <div className="hero-btns flex flex-wrap justify-center lg:justify-center gap-4 pt-4 w-full">
              <Button
                onClick={scrollToPath}
                variant="primary"
                size="md"
                className="px-6 py-5 text-xl !bg-[#004A8D] dark:!bg-[#004A8D] text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                icon={ArrowRight}
              >
                {t('hero.get_started')}
              </Button>

              <Button
                onClick={() => setIsAboutOpen(true)}
                variant="outline"
                size="md"
                className="px-6 py-5 text-xl !text-black dark:!text-black-200 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {t('hero.about_us')}
              </Button>
            </div>

            {/* قسم الإحصائيات والأرقام */}
            <div className="flex gap-8 pt-10 border-t border-slate-200 dark:border-slate-800 justify-center lg:justify-center w-full">
              <div className="stat-item text-center lg:text-start">
                <p className="text-3xl font-black text-slate-900 dark:text-white">+150</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Student</p>
              </div>
              <div className="stat-item text-center lg:text-start">
                <p className="text-3xl font-black text-slate-900 dark:text-white">+50</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Properties</p>
              </div>
              <div className="stat-item flex items-center gap-2 text-emerald-600 dark:text-emerald-400 justify-center lg:justify-start">
                <CheckCircle size={20} />
                <p className="text-sm font-bold uppercase tracking-widest">Trusted</p>
              </div>
            </div>
          </div>

          {/* القسم الجمالي للصورة المتحركة */}
          <div className="hero-image-wrapper relative hidden lg:block">
            {/* الخلفية الملونة تحت الصورة */}
            <div className={`absolute inset-0 bg-indigo-600/5 dark:bg-[#004A8D]/10 rounded-[4rem] transform ${isAr ? 'rotate-6' : '-rotate-6'}`} />

            <div className="relative z-10 rounded-[3.5rem] overflow-hidden border-16 border-white dark:border-slate-900 shadow-2xl shadow-indigo-900/10 transition-colors duration-500">
              <img
                src={heroImg}
                alt="Ma'an Student Housing"
                className="w-full h-[500px] object-cover"
              />

              {/* البطاقة العائمة فوق الصورة */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-slate-800 flex justify-between items-center transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-[#82BC00]">
                    <MapPin size={24} />
                  </div>
                  <div className={isAr ? "text-right" : "text-left"}>
                    <p className="font-black text-slate-900 dark:text-white">Al Hussein University</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">2 Mins Distance</p>
                  </div>
                </div>
                <div className="bg-[#004A8D] dark:bg-[#004A8D] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase">
                  Active
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}