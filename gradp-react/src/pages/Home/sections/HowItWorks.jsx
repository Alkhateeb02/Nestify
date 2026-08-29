/* 
 * مكون HowItWorks الخاص بواجهة المستخدم.
 */
import React, { useLayoutEffect, useRef } from "react";
import { MousePointerClick, SplitSquareVertical, User, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import { Badge } from "../../../components/ui/Badge";

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks() {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef(null);
  const isAr = i18n.language === "ar";

  const steps = [
    { number: "01", title: t("how_it_works.steps.step1.title"), description: t("how_it_works.steps.step1.desc"), icon: MousePointerClick, color: "bg-[#004A8D]" },
    { number: "02", title: t("how_it_works.steps.step2.title"), description: t("how_it_works.steps.step2.desc"), icon: SplitSquareVertical, color: "bg-[#82BC00]" },
    { number: "03", title: t("how_it_works.steps.step3.title"), description: t("how_it_works.steps.step3.desc"), icon: User, color: "bg-[#003566]" },
    { number: "04", title: t("how_it_works.steps.step4.title"), description: t("how_it_works.steps.step4.desc"), icon: Sparkles, color: "bg-[#689600]" },
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".timeline-progress", { scaleY: 0 }, {
        scaleY: 1, ease: "none", transformOrigin: "top",
        scrollTrigger: { trigger: ".timeline-container", start: "top 70%", end: "bottom 20%", scrub: 0.6 }
      });

      gsap.utils.toArray(".step-item").forEach((item) => {
        gsap.fromTo(item, { opacity: 0, y: 50 }, {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 85%", toggleActions: "play none none reverse" }
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-18 bg-[#F9FAFB] w-screen left-1/2 -translate-x-1/2 overflow-hidden font-sans dark:bg-slate-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="text-center mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#004A8D]/10 text-[#004A8D] mb-6 font-bold border border-[#004A8D]/20 dark:bg-slate-900/50 dark:text-blue-300 dark:border-blue-800">
            <Sparkles size={16} className="text-[#82BC00] fill-[#82BC00]" />
            <span>{t("how_it_works.badge")}</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-[1000] text-slate-900 leading-[1.1] tracking-tight dark:text-white">
            {t("how_it_works.title_part1")}
            <span className=" text-lime-500">
              {t("how_it_works.title_part2")}
            </span>
          </h2>

          <p className="text-lg text-slate-500 mt-6 font-medium max-w-lg mx-auto dark:text-slate-400">
            {t("how_it_works.subtitle")}
          </p>
        </div>

        <div className="timeline-container relative max-w-6xl mx-auto">
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 border-l-2 border-dashed border-slate-200 dark:border-slate-800 hidden md:block" />

          <div className="timeline-progress absolute left-1/2 top-0 z-[0] hidden h-full w-1 -translate-x-1/2 bg-gradient-to-b from-[#004A8D] to-[#82BC00] md:block rounded-full" />

          <div className="space-y-24 md:space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 1;
              const rowDirection = isAr ? (isEven ? "md:flex-row" : "md:flex-row-reverse") : (isEven ? "md:flex-row-reverse" : "md:flex-row");

              return (
                <div key={step.number} className={`step-item relative flex items-center justify-between md:mb-32 ${rowDirection}`}>
                  <div className="w-full md:w-[42%] group relative">
                    {/* طبقة التوهج الأبيض (Halo) خلف الكرت */}
                    <div className="absolute inset-0 bg-white/5 dark:bg-white/10 blur-[30px] rounded-[2.5rem] opacity-0 dark:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    {/*هاي لون الكارد*/}
                    <div className={`relative bg-white shadow-lime-300/70 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
                      dark:shadow-[0_0_30px_rgba(130,188,0,0.5)] 
                      ${isAr ? "text-right" : "text-left"}`}>

                      <span className={`absolute -top-6 ${isAr ? "-left-4" : "-right-4"} text-7xl font-black !text-lime-500 group-hover:text-[#82BC00]/10 transition-all duration-700 pointer-events-none select-none dark:text-lime-400 dark:group-hover:text-[#82BC00]/5`}>
                        {step.number}
                      </span>

                      <div className={`${step.color} size-14 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg rotate-3 group-hover:rotate-0 transition-transform`}>
                        <Icon size={28} />
                      </div>

                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">
                        <span className="text-[#82BC00]">#</span> {step.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  <div className="absolute left-1/2 z-10 hidden -translate-x-1/2 md:flex items-center justify-center">
                    <div className="size-16 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-800 shadow-2xl flex items-center justify-center transition-colors">
                      <div className={`size-12 ${step.color} rounded-full flex items-center justify-center text-white font-black text-lg`}>
                        {step.number}
                      </div>
                    </div>
                  </div>
                  <div className="hidden w-[42%] md:block" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}