import {
  MoonStar,
  BookOpen,
  Sparkles,
  Users,
  Volume2,
  DoorOpen,
  Cigarette,
} from "lucide-react";
export const st2Qus = [
  {
    id: "sleepSchedule",
    icon: MoonStar,
    title: "quiz.sleep.title",
    subtitle: "quiz.sleep.subtitle",
    colorClass: { bg: "bg-indigo-500/10 dark:bg-indigo-500/20", text: "text-indigo-600 dark:text-indigo-400" },
    options: [
      { value: "early_sleeper", label: "quiz.sleep.early_sleeper" },
      { value: "balanced", label: "quiz.sleep.balanced" },
      { value: "night_owl", label: "quiz.sleep.night_owl" },
    ],
  },
  {
    id: "studyStyle",
    icon: BookOpen,
    title: "quiz.study.title",
    subtitle: "quiz.study.subtitle",
    colorClass: { bg: "bg-orange-500/10 dark:bg-orange-500/20", text: "text-orange-600 dark:text-orange-400" },
    options: [
      { value: "quiet_focused", label: "quiz.study.quiet_focused" },
      { value: "flexible", label: "quiz.study.flexible" },
      { value: "background_music", label: "quiz.study.background_music" },
    ],
  },
  {
    id: "cleanlinessLevel",
    icon: Sparkles,
    title: "quiz.cleanliness.title",
    subtitle: "quiz.cleanliness.subtitle",
    colorClass: { bg: "bg-teal-500/10 dark:bg-teal-500/20", text: "text-teal-600 dark:text-teal-400" },
    options: [
      { value: "very_clean", label: "quiz.cleanliness.very_clean" },
      { value: "moderate", label: "quiz.cleanliness.moderate" },
      { value: "relaxed", label: "quiz.cleanliness.relaxed" },
    ],
  },
  {
    id: "socialStyle",
    icon: Users,
    title: "quiz.social.title",
    subtitle: "quiz.social.subtitle",
    colorClass: { bg: "bg-pink-500/10 dark:bg-pink-500/20", text: "text-pink-600 dark:text-pink-400" },
    options: [
      { value: "introvert", label: "quiz.social.introvert" },
      { value: "ambivert", label: "quiz.social.ambivert" },
      { value: "extrovert", label: "quiz.social.extrovert" },
    ],
  },
  {
    id: "noiseTolerance",
    icon: Volume2,
    title: "quiz.noise.title",
    subtitle: "quiz.noise.subtitle",
    colorClass: { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
    options: [
      { value: "very_quiet", label: "quiz.noise.very_quiet" },
      { value: "moderate", label: "quiz.noise.moderate" },
      { value: "doesnt_matter", label: "quiz.noise.doesnt_matter" },
    ],
  },
  {
    id: "guestsVisitors",
    icon: DoorOpen,
    title: "quiz.guests.title",
    subtitle: "quiz.guests.subtitle",
    colorClass: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
    options: [
      { value: "rarely", label: "quiz.guests.rarely" },
      { value: "sometimes", label: "quiz.guests.sometimes" },
      { value: "often", label: "quiz.guests.often" },
    ],
  },
  {
    id: "smoking",
    icon: Cigarette,
    title: "quiz.smoking.title",
    subtitle: "quiz.smoking.subtitle",
    colorClass: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
    options: [
      { value: "smoker", label: "quiz.smoking.smoker" },
      { value: "non-smoker", label: "quiz.smoking.non-smoker" },
    ],
  },
];