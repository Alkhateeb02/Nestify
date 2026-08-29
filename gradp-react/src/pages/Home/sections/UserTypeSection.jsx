/* 
 * مكون UserTypeSection الخاص بواجهة المستخدم.
 */
import { GraduationCap, ArrowRight, Sparkles, Building2, MapPin, ShieldCheck, Wallet, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Card, CardContent } from "../../../components/ui/Card";

export function UserTypeSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === "ar";
  const handleStudentClick = () => {
    navigate("/student");
  };

  const handleOwnerClick = () => {
    navigate("/owner-login");
  };

  const cards = [
    {
      id: "student",
      title: t("user_type.student.title"),
      desc: t("user_type.student.desc"),
      color: "bg-[#004A8D]",
      num: "01",
      icon: <GraduationCap className="size-10 text-white" />,
      btn: t("user_type.student.btn"),
      btnClasses: "bg-[#004A8D]! hover:bg-[#003566]! shadow-[#004A8D]/20",
      iconColor: "text-[#004A8D] dark:text-[#3b82f6]",
      glowGradient: "before:bg-[conic-gradient(from_0deg,transparent_25%,#3b82f6_50%,transparent_75%,#004A8D_100%)]",
      features: [
        { text: t("user_type.student.f1"), icon: <MapPin className="size-5" /> },
        { text: t("user_type.student.f2"), icon: <Zap className="size-5" /> },
        { text: t("user_type.student.f3"), icon: <ShieldCheck className="size-5" /> },
        { text: t("user_type.student.f4"), icon: <Sparkles className="size-5" /> }
      ]
    },
    {
      id: "owner",
      title: t("user_type.owner.title"),
      desc: t("user_type.owner.desc"),
      color: "bg-[#82BC00]",
      num: "02",
      icon: <Building2 className="size-10 text-white" />,
      btn: t("user_type.owner.btn"),
      btnClasses: "bg-[#82BC00]! hover:bg-[#689600]! shadow-[#82BC00]/20",
      iconColor: "text-[#82BC00]",
      glowGradient: "before:bg-[conic-gradient(from_0deg,transparent_25%,#bef264_50%,transparent_75%,#82BC00_100%)]",
      features: [
        { text: t("user_type.owner.f1"), icon: <Wallet className="size-5" /> },
        { text: t("user_type.owner.f2"), icon: <Sparkles className="size-5" /> },
        { text: t("user_type.owner.f3"), icon: <Zap className="size-5" /> },
        { text: t("user_type.owner.f4"), icon: <ShieldCheck className="size-5" /> },
      ]
    }
  ];

  return (
    <section className="relative bg-[#F9FAFB] pt-8 pb-30  w-screen left-1/2 -translate-x-1/2 overflow-hidden font-sans dark:bg-slate-950 transition-colors duration-500" >
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="text-center mb-20 max-w-3xl mx-auto">
          <Badge className="mb-6 mx-auto dark:bg-slate-900 dark:border-slate-800">
            <Sparkles size={16} className="fill-[#82BC00] text-[#82BC00]" />
            <span className="dark:text-slate-300 ms-2">{t("user_type.badge")}</span>
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6 dark:text-white">
            {t("user_type.title_part1")}
            <span className="text-lime-500 uppercase dark:text-[#82BC00]">{t("user_type.title_part2")}</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed dark:text-slate-400">
            {t("user_type.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto" id="user-paths" >
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`group relative p-10 transition-all duration-500 hover:-translate-y-2 rounded-[3rem] border-none shadow-2xl shadow-black shadow-slate-200/50 
          bg-white dark:bg-slate-900 dark:shadow-[0_0_30px_rgba(255,255,255,0.08)] 
          dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] 
          ${isAr ? "text-right" : "text-left"}
          overflow-hidden
          before:absolute before:inset-[-200%] before:bg-[conic-gradient(from_0deg,transparent_25%,#3b82f6_50%,transparent_75%,#70e000_100%)]
          before:animate-[spin_4s_linear_infinite]
          after:absolute after:inset-0.5 after:bg-inherit after:rounded-[calc(3rem-2px)]
          `}
            >
              {/* التوهج الخلفي (Blur) */}
              <div className="absolute inset-0 bg-white/5 blur-2xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hidden dark:block z-0" />
              <span className={`
  absolute top-8 ${isAr ? 'left-10' : 'right-10'} 
  text-8xl font-black z-10 
  ${isAr ? "text-right" : "text-left"}

          {اللون تبع اللوان}
  bg-gradient-to-br from-[#3b82f6] to-[#70e000] 
  bg-clip-text text-transparent
          {هذا توهج الي ورا الرقم}
  drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]
          {وضوج الالوان }
  opacity-70 dark:opacity-30 
  group-hover:opacity-50 transition-opacity
`}>
                {card.num}
              </span>

              <CardContent className="p-0 relative z-20">
                <div className={`${card.color} w-20 h-20 rounded-[1.75rem] flex items-center justify-center shadow-xl mb-8 transform ${isAr ? "-rotate-3" : "rotate-3"} group-hover:rotate-0 transition-transform`}>
                  {card.icon}
                </div>

                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">
                  {card.title}
                </h3>

                <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 font-medium leading-relaxed h-20 overflow-hidden line-clamp-2">
                  {card.desc}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-10">
                  {card.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#F9FAFB] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-50 dark:border-slate-800 transition-all group-hover:bg-white dark:group-hover:bg-slate-800 shadow-sm group-hover:shadow-md">
                      <div className={card.iconColor}>{feature.icon}</div>
                      <span className="text-slate-700 dark:text-slate-200 font-bold text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    if (card.id === "student") {
                      handleStudentClick();
                    } else if (card.id === "owner") {
                      handleOwnerClick();
                    }
                  }}
                  className={`w-full py-8! text-xl rounded-2xl! text-white! font-[1000] transition-all transform active:scale-[0.98] ${card.btnClasses}`}
                  icon={ArrowRight}
                >
                  {card.btn}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}