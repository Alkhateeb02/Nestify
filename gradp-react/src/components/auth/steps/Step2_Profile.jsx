/* 
 * مكون Step2_Profile الخاص بواجهة المستخدم.
 */
import React, { useState, useRef, useEffect } from "react";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { st2Qus } from "../../../constants/st2Qus";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui/Button";

/*
معاذ + خالد هذا السكشن الي فيه الاسئله عن النفس 
*/
export default function Step2_Profile({ onNext, onBack, isAr }) {
  const { t } = useTranslation();
  const topRef = useRef(null);

  const [qNum, setQNum] = useState(0);
  const [ans, setAns] = useState({});
  const [loading, setLoading] = useState(false);

  const qs = st2Qus;
  const q = qs[qNum];
  const total = qs.length;
  // Progress مصغر للخطوة نفسها
  const percent = ((qNum + 1) / total) * 100;
  const Icon = q.icon;

  function chooseAnswer(qId, value) {
    if (loading) return;

    const newAns = { ...ans, [qId]: value };
    setAns(newAns);
    setLoading(true);

    if (qNum === total - 1) {
      setTimeout(() => {
        setLoading(false);
        onNext?.(newAns);
      }, 300);
    } else {
      setTimeout(() => {
        setQNum(qNum + 1);
        setLoading(false);
      }, 350);
    }
  }

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [qNum]);

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700" ref={topRef}>

      {/* رأس الصفحة مع شريط إنجاز رفيع */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t("login_page.lifestyle_profile")}
          </h2>
          <span className="text-xs font-semibold text-blue-800 dark:text-lime-500 bg-blue-50 dark:bg-lime-500/10 px-2 py-1 rounded-full">{qNum + 1} / {total}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-800 dark:bg-lime-500 transition-all duration-500 ease-out" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div
        key={q.id}
        className={`transition-all duration-300 ease-in-out flex flex-col ${loading ? "opacity-30 scale-[0.99]" : "opacity-100 scale-100"}`}
      >
        {/* أيقونة السؤال والسؤال نفسه بشكل إبداعي */}
        <div className="mb-6 flex items-start gap-4">
          <div className={`flex shrink-0 h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-colors duration-500 ${q.colorClass ? `${q.colorClass.bg} ${q.colorClass.text}` : "bg-blue-800/5 text-blue-800 dark:bg-lime-500/10 dark:text-lime-500"}`}>
            <Icon size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1" dangerouslySetInnerHTML={{ __html: t(q.title) }}></h3>
            {t(q.subtitle) && (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t(q.subtitle)}
              </p>
            )}
          </div>
        </div>
        {/* أزرار الإجابات التفاعلية والكرييتف (Creative List) */}
        <div className="grid grid-cols-1 gap-3 w-full">
          {q.options.map((item) => {
            const selected = ans[q.id] === item.value;
            return (
              <Button
                variant="ghost"
                key={item.value}
                type="button"
                onClick={() => chooseAnswer(q.id, item.value)}
                disabled={loading}
                className={`w-full !justify-start relative rounded-2xl border-2 p-4 h-auto transition-all duration-200 ${isAr ? "text-right" : "text-left"} 
                  ${selected
                    ? "!border-blue-800 !bg-blue-800/5 shadow-lg shadow-blue-800/10 dark:border-lime-500 dark:bg-lime-500/5"
                    : "!border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:!border-lime-500/15 dark:!bg-slate-950 dark:text-slate-300 dark:hover:!border-slate-700"
                  }`}
              >
                <div className="w-full flex items-center justify-between gap-3">
                  <p className={`text-sm font-bold ${selected ? "text-blue-800 dark:text-lime-500" : "text-slate-700 dark:text-slate-300"}`}>
                    {t(item.label)}
                  </p>

                  {/* علامة الصح اللي بتظهر بستايل ناعم لما يختار */}
                  <div className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${selected ? "!bg-blue-800 text-white dark:!bg-lime-500 dark:text-slate-900 scale-100 opacity-100 shadow-sm" : "bg-transparent scale-50 opacity-0"
                    }`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* أزرار التنقل السفلية */}
        <div className="flex w-full items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50">
          {/* زر العودة للخطوة السابقة (اليمين) */}
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={loading}
            className={`flex items-center gap-2 !text-slate-700 dark:!text-slate-200 !bg-slate-100 dark:!bg-slate-800 hover:!bg-slate-200 dark:hover:!bg-slate-700 font-bold py-2.5 px-6 rounded-xl h-auto transition-all scale-95 hover:scale-100 active:scale-95 shadow-sm ${isAr ? "flex-row-reverse" : "flex-row"}`}
          >
            {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span className="text-sm">{t("login_page.back")}</span>
          </Button>

          {/* زر العودة للسؤال السابق (اليسار - أزرق/أخضر مرتب) */}
          {qNum > 0 && (
            <Button
              variant="ghost"
              onClick={() => setQNum(qNum - 1)}
              disabled={loading}
              className={`flex items-center gap-2 !text-white dark:!text-slate-900 !bg-blue-600 dark:!bg-lime-500 hover:!bg-blue-700 dark:hover:!bg-lime-600 font-bold py-2.5 px-6 rounded-xl h-auto transition-all scale-95 hover:scale-100 active:scale-95 shadow-md shadow-blue-600/20 dark:shadow-lime-500/20 ${isAr ? "flex-row-reverse" : "flex-row"}`}
            >
              {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              <span className="text-sm">{t("login_page.previous_question")}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}