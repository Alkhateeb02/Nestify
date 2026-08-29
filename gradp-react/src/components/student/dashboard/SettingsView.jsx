
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Heart, Users, Settings as SettingsIcon } from "lucide-react";
import ProfileSection from "./settings/ProfileSection";
import LifestyleStep2 from "./settings/LifestyleStep2";
import LifestyleStep3 from "./settings/LifestyleStep3";

export default function SettingsView({ isAr, viewportVariants }) {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: isAr ? "المعلومات الشخصية" : "Profile Info", icon: User },
    { id: "step2", label: isAr ? "أسلوب حياتك" : "My Lifestyle", icon: Heart },
    { id: "step3", label: isAr ? "تفضيلات شريك السكن" : "Roommate Prefs", icon: Users },
  ];

  return (
    /* الحاوية (Container) الرئيسية لكل صفحة الإعدادات مع حركات الدخول */
    <motion.div
      variants={viewportVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8"
    >
      {/* سيكشن رأس الصفحة (Header): اللي فيه الأيقونة والعنوان والوصف */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "الإعدادات" : "Settings"}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {isAr ? "عدل معلوماتك وتفضيلاتك بكل سهولة" : "Manage your profile and preferences"}
          </p>
        </div>
      </div>

      {/* سيكشن التبديل بين الأقسام (Tabs): الكبسات اللي فوق اللي بتنقلك بين الأقسام */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-700 rounded-2xl w-fit ">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all 
              ${activeTab === tab.id
                ? "!bg-slate-100/50 dark:!bg-slate-900 !text-blue-600 dark:!text-lime-400 shadow-sm"
                : "!text-slate-500 hover:!text-slate-700 dark:!bg-slate-700  dark:!text-white  dark:hover:!text-slate-300"}
            `}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* منطقة عرض المحتوى (Viewport): هون بيظهر القسم اللي الطالب اختاره */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* عرض المكون المناسب بناءً على التاب المختارة */}
            {activeTab === "profile" && <ProfileSection isAr={isAr} />}
            {activeTab === "step2" && <LifestyleStep2 isAr={isAr} />}
            {activeTab === "step3" && <LifestyleStep3 isAr={isAr} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
