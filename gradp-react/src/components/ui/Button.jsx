/* 
 * مكون Button الخاص بواجهة المستخدم.
 */
import React from "react";
import { cn } from "./cn";

/* UI Component: Button
   هذا المكون يدعم تغيير الحجم (Size) والنوع (Variant) لتقليل تكرار الكود.
*/
export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  const variants = {
    default:
      "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95",
    outline:
      "border-2 border-slate-200 bg-transparent text-slate-900 hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800",
    secondary:
      "bg-slate-900 text-white hover:bg-slate-800 active:scale-95",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
    success:
      "bg-lime-500 text-white shadow-lg shadow-lime-500/20 hover:bg-lime-600 active:scale-95",
    brandDark:
      "bg-blue-900 text-white hover:bg-blue-800 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700",
  };

  // تعريف الأحجام (Sizes)
  const sizes = {
    default: "h-11 px-6 py-2 text-base",
    sm: "h-9 px-4 text-sm",
    md: "h-10 px-5 text-base",
    lg: "h-14 px-10 text-xl font-black",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        // كلاسات ثابتة لكل الأزرار
        "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}