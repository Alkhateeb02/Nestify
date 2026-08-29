import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Wrench, ArrowLeft, Camera, Send, CheckCircle2, AlertCircle,
  Clock, Info, XCircle, Home, MapPin, Building2, User, Zap, Droplets, Armchair
} from "lucide-react";
import InnerNavbar from "../components/layout/InnerNavbar";
import api from "../utils/api";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function StudentMaintenance() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("electrical");
  const [typeFilter, setTypeFilter] = useState("all");

  const categories = [
    { id: "electrical", label: isAr ? "كهرباء" : "Electrical", icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-100 dark:border-amber-500/20" },
    { id: "plumbing", label: isAr ? "سباكة" : "Plumbing", icon: Droplets, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-500/20" },
    { id: "furniture", label: isAr ? "أثاث" : "Furniture", icon: Armchair, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-100 dark:border-rose-500/20" },
    { id: "other", label: isAr ? "أخرى" : "Other", icon: AlertCircle, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-900/40", border: "border-slate-100 dark:border-slate-800" },
  ];

  // Fetch current user and booking info
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const bookings = JSON.parse(localStorage.getItem("bookingRequests") || "[]");
  const myBooking = bookings.find(b => b.status === "approved") || bookings[bookings.length - 1];

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/maintenance');
        if (response.success && response.data) {
          const mapped = response.data.map(req => {
            const desc = req.issueDescription || req.description || "";
            let cleanDesc = desc;
            let category = "other";

            const catMatch = cleanDesc.match(/^\[([A-Z]+)\]/i);
            if (catMatch) {
              category = catMatch[1].toLowerCase();
              cleanDesc = cleanDesc.replace(/^\[([A-Z]+)\]\s*/i, "");
            }

            const imgMatch = cleanDesc.match(/\[Image\]\s*([^\s]+)/i);
            if (imgMatch) {
              cleanDesc = cleanDesc.replace(/\s*\[Image\]\s*[^\s]+/i, "");
            }

            return {
              id: req.id || req.ticketID,
              description: cleanDesc,
              status: req.status,
              category: category,
              date: new Date(req.date || req.ticket_date || Date.now()).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                year: "numeric", month: "short", day: "numeric"
              })
            };
          });
          setMyRequests(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch maintenance requests:", err);
      }
    };
    fetchRequests();
  }, [user.id, submitted, isAr]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    try {
      const activeUnitId = myBooking?.unit_id || myBooking?.unitId || 1;
      let finalDescription = `[${selectedCategory.toUpperCase()}] ${description}`;
      const res = await api.post('/maintenance', {
        unitId: String(activeUnitId),
        issueDescription: finalDescription
      });

      if (res.success) {
        setSubmitted(true);
        setDescription("");
        setImage(null);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err) {
      console.error("Failed to submit maintenance request", err);
      alert(isAr ? "فشل تقديم طلب الصيانة. يرجى المحاولة مرة أخرى." : "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "processing": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "done": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "rejected": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = (status) => {
    if (isAr) {
      switch (status) {
        case "pending": return "قيد الانتظار";
        case "processing": return "قيد التنفيذ";
        case "done": return "مكتمل";
        case "rejected": return "مرفوض";
        default: return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#f3f4f8] w-screen dark:bg-slate-950 font-sans text-slate-900 dark:text-white pb-20 transition-colors duration-300">
      <InnerNavbar />

      <div className="max-w-5xl mx-auto px-6 pt-28">

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:hover:text-lime-400 transition-colors mb-6 group"
        >
          <ArrowLeft size={18} className={isAr ? "rotate-180" : "group-hover:-translate-x-1 transition-transform"} />
          <span className="font-bold text-sm">{isAr ? "العودة للوحة التحكم" : "Back to Dashboard"}</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Main Form Section */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="lg:col-span-3 space-y-8">
            <motion.div variants={fadeUp} className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight">
                {isAr ? "طلب " : "New "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-lime-500">
                  {isAr ? "صيانة" : "Maintenance"}
                </span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {isAr ? "أخبرنا بالمشكلة وسنقوم بحلها في أقرب وقت ممكن" : "Report an issue and we'll fix it as soon as possible"}
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 border border-slate-200/60 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-3xl" />

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest block px-1">
                    {isAr ? "نوع الصيانة" : "Maintenance Type"}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((cat) => {
                      const CatIcon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${selectedCategory === cat.id
                            ? `${cat.bg} dark:!bg-blue-955/50 ${cat.border} dark:!border-blue-500/30 shadow-lg shadow-blue-500/10`
                            : "bg-white dark:!bg-slate-900 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5"
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedCategory === cat.id ? "bg-white dark:bg-slate-900 shadow-sm" : "bg-slate-100 dark:bg-slate-800"}`}>
                            <CatIcon size={18} className={cat.color} />
                          </div>
                          <span className={`text-sm font-black ${selectedCategory === cat.id ? "!text-slate-900 dark:!text-white" : "!text-slate-500"}`}>
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest block px-1">
                    {isAr ? "وصف المشكلة" : "Issue Description"}
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isAr ? "اشرح بالتفصيل شو المشكلة اللي عندك..." : "Describe the issue in detail..."}
                    className="w-full min-h-[160px] p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-600/20 dark:focus:border-lime-400/20 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all resize-none text-base font-medium"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest block px-1">
                    {isAr ? "إرفاق صورة (اختياري)" : "Attach Photo (Optional)"}
                  </label>
                  <div className="flex flex-col gap-4">
                    {!image ? (
                      <label className="flex flex-col items-center justify-center gap-3 w-full py-10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-lime-400 hover:bg-blue-50/30 dark:hover:bg-lime-900/10 cursor-pointer transition-all group">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Camera className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-lime-400" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          {isAr ? "اضغط لرفع صورة" : "Click to upload an image"}
                        </span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden aspect-video border-4 border-white dark:border-slate-800 shadow-xl">
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 backdrop-blur-sm transition-all"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  disabled={isSubmitting || !description.trim()}
                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-lg shadow-xl transition-all ${isSubmitting
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-[#004A8D] text-white hover:scale-[1.02] active:scale-95 shadow-blue-600/25"
                    }`}
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-3 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={20} />
                      {isAr ? "إرسال الطلب" : "Send Request"}
                    </>
                  )}
                </button>

                {/* Success Message */}
                <AnimatePresence>
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl text-emerald-700 dark:text-emerald-400"
                    >
                      <CheckCircle2 size={24} />
                      <div className="flex-1">
                        <p className="font-black text-sm">{isAr ? "تم إرسال طلبك بنجاح!" : "Request sent successfully!"}</p>
                        <p className="text-xs font-bold opacity-80">{isAr ? "سنقوم بمراجعته وإخطارك بأي تحديثات." : "We'll review it and notify you of any updates."}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </motion.div>

          {/* Side Info & History */}
          <div className="lg:col-span-2 space-y-6">

            {/* Resident Info Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#004A8D] to-blue-800 rounded-[2.5rem] p-6 text-white shadow-xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{isAr ? "معلومات الطالب" : "Student Details"}</p>
                  <p className="font-black text-lg">{user.name}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-bold bg-white/5 p-3 rounded-2xl">
                  <Building2 size={16} className="opacity-60" />
                  <span>{myBooking?.propertyTitle || (isAr ? "غير محدد" : "N/A")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold bg-white/5 p-3 rounded-2xl">
                  <MapPin size={16} className="opacity-60" />
                  <span>{myBooking?.location || (isAr ? "عمان، الأردن" : "Amman, Jordan")}</span>
                </div>
              </div>
            </motion.div>

            {/* History List */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">
                {isAr ? "طلباتك السابقة" : "Your Requests"}
              </h3>

              {myRequests.length > 0 && (
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{isAr ? "كل الأنواع" : "All Types"}</option>
                  <option value="electrical">{isAr ? "كهرباء" : "Electrical"}</option>
                  <option value="plumbing">{isAr ? "سباكة" : "Plumbing"}</option>
                  <option value="furniture">{isAr ? "أثاث" : "Furniture"}</option>
                  <option value="other">{isAr ? "أخرى" : "Other"}</option>
                </select>
              )}

              {myRequests.filter(req => typeFilter === "all" || req.category === typeFilter).length === 0 ? (
                <div className="p-10 bg-white/50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-sm font-bold text-slate-400">{isAr ? "لا يوجد طلبات" : "No requests found"}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRequests
                    .filter(req => typeFilter === "all" || req.category === typeFilter)
                    .map((req) => {
                      const categoryObj = categories.find(c => c.id === req.category) || categories[3];
                      const CatIcon = categoryObj.icon;
                      return (
                        <div key={req.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${getStatusStyle(req.status)}`}>
                                {getStatusLabel(req.status)}
                              </span>
                              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1`}>
                                <CatIcon size={8} className={categoryObj.color} />
                                {categoryObj.label}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400">{req.date}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-2">{req.description}</p>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Support Box */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-600 dark:text-lime-400">
                  <Info size={20} />
                </div>
                <h4 className="font-black text-sm">{isAr ? "تحتاج مساعدة فورية؟" : "Need urgent help?"}</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {isAr
                  ? "للحالات الطارئة مثل تسرب المياه الشديد أو مشاكل الكهرباء، يرجى الاتصال بالمالك مباشرة على الرقم الموجود في لوحة التحكم."
                  : "For emergencies like severe leaks or electrical hazards, please call the owner directly via the number in your dashboard."}
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
