
import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, GraduationCap, CalendarDays, Users, Save, CheckCircle, Camera, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../../../../utils/api";

export default function ProfileSection({ isAr }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "",
    year: "",
    semester: "",
    major: "",
    profileImage: "" // حقل جديد لصورة البروفايل
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const parsed = JSON.parse(userStr);
      setFormData({
        name: parsed.name || parsed.fullName || "",
        phone: parsed.phone || parsed.phone_number || "",
        email: parsed.email || "",
        gender: parsed.gender || "",
        year: parsed.year || "",
        semester: parsed.semester || "",
        major: parsed.major || "",
        profileImage: parsed.profileImage || parsed.profile_image || ""
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // معالجة اختيار الصورة وتعيينها للمعاينة والرفع لاحقاً
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // تنبيه إذا الصورة أكبر من 2 ميجا
        alert(isAr ? "الصورة كبيرة جداً، يرجى اختيار صورة أقل من 2 ميجابايت" : "Image too large, please pick one under 2MB");
        return;
      }

      setSelectedFile(file);
      setFormData(prev => ({ ...prev, profileImage: URL.createObjectURL(file) }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let profileImageUrl = formData.profileImage;

      // 1. إذا اختار صورة جديدة، ارفعها للخادم أولاً
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("profile_image", selectedFile);

        const uploadRes = await api.post("/upload/profile-image", uploadFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (uploadRes.success && uploadRes.filePath) {
          // حفظ المسار المستلم من السيرفر مسبوقاً بـ / ليتم جلبه بشكل صحيح عبر البروكسي
          profileImageUrl = `/${uploadRes.filePath}`;
        }
      }

      // 2. تحديث معلومات الحساب بما فيها صورة البروفايل على السيرفر
      const updatePayload = {
        fullName: formData.name,
        phoneNumber: formData.phone,
        profile_image: profileImageUrl,
        major: formData.major,
        gender: formData.gender,
        year: formData.year,
        semester: formData.semester
      };

      await api.put("/users/profile", updatePayload);

      // 3. تحديث التخزين المحلي وتنبيه باقي أجزاء الموقع
      const updatedUser = {
        ...formData,
        fullName: formData.name,
        phone_number: formData.phone,
        profileImage: profileImageUrl,
        profile_image: profileImageUrl,
        semester: formData.semester
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdate"));

      setSelectedFile(null); // إعادة تعيين حالة الملف
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save profile error:", err);
      alert(isAr ? "حدث خطأ أثناء حفظ التغييرات" : "An error occurred while saving profile");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = `w-full ${isAr ? "pr-12 text-right" : "pl-12"} py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-blue-500 dark:focus:border-lime-500 transition-all text-slate-900 dark:text-white font-medium`;
  const iconStyle = `absolute ${isAr ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-slate-400`;

  return (
    /* الكونتينر الأساسي لقسم المعلومات الشخصية */
    <div className="space-y-10">

      {/* سيكشن تحميل صورة البروفايل */}
      <div className="flex flex-col items-center justify-center space-y-4 pb-4">
        <div className="relative group">
          {/* دائرة الصورة مع حركات عند التحويم */}
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 transition-transform group-hover:scale-105 duration-300">
            {formData.profileImage ? (
              <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center !text-slate-900">
                <User size={60} />
              </div>
            )}
          </div>

          {/* زر الكاميرا اللي بطلع فوق الصورة */}
          <button
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-0 right-0 p-2.5 !bg-blue-600 dark:!bg-lime-500 text-white dark:text-slate-900 rounded-full shadow-lg hover:scale-110 transition-all"
          >
            <Camera size={18} />
          </button>

          {/* زر الحذف إذا في صورة موجودة */}
          {formData.profileImage && (
            <button
              onClick={() => setFormData(prev => ({ ...prev, profileImage: "" }))}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* حقل اختيار الملف (مخفي) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />

        <div className="text-center">
          <h3 className="font-bold text-slate-800 dark:text-white">{isAr ? "صورة البروفايل" : "Profile Picture"}</h3>
          <p className="text-xs text-slate-500">{isAr ? "اجعل حسابك مميزاً بصورة شخصية" : "Make your profile stand out"}</p>
        </div>
      </div>

      {/* شبكة الحقول (Grid) عشان نعرض كل المدخلات جنب بعض */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* البوكس الخاص بتعديل اسم الطالب */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 px-1">{t("login_page.full_name")}</label>
          <div className="relative">
            <User size={18} className={iconStyle} />
            <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputStyle} />
          </div>
        </div>

        {/* البوكس الخاص بتعديل البريد الإلكتروني */}
        <div className="space-y-2">
          <label className="text-sm font-bold !text-slate-500 px-1">{t("login_page.email")}</label>
          <div className="relative">
            <Mail size={18} className={iconStyle} />
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyle} />
          </div>
        </div>

        {/* البوكس الخاص بتعديل رقم الموبايل */}
        <div className="space-y-2">
          <label className="text-sm font-bold !text-slate-500 px-1">{t("login_page.phone")}</label>
          <div className="relative">
            <Phone size={18} className={iconStyle} />
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputStyle} />
          </div>
        </div>

        {/* البوكس الخاص باختيار الجنس (ذكر/أنثى) */}
        <div className="space-y-2">
          <label className="text-sm font-bold !text-slate-500 px-1">{t("login_page.user_gender")}</label>
          <div className="relative">
            <Users size={18} className={iconStyle} />
            <select name="gender" value={formData.gender} onChange={handleChange} className={`${inputStyle} appearance-none cursor-pointer`}>
              <option value="male">{t("login_page.gender.male")}</option>
              <option value="female">{t("login_page.gender.female")}</option>
            </select>
          </div>
        </div>

        {/* البوكس الخاص باختيار السنة الدراسية */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 px-1">{t("login_page.select_year")}</label>
          <div className="relative">
            <GraduationCap size={18} className={iconStyle} />
            <select name="year" value={formData.year} onChange={handleChange} className={`${inputStyle} appearance-none cursor-pointer`}>
              <option value="0">{t("login_page.years.0")}</option>
              <option value="1">{t("login_page.years.1")}</option>
              <option value="2">{t("login_page.years.2")}</option>
              <option value="3">{t("login_page.years.3")}</option>
            </select>
          </div>
        </div>

        {/* البوكس الخاص باختيار الفصل الدراسي */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 px-1">{t("login_page.select_semester")}</label>
          <div className="relative">
            <CalendarDays size={18} className={iconStyle} />
            <select name="semester" value={formData.semester} onChange={handleChange} className={`${inputStyle} appearance-none cursor-pointer`}>
              <option value="0">{t("login_page.semesters.0")}</option>
              <option value="1">{t("login_page.semesters.1")}</option>
              <option value="2">{t("login_page.semesters.2")}</option>
            </select>
          </div>
        </div>

        {/* البوكس الخاص بتعديل التخصص الأكاديمي */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-500 px-1">{t("login_page.major")}</label>
          <div className="relative">
            <GraduationCap size={18} className={iconStyle} />
            <input type="text" name="major" value={formData.major || ""} onChange={handleChange} className={inputStyle} />
          </div>
        </div>

      </div>

      {/* القسم اللي فيه زر الحفظ في أسفل الشاشة */}
      <div className="flex justify-end pt-4">
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
            /* شكل التحميل لما نكبس حفظ */
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            /* علامة الصح اللي بتطلع بس يخلص الحفظ */
            <CheckCircle size={20} />
          ) : (
            /* أيقونة الحفظ (الديسك) */
            <Save size={20} />
          )}
          <span>{saved ? t("student_settings.actions.saved") : t("student_settings.actions.save")}</span>
        </button>
      </div>
    </div>
  );
}
