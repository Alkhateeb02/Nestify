import { 
  Wifi, BedDouble, CookingPot, Snowflake, Car, ShowerHead, Droplets 
} from "lucide-react";

export const FEATURE_CONFIG = [
  {
    key: "wifi",
    icon: Wifi,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-800/30",
  },
  {
    key: "furnished",
    icon: BedDouble,
    color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    border: "border-indigo-100 dark:border-indigo-800/30",
  },
  {
    key: "kitchen",
    icon: CookingPot,
    color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-800/30",
  },
  {
    key: "ac",
    icon: Snowflake,
    color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400",
    border: "border-cyan-100 dark:border-cyan-800/30",
  },
  {
    key: "parking",
    icon: Car,
    color: "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    border: "border-slate-100 dark:border-slate-700",
  },
  {
    key: "laundry",
    icon: Droplets,
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-800/30",
  },
  {
    key: "privateBathroom",
    icon: ShowerHead,
    color: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
    border: "border-rose-100 dark:border-rose-800/30",
  },
];
