

import React from "react";
import { motion } from "framer-motion";
import { Wrench, Users, ClipboardList, ChevronRight, Zap, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
};

export default function QuickActions() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();

  const actions = [
    {
      id: "maintenance",
      label: isAr ? "طلب صيانة" : "Maintenance",
      desc: isAr ? "تحتاج مساعدة؟" : "Need help?",
      icon: Wrench,
      gradient: "from-orange-400 to-rose-500",
      shadow: "shadow-orange-500/20",
      action: () => navigate("/student-maintenance"),
    },
    {
      id: "roommate",
      label: isAr ? "شريك السكن" : "Roommate",
      desc: isAr ? "دردشة وتنسيق" : "Chat & plan",
      icon: Users,
      gradient: "from-indigo-400 to-blue-600",
      shadow: "shadow-blue-500/20",
    },
    {
      id: "bookings",
      label: isAr ? "حجوزاتي" : "Bookings",
      desc: isAr ? "سجل الحجز" : "History",
      icon: ClipboardList,
      gradient: "from-emerald-400 to-teal-600",
      shadow: "shadow-emerald-500/20",
    },
  ];

  return (
    <motion.div 
      variants={containerVariants} initial="hidden" animate="show" 
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {actions.map(({ id, label, desc, icon: Icon, gradient, shadow, action }) => (
        <motion.button
          key={id}
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={action}
          className={`relative group h-40 overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-xl ${shadow} border border-slate-100 dark:border-slate-800 flex flex-col justify-between text-start transition-all duration-300`}
        >
          {/* Decorative Pattern */}
          <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 rounded-full blur-2xl transition-opacity`}></div>
          
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shadow-black/5`}>
             <Icon size={28} strokeWidth={2.5} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight leading-none">{label}</h4>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1.5">{desc}</p>
              </div>
              <div className={`w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:scale-110 transition-all`}>
                <ChevronRight size={18} className={isAr ? "rotate-180" : ""} />
              </div>
            </div>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}


