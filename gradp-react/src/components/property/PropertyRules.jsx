import React from "react";
import { useTranslation } from "react-i18next";
import {
    CigaretteOff, Users, Music,
    Ban, CheckCircle2, AlertCircle,
    VolumeX, PawPrint
} from "lucide-react";

export default function PropertyRules({ rules = [] }) {
    const { t } = useTranslation();

    // Enforce default rules if undefined
    const safeRules = rules || [];

    const ruleItems = [
        {
            key: "no_smoking",
            icon: CigaretteOff,
            checked: safeRules.includes("no_smoking"),
            trueState: {
                text: t("property_rules.no_smoking"),
                badgeColorClass: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
                isAllowed: false
            },
            falseState: {
                text: t("property_rules.smoking_allowed"),
                badgeColorClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
                isAllowed: true
            }
        },
        {
            key: "guests_10pm",
            icon: Users,
            checked: safeRules.includes("guests_10pm"),
            trueState: {
                text: t("property_rules.guests_time"),
                badgeColorClass: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
                isAllowed: false
            },
            falseState: {
                text: t("property_rules.guests_free"),
                badgeColorClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
                isAllowed: true
            }
        },
        {
            key: "quiet_hours",
            icon: VolumeX,
            checked: safeRules.includes("quiet_hours"),
            trueState: {
                text: t("property_rules.quiet_hours"),
                badgeColorClass: "text-slate-600 bg-slate-100 dark:bg-slate-800",
                isAllowed: false
            },
            falseState: {
                text: t("property_rules.quiet_none"),
                badgeColorClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
                isAllowed: true
            }
        },
        {
            key: "no_pets",
            icon: PawPrint,
            checked: safeRules.includes("no_pets"),
            trueState: {
                text: t("property_rules.no_pets"),
                badgeColorClass: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
                isAllowed: false
            },
            falseState: {
                text: t("property_rules.pets_allowed"),
                badgeColorClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
                isAllowed: true
            }
        },
        {
            key: "no_parties",
            icon: Music,
            checked: safeRules.includes("no_parties"),
            trueState: {
                text: t("property_rules.no_parties"),
                badgeColorClass: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
                isAllowed: false
            },
            falseState: {
                text: t("property_rules.parties_allowed"),
                badgeColorClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
                isAllowed: true
            }
        }
    ];

    return (
        <div className="space-y-4 py-2">
            {ruleItems.map((item, idx) => {
                const state = item.checked ? item.trueState : item.falseState;
                const Icon = item.icon;
                return (
                    <div key={idx} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-200">
                        <div className="flex items-center gap-3.5">
                            <div className={`p-2.5 rounded-xl transition-all duration-200 ${state.badgeColorClass}`}>
                                <Icon size={20} />
                            </div>
                            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-200">
                                {state.text}
                            </span>
                        </div>
                        {state.isAllowed ? (
                            <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                        ) : (
                            <Ban size={20} className="text-rose-500 shrink-0" />
                        )}
                    </div>
                );
            })}
            
            {/* Warning Message */}
            <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100/50 dark:border-amber-500/10">
                <AlertCircle size={22} className="text-amber-500 shrink-0" />
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                    {t("property_rules.strict_adherence")}
                </p>
            </div>
        </div>
    );
}
