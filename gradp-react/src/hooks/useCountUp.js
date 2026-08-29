import { useState, useEffect, useRef } from "react";

/**
 * هوك (Hook) مخصص لعمل عدّاد تصاعدي للأرقام (Animation)
 * بياخذ رقم وبيمشي عليه شوي شوي لحد ما يوصله بطريقة ناعمة
 * @param {number} target - الرقم النهائي اللي بدنا نوصلّه
 * @param {number} duration - مدة الحركة بالمللي ثانية (الافتراضي 900)
 */
export function useCountUp(target, duration = 900) {
  const [display, setDisplay] = useState(target);
  const raf = useRef(null);
  const startV = useRef(null);
  const fromV = useRef(target);

  useEffect(() => {
    const from = fromV.current;
    const to = target;
    if (from === to) return;

    const startTime = performance.now();
    fromV.current = to;

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // تأثير easeOutCubic عشان تبطئ الحركة في النهاية وتعطي شعور طبيعي
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * ease));

      if (progress < 1) raf.current = requestAnimationFrame(step);
    };

    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return display;
}
