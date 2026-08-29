/* 
 * مكون يحتوي على التأثيرات البصرية والخلفيات المتحركة لتعزيز التصميم.
 */
import React from "react";

/* ── حلقة دائرية دوّارة للديكور الخلفي ── */
export function Ring({ size, border, color, speed, opacity, top, left, right, bottom, style: customStyle }) {
  // بنجمع خصائص الاستايل كلها عشان نتحكم في موقع وسرعة الحلقة
  const style = {
    width: size, height: size,
    top, left, right, bottom,
    borderWidth: border,
    borderColor: color,
    opacity,
    animationDuration: speed,
    ...customStyle
  };

  return (
    <div
      className="pointer-events-none absolute rounded-full border animate-spin-slow"
      style={style}
    />
  );
}

/* ── نقطة مضيئة طافية للديكور الخلفي ── */
export function Dot({ className, style }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={style}
    />
  );
}

/* ── تجميعة الديكورات الكاملة للصفحة ── */
export function PageBackground() {
  return (
    <>
      {/* خلفية: تدرج ناعم فقط */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,74,141,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,74,141,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(130,188,0,0.08),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(130,188,0,0.15),transparent)]" />
      </div>

      {/* حلقات دوّارة زخرفية */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Ring size="520px" border="1px" color="rgba(0,74,141,0.12)" speed="30s" opacity={1} top="-160px" left="-160px" />
        <Ring size="340px" border="1px" color="rgba(0, 73, 141, 0.34)" speed="22s" opacity={1} top="-80px" left="-80px" style={{ animationDirection: "reverse" }} />
        <Ring size="420px" border="1px" color="rgba(130,188,0,0.12)" speed="28s" opacity={1} top="30%" right="-130px" />
        <Ring size="240px" border="1px" color="rgba(128, 188, 0, 0.36)" speed="18s" opacity={1} top="38%" right="-60px" />
        <Ring size="200px" border="1px" color="rgba(99,102,241,0.15)" speed="20s" opacity={1} bottom="15%" left="20%" />
      </div>

      {/* نقاط ضوئية طافية */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Dot className="h-3 w-3 bg-[#004A8D]/8 dark:bg-blue-400/40 animate-float-slow" style={{ top: "22%", left: "8%" }} />
        <Dot className="h-2 w-2 bg-[#82BC00]/40 dark:bg-lime-400/50 animate-float-med" style={{ top: "35%", left: "14%" }} />
        <Dot className="h-4 w-4 bg-indigo-400/25 dark:bg-indigo-400/40 animate-float-slow" style={{ top: "18%", right: "12%", animationDelay: "1s" }} />
        <Dot className="h-2.5 w-2.5 bg-amber-400 dark:bg-amber-400/40 animate-float-med" style={{ top: "55%", right: "8%", animationDelay: "3s" }} />
        <Dot className="h-5 w-5 bg-[#004A8D]/15 dark:bg-blue-500/20 animate-float-slow blur-sm" style={{ top: "70%", left: "5%", animationDelay: "2s" }} />
      </div>
    </>
  );
}
