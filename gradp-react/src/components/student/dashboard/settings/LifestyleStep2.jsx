
import React, { useState, useEffect } from "react";
import { Check, Save, CheckCircle } from "lucide-react";
import { st2Qus } from "../../../../constants/st2Qus";
import { useTranslation } from "react-i18next";
import api from "../../../../utils/api";

export default function LifestyleStep2({ isAr }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get("/users/preferences");
        if (res.success && res.data) {
          setAnswers(res.data);
          localStorage.setItem("lifestyle_step2", JSON.stringify(res.data));
        } else {
          const savedLeisure = localStorage.getItem("lifestyle_step2");
          if (savedLeisure) {
            setAnswers(JSON.parse(savedLeisure));
          }
        }
      } catch (err) {
        console.error("Failed to fetch preferences:", err);
        const savedLeisure = localStorage.getItem("lifestyle_step2");
        if (savedLeisure) {
          setAnswers(JSON.parse(savedLeisure));
        }
      }
    };
    fetchPrefs();
  }, []);

  const handleSelect = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/users/preferences", answers);
      localStorage.setItem("lifestyle_step2", JSON.stringify(answers));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save preferences:", err);
      alert(isAr ? "حدث خطأ أثناء حفظ البيانات" : "An error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* الكونتينر الأساسي لأسئلة أسلوب الحياة */
    <div className="space-y-10">
      
      {/* شبكة عرض الأسئلة (كل سؤال بكارد منفصل) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {st2Qus.map((q) => {
          const Icon = q.icon;
          return (
            /* الكارد اللي فيها عنوان السؤال والأيقونة والخيارات */
            <div key={q.id} className="space-y-4 p-6 rounded-[2rem] bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 transition-all hover:shadow-md">
              
              {/* العنوان والأيقونة تاعت السؤال */}
              <div className="flex items-center gap-4 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${q.colorClass.bg} ${q.colorClass.text}`}>
                  <Icon size={20} />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: t(q.title) }}></h4>
              </div>

              {/* أزرار الخيارات اللي بيختار منها الطالب */}
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => {
                  const isSelected = answers[q.id] === opt.value;
                  return (
                    /* كبسة الخيار، شكلها بتغير إذا كانت هي اللي مختارها */
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(q.id, opt.value)}
                      className={`
                        flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                        ${isSelected 
                          ? "!bg-blue-600 dark:!bg-lime-500 !text-white dark:text-slate-900 shadow-lg scale-[1.02]" 
                          : "!bg-white dark:!bg-slate-900/50 !text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"}
                      `}
                    >
                      <span>{t(opt.label)}</span>
                      {isSelected && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* المنطقه اللي فيها زر الحفظ في آخر الصفحة */}
      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-white/5">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`
            flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all
            ${saved 
              ? "!bg-green-500 !text-white" 
              : "!bg-blue-600 hover:!bg-blue-700 dark:!bg-lime-500 dark:hover:!bg-lime-600 !text-white dark:!text-slate-900"}
            disabled:opacity-50 shadow-lg
          `}
        >
          {loading ? (
            /* اللودر اللي بلف */
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            /* الصح اللي بيطلع بس نخلص */
            <CheckCircle size={20} />
          ) : (
            /* شكل الديسك توب تاع الحفظ */
            <Save size={20} />
          )}
          <span>{saved ? t("student_settings.actions.updated") : t("student_settings.actions.update_lifestyle")}</span>
        </button>
      </div>
    </div>
  );
}
