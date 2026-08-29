/**
 * صفحة تسجيل الدخول والإنشاء الخاصة بالطلاب (LoginPage)
 * تدير الخطوات المتعددة لعملية التسجيل (الملف الشخصي، عادات المعيشة، وتفضيلات شريك السكن).
 * تحتوي على حركات وتمرير تلقائي ذكي لسهولة التصفح على الهواتف والأجهزة المحمولة.
 */
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import InnerNavbar from "../components/layout/InnerNavbar";
import { STEPS } from "../constants/registerSteps";
import { getStepComponent, TOTAL_STEPS } from "../constants/stepsConfig";
import { getAuthContent } from "../constants/loginContent";
import RegisterFormPanel from "../components/auth/RegisterFormPanel";
import AuthShowcase from "../components/auth/AuthShowcase";
import BackgroundBlobs from "../components/ui/BackgroundBlobs";

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const location = useLocation();
  const navigate = useNavigate();

  // إدارة الخطوة الحالية من خطوات إنشاء الحساب (من 1 إلى 3)
  const [step, setStep] = useState(1);
  // حالة مراقبة تحميل الصفحة لتفعيل الأنيميشن والتأثيرات البصرية
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // تفعيل الحركات التفاعلية بعد تحميل المكون
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // تحديد ما إذا كان يعرض تسجيل الدخول أو إنشاء حساب بناءً على معلمات الرابط URL
  const [isLogin, setIsLogin] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("registered") === "true";
  });

  // تخزين بيانات التسجيل المجمعة من الخطوات المختلفة
  const [formData, setFormData] = useState({});

  // تهيئة مستمع لتسجيل الدخول بواسطة Google لاستكمال تعبئة البيانات تلقائياً
  useEffect(() => {
    window.onGoogleSignUpPrefill = (googleData) => {
      setFormData((prev) => ({
        ...prev,
        name: googleData.name,
        email: googleData.email,
        profile_image: googleData.profile_image,
        isGoogle: true,
        googleToken: googleData.googleToken
      }));
      setIsLogin(false);
      setStep(2); // القفز مباشرة للخطوة الثانية لتحديد تفضيلات نمط الحياة
    };

    return () => {
      delete window.onGoogleSignUpPrefill;
    };
  }, []);

  // مراجع لحفظ الخطوة السابقة وقسم الفورم للتمكن من التمرير
  const prevStepRef = useRef(step);
  const formSectionRef = useRef(null);

  // حساب المكون الخاص بالخطوة الحالية وعمل 캐ش له (Memoization) لتحسين الأداء
  const CurrentStep = useMemo(
    () => getStepComponent(step) || getStepComponent(1),
    [step]
  );

  // جلب المحتوى الديناميكي للجانب الأيسر بناءً على الخطوة الحالية
  const currentContent = useMemo(
    () => getAuthContent(t, step, isLogin),
    [t, step, isLogin]
  );

  // حساب النسبة المئوية لشريط تقدم الخطوات
  const progressPercentage = useMemo(() => {
    return isLogin ? 0 : (step / TOTAL_STEPS) * 100;
  }, [step, isLogin]);

  // التحقق من صحة رقم الخطوة وبقائها ضمن النطاق الصحيح
  useEffect(() => {
    if (step < 1) setStep(1);
    else if (step > TOTAL_STEPS) setStep(TOTAL_STEPS);
  }, [step]);

  // معالجة الانتقال للخطوة التالية وتخزين بيانات الخطوة الحالية
  const handleNext = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  // منطق التمرير التلقائي الذكي (Auto Scroll): 
  // - عند الانتقال للأمام: يتم التمرير للأسفل باتجاه الفورم مع ترك مسافة لارتفاع الهيدر الثابت.
  // - عند الرجوع للخلف أو تبديل التاب: يتم التمرير لأعلى الصفحة.
  useEffect(() => {
    const isForward = step > prevStepRef.current;
    const isBackward = step < prevStepRef.current;

    const scrollTimer = setTimeout(() => {
      if (isForward && formSectionRef.current) {
        // تمرير لأسفل باتجاه النموذج مع خصم ارتفاع الهيدر الثابت (Navbar) حتى لا يغطي الجزء العلوي من الفورم
        const navbarHeight = 95;
        const elementTop = formSectionRef.current.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementTop - navbarHeight,
          behavior: "smooth"
        });
      } else if (isBackward || isLogin) {
        // تمرير لأعلى باتجاه بداية الصفحة
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
      prevStepRef.current = step;
    }, 150); // تأخير بسيط يتيح للمكون الجديد التحميل وتحديد ارتفاعه الفعلي بالـ DOM

    return () => clearTimeout(scrollTimer);
  }, [step, isLogin]);

  return (
    <div className="min-h-screen w-screen flex flex-col font-sans bg-white dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden">
      <BackgroundBlobs />
      <InnerNavbar hideLinks={true} />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 pt-20 px-4 sm:px-8 lg:px-12 relative">
        {/* زر رجوع خفيف للرئيسية وتصفح السكنات */}
        <div className={`absolute top-20 lg:top-24 start-[50px] z-30 transition-opacity duration-1000 ${isMounted ? "opacity-100" : "opacity-0"}`}>
          <button
            onClick={() => navigate("/student")}
            className="flex items-center gap-2 text-slate-400 hover:text-[#004A8D] dark:hover:text-lime-500 transition-colors text-sm font-medium"
          >
            {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span>{isAr ? "تصفح السكنات" : "Browse Properties"}</span>
          </button>
        </div>

        {/* الجزء الأيسر: عرض الشرائح البصرية التعريفية والترحيبية (Showcase) */}
        <div className={`lg:-mt-1 lg:-translate-y-1 transition-all duration-1000 ease-out transform ${isMounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
          <AuthShowcase
            content={currentContent}
            step={step}
            isLogin={isLogin}
          />
        </div>

        {/* الجزء الأيمن: كارت الفورم الرئيسي الذي يحتوي على عناصر الإدخال وتأثيرات التحميل */}
        <div className={`
          m-4 sm:m-8 lg:m-12 flex flex-col justify-center
          rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700/50 
          bg-white/80 dark:bg-[#0e1320]/80 backdrop-blur-2xl 
          shadow-[0_40px_60px_-15px_rgba(132,204,22,0.9)] dark:shadow-[0_50px_60px_-15px_rgba(132,204,22,0.3)] 
          transition-all duration-1000 ease-out hover:shadow-[0_30px_70px_-15px_rgba(132,204,22,0.7)] dark:hover:shadow-[0_30px_70px_-15px_rgba(132,204,22,0.4)]
          transform ${isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}
        `}>
          <div ref={formSectionRef} className="flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 h-full">
            <div className="w-full max-w-md">
              {/* لوحة تبديل الخطوات والفورم الفعلي */}
              <RegisterFormPanel
                step={step}
                setStep={setStep}
                handleNext={handleNext}
                formData={formData}
                isAr={isAr}
                isLogin={isLogin}
                setIsLogin={setIsLogin}
                STEPS={STEPS}
                CurrentStep={CurrentStep}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
