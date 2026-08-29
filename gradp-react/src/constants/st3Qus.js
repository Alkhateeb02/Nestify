import {
  Users,
  UserX,
  BookOpen,
  Coffee,
  Home,
  MoonStar,
  Cigarette,
  Sparkles
} from "lucide-react";

export const st3Qus = (t) => [
  {
    id: "socialType",
    icon: Users,
    title: t("roommate3.questions.socialType.title"),
    subtitle: t("roommate3.questions.socialType.subtitle"),
    colorClass: { bg: "bg-pink-500/10 dark:bg-pink-500/20", text: "text-pink-600 dark:text-pink-400" },
    options: [
      { value: "social", label: t("roommate3.questions.socialType.social") },
      {
        value: "independent",
        label: t("roommate3.questions.socialType.independent"),
      },
    ],
  },

  {
    id: "roomVibe",
    icon: Home,
    title: t("roommate3.questions.roomVibe.title"),
    subtitle: t("roommate3.questions.roomVibe.subtitle"),
    colorClass: { bg: "bg-teal-500/10 dark:bg-teal-500/20", text: "text-teal-600 dark:text-teal-400" },
    options: [
      { value: "study", label: t("roommate3.questions.roomVibe.study") },
      { value: "chill", label: t("roommate3.questions.roomVibe.chill") },
    ],
  },

  {
    id: "sleepType",
    icon: MoonStar,
    title: t("roommate3.questions.sleepType.title"),
    subtitle: t("roommate3.questions.sleepType.subtitle"),
    colorClass: { bg: "bg-indigo-500/10 dark:bg-indigo-500/20", text: "text-indigo-600 dark:text-indigo-400" },
    options: [
      { value: "early", label: t("roommate3.questions.sleepType.early") },
      { value: "flexible", label: t("roommate3.questions.sleepType.flexible") },
      { value: "night", label: t("roommate3.questions.sleepType.night") },
    ],
  },

  {
    id: "studyHabits",
    icon: BookOpen,
    title: t("roommate3.questions.studyHabits.title"),
    subtitle: t("roommate3.questions.studyHabits.subtitle"),
    colorClass: { bg: "bg-orange-500/10 dark:bg-orange-500/20", text: "text-orange-600 dark:text-orange-400" },
    options: [
      { value: "quiet", label: t("roommate3.questions.studyHabits.quiet") },
      { value: "music", label: t("roommate3.questions.studyHabits.music") },
      { value: "flexible", label: t("roommate3.questions.studyHabits.flexible") },
    ],
  },

  {
    id: "hostingStyle",
    icon: Coffee,
    title: t("roommate3.questions.hostingStyle.title"),
    subtitle: t("roommate3.questions.hostingStyle.subtitle"),
    colorClass: { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
    options: [
      { value: "rarely", label: t("roommate3.questions.hostingStyle.rarely") },
      {
        value: "sometimes",
        label: t("roommate3.questions.hostingStyle.sometimes"),
      },
      { value: "often", label: t("roommate3.questions.hostingStyle.often") },
    ],
  },

  {
    id: "socialEnergy",
    icon: UserX,
    title: t("roommate3.questions.socialEnergy.title"),
    subtitle: t("roommate3.questions.socialEnergy.subtitle"),
    colorClass: { bg: "bg-rose-500/10 dark:bg-rose-500/20", text: "text-rose-600 dark:text-rose-400" },
    options: [
      { value: "minimal", label: t("roommate3.questions.socialEnergy.minimal") },
      {
        value: "balanced",
        label: t("roommate3.questions.socialEnergy.balanced"),
      },
      { value: "close", label: t("roommate3.questions.socialEnergy.close") },
    ],
  },
  {
    id: "smoking",
    icon: Cigarette,
    title: t("roommate3.questions.smoking.title"),
    subtitle: t("roommate3.questions.smoking.subtitle"),
    colorClass: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
    options: [
      { value: "smoker", label: t("roommate3.questions.smoking.smoker") },
      { value: "non-smoker", label: t("roommate3.questions.smoking.non-smoker") },
    ],
  },

];