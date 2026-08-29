import React from "react";
import { motion } from "framer-motion";
import { CigaretteOff, Users, VolumeX, PawPrint, Music, Check, ShieldAlert } from "lucide-react";
import { AVAILABLE_RULES } from "../../../data/ownerDashboardData";

export default function StepHouseRules({ propData, toggleRule, t, isAr }) {
  const getRuleConfig = (key) => {
    switch (key) {
      case "no_smoking":
        return { icon: CigaretteOff, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" };
      case "guests_10pm":
        return { icon: Users, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" };
      case "quiet_hours":
        return { icon: VolumeX, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" };
      case "no_pets":
        return { icon: PawPrint, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" };
      case "no_parties":
        return { icon: Music, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" };
      default:
        return { icon: ShieldAlert, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-800" };
    }
  };

  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="mb-4">
        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">
          {isAr ? "قواعد السكن" : "House Rules"}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isAr
            ? "حدد القواعد التي يجب على المستأجرين الالتزام بها داخل السكن."
            : "Select the rules that tenants must follow in this property."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AVAILABLE_RULES.map((key) => {
          const on = (propData.rules || []).includes(key);
          const config = getRuleConfig(key);
          const RuleIcon = config.icon;
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleRule(key)}
              className={`flex items-center justify-between p-4 rounded-3xl border-2 transition-all duration-300 text-start group hover:scale-[1.01] ${
                on
                  ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 text-slate-900 dark:text-white"
                  : "border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                  on ? config.bg : "bg-slate-100 dark:bg-slate-800"
                }`}>
                  <RuleIcon size={20} className={on ? config.color : "text-slate-400"} />
                </div>
                <div>
                  <h5 className="text-sm font-bold tracking-tight">
                    {t(`property_rules.${key}`)}
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isAr ? "قاعدة مطلوبة" : "Required Rule"}
                  </p>
                </div>
              </div>

              {/* Checkbox status indicator */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                on
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-slate-300 dark:border-slate-700 group-hover:border-slate-400"
              }`}>
                {on && <Check size={14} strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
