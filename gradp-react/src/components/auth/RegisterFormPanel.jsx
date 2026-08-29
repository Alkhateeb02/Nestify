/* 
 * مكون يحتوي على نماذج تسجيل الدخول وإنشاء حساب جديد للمستخدمين.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import StepPill from "./StepPill";
import LoginForm from "./steps/LoginForm";
import { Button } from "../ui/Button";

/*
  هاد المكون هو الجزء اليمين بالصفحة تبعة التسجيل والدخول
  شغلتو ببساطة
  1 يعرض التابات (Tab) عشان تبدل بين "تسجيل الدخول" وبين "إنشاء حساب"
  2 إذا اخترت إنشاء حساب، بيطلعلك شريط الخطوات (الـ Stepper الي فيه 1 2 3)
  3 بيعرضلك الفورم المناسب تحت بناءً على انت شو مختار وأي خطوة موصل
*/
export default function RegisterFormPanel({
  step,         // رقم الخطوة الحالية
  setStep,      // دالة لتغيير الخطوة
  isAr,         // هل اللغة عربي عشان نعكس الاتجاهات؟
  isLogin,      // هل احنا بصفحة تسجيل الدخول ولا إنشاء حساب؟
  setIsLogin,   // دالة للتبديل بين تسجيل الدخول والإنشاء
  STEPS,        // مصفوفة الخطوات تبعت التسجيل
  CurrentStep,  // الفورم (المكون) الخاص بالخطوة الحالية اللي لازم ينعرض تحت
  handleNext,   // دالة للتقدم مع حفظ البيانات
  formData,     // البيانات المجمعة حتى الآن
}) {
  const { t } = useTranslation(); // عشان الترجمة
  // بنجهز الخطوات وبنمررلها t عشان تترجم النصوص المطلوبة
  const steps = typeof STEPS === "function" ? STEPS(t) : STEPS;

  return (
    <div className="flex flex-col w-full">

      {/* 
        التابات (الكبستين اللي فوق: إنشاء حساب | تسجيل دخول)
      */}
      <div className="mb-10 w-full flex gap-4 relative border-b-2 border-slate-100 dark:border-slate-800/50 pb-2">
        {/* هاد الخط الأخضر الصغير اللي بيتحرك تحت التاب عشان يبينلك انت بأي صفحة */}
        <div
          className="absolute bottom-[-2px] h-[2px] bg-brand-lime shadow-[0_1px_8px_rgba(130,188,0,0.6)] transition-all duration-500 ease-out pointer-events-none"
          style={{
            width: "calc(50% - 8px)", // نص المساحة ناقص الفراغ
            [isAr ? 'right' : 'left']: isLogin ? 'calc(50% + 8px)' : '0%' // بتحرك يمين ويسار بناءً على اللغة والحالة
          }}
        />
        {/* كبسة إنشاء حساب */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsLogin(false)}
          className={`flex-1 rounded-none !bg-transparent !shadow-none border-none transition-colors duration-300 ${!isLogin
            ? "!text-slate-900 dark:!text-white"
            : "!text-slate-400 hover:!text-slate-600 dark:!text-slate-500 dark:hover:!text-slate-400"
            }`}
        >
          {t("login_page.register_tab")}
        </Button>
        {/* كبسة تسجيل الدخول */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsLogin(true)}
          className={`flex-1 rounded-none !bg-transparent !shadow-none border-none transition-colors duration-300 ${isLogin
            ? "!text-slate-900 dark:!text-white"
            : "!text-slate-400 hover:!text-slate-600 dark:!text-slate-500 dark:hover:!text-slate-400"
            }`}
        >
          {t("login_page.login_tab")}
        </Button>
      </div>
      {/* 
        شريط الخطوات (الـ Stepper)
        ما بيظهر إلا إذا كنا في وضع "إنشاء حساب" (!isLogin)
      */}
      {!isLogin && (
        <div className="mb-10 w-full flex items-center justify-between relative px-2">
          {/* الخط الرمادي الثابت اللي بيكون بالخلفية */}
          <div className="absolute top-4 left-4 right-4 h-[2px] bg-slate-200 dark:bg-slate-800 z-0" />
          {/* الخط الملون المليان اللي بيمشي معك حسب أي خطوة انت موصل */}
          <div
            className="absolute top-4 left-4 h-[2px] bg-gradient-to-r from-blue-600 via-indigo-500 to-lime-400 z-0 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            style={{ width: `calc(${((step - 1) / (steps.length - 1)) * 100}% - 1rem)` }}
          />
          {/* بنلف على الخطوات وحدة وحدة وبنرسم الدوائر (StepPill) تبعتها */}
          {steps.map((item) => (
            <StepPill
              key={item.id}
              item={item}
              currentStep={step}
              isAr={isAr}
            />
          ))}
        </div>
      )}
      {/* 
        هون بنقرر شو نعرض: فورم الدخول ولّا فورم خطوة معينة من خطوات التسجيل
      */}
      <div className="w-full mb-8">
        {isLogin ? (
          /* إذا كان كابس ع تسجيل الدخول بنعرضلو هذا الفورم */
          <LoginForm isAr={isAr} />
        ) : (
          /* إذا كان إنشاء حساب، بنعرض فورم الخطوة الحالية */
          <CurrentStep
            onNext={handleNext}
            onBack={() => {
              // الرجوع للخطوة السابقة مع التأكد من عدم النزول تحت الخطوة رقم 1
              setStep((prev) => Math.max(prev - 1, 1));
            }}
            isAr={isAr}
            t={t}
            formData={formData}
          />
        )}
      </div>
    </div>
  );
}