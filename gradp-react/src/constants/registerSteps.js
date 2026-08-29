import { User, HeartHandshake, SlidersHorizontal } from "lucide-react";
export const STEPS = (t) => [
  {
    id: 1,
    title: t("steps.personal_info"),
    subtitle: t("steps.personal_info_sub"),
    icon: User,
  },
  {
    id: 2,
    title: t("steps.lifestyle"),
    subtitle: t("steps.lifestyle_sub"),
    icon: HeartHandshake,
  },
  {
    id: 3,
    title: t("steps.preferences"),
    subtitle: t("steps.preferences_sub"),
    icon: SlidersHorizontal,
  },
];