import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImageIcon, Send, Zap, Droplets, Armchair, AlertTriangle, Sparkles, CheckCircle2, ClipboardList, Clock, Info, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../../../utils/api";

export default function MaintenanceView({ isAr, setActiveView, viewportVariants, booking }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("submit"); // "submit" or "history"
  const [selectedCategory, setSelectedCategory] = useState("electrical");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attachedImage, setAttachedImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Tickets History State
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");

  const bookings = JSON.parse(localStorage.getItem("bookingRequests") || "[]");
  const myBooking = bookings.find(b => b.status === "approved") || bookings[bookings.length - 1];

  const categories = [
    { id: "electrical", label: t("student_maintenance.categories.electrical"), icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-100 dark:border-amber-500/20" },
    { id: "plumbing", label: t("student_maintenance.categories.plumbing"), icon: Droplets, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-500/20" },
    { id: "furniture", label: t("student_maintenance.categories.furniture"), icon: Armchair, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-100 dark:border-rose-500/20" },
    { id: "other", label: t("student_maintenance.categories.other"), icon: AlertTriangle, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-900/40", border: "border-slate-100 dark:border-slate-800" },
  ];

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await api.get('/maintenance');
      if (res.success && res.data) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchTickets();
    }
  }, [activeTab]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadFormData = new FormData();
    uploadFormData.append("maintenance_image", file);
    try {
      const uploadRes = await api.post("/upload/maintenance-image", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (uploadRes.success && uploadRes.filePath) {
        setAttachedImage(`/${uploadRes.filePath}`);
      }
    } catch (err) {
      console.error("Maintenance image upload failed:", err);
      alert(isAr ? "فشل رفع الصورة." : "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setIsSubmitting(true);

    try {
      const activeUnitId = booking?.unit_id || booking?.unitId || booking?.unit?.unit_id || myBooking?.unit_id || myBooking?.unitId || 1;
      let finalDescription = `[${selectedCategory.toUpperCase()}] ${description}`;
      if (attachedImage) {
        finalDescription += `\n[Image] ${attachedImage}`;
      }

      const res = await api.post('/maintenance', {
        unitId: String(activeUnitId),
        issueDescription: finalDescription
      });

      if (res.success) {
        setSubmitted(true);
        setDescription("");
        setAttachedImage("");
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err) {
      console.error("Failed to submit request:", err);
      alert(isAr ? "فشل تقديم طلب الصيانة. يرجى المحاولة مرة أخرى." : "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to parse stored description formatting
  const parseTicketDescription = (desc = "") => {
    let category = "other";
    let image = null;
    let cleanDesc = desc;

    const catMatch = cleanDesc.match(/^\[([A-Z]+)\]/i);
    if (catMatch) {
      category = catMatch[1].toLowerCase();
      cleanDesc = cleanDesc.replace(/^\[([A-Z]+)\]\s*/i, "");
    }

    const imgMatch = cleanDesc.match(/\[Image\]\s*([^\s]+)/i);
    if (imgMatch) {
      image = imgMatch[1];
      cleanDesc = cleanDesc.replace(/\s*\[Image\]\s*[^\s]+/i, "");
    }

    return { category, image, description: cleanDesc };
  };

  const getStatusBadge = (status) => {
    const mapping = {
      pending: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        text: "text-amber-600 dark:text-amber-400",
        icon: Clock,
        label: isAr ? "قيد الانتظار" : "Pending"
      },
      processing: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-600 dark:text-blue-400",
        icon: Info,
        label: isAr ? "جاري العمل" : "Processing"
      },
      done: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        text: "text-emerald-600 dark:text-emerald-400",
        icon: CheckCircle2,
        label: isAr ? "مكتمل" : "Completed"
      },
      completed: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        text: "text-emerald-600 dark:text-emerald-400",
        icon: CheckCircle2,
        label: isAr ? "مكتمل" : "Completed"
      },
      rejected: {
        bg: "bg-rose-50 dark:bg-rose-900/20",
        text: "text-rose-600 dark:text-rose-400",
        icon: XCircle,
        label: isAr ? "مرفوض" : "Rejected"
      }
    };

    const config = mapping[status] || mapping.pending;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${config.bg} ${config.text}`}>
        <Icon size={12} />
        <span>{config.label}</span>
      </div>
    );
  };

  return (
    <motion.div variants={viewportVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
      {/* رأس الصفحة مع تبديل التبويبات */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Sparkles size={20} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t("student_maintenance.title")}</h2>
        </div>

        {/* أزرار التبويبات */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/20">
          <button
            onClick={() => setActiveTab("submit")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === "submit"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {isAr ? "تقديم طلب" : "Submit Request"}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === "history"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {isAr ? "طلباتي السابقة" : "My Requests"}
          </button>
        </div>
      </div>

      {activeTab === "submit" ? (
        <div className="space-y-6">
          {/* قسم اختيار نوع المشكلة */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t("student_maintenance.select_category")}</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${selectedCategory === cat.id
                    ? `${cat.bg} dark:!bg-blue-955/50 ${cat.border} dark:!border-blue-500/30 shadow-lg shadow-blue-500/10`
                    : "bg-white dark:!bg-slate-900 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedCategory === cat.id ? "bg-white dark:bg-slate-900 shadow-sm" : "bg-slate-100 dark:bg-slate-800"}`}>
                    <cat.icon size={18} className={cat.color} />
                  </div>
                  <span className={`text-md font-black ${selectedCategory === cat.id ? "!text-slate-900 dark:!text-white" : "!text-slate-500"}`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* حقل وصف المشكلة */}
          <div className="space-y-3 text-start">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t("student_maintenance.details_label")}</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-5 rounded-3xl outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500/30 transition-all font-medium text-slate-900 dark:text-white resize-none text-sm"
              placeholder={t("student_maintenance.details_placeholder")}
            ></textarea>
          </div>

          {/* عرض الصورة المرفقة إن وجدت */}
          {attachedImage && (
            <div className="flex justify-start">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group shadow-md">
                <img src={attachedImage} alt="Attachment" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setAttachedImage("")}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="flex-1 py-4 rounded-2xl !bg-slate-100 dark:!bg-slate-800 text-slate-600 dark:text-slate-300 font-black flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group text-xs disabled:opacity-50"
            >
              <ImageIcon size={16} className="text-blue-500" />
              {uploadingImage ? (isAr ? "جاري الرفع..." : "Uploading...") : t("student_maintenance.attach_photos")}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              disabled={isSubmitting || !description.trim()}
              onClick={handleSubmit}
              className="flex-[1.5] py-4 rounded-2xl !bg-blue-600 !text-white font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all text-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  {t("student_maintenance.submit")}
                </>
              )}
            </button>
          </div>

          {/* رسالة نجاح الإرسال */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl text-emerald-700 dark:text-emerald-400"
              >
                <CheckCircle2 size={24} />
                <div className="flex-1 text-start">
                  <p className="font-black text-sm">{isAr ? "تم إرسال طلبك بنجاح!" : "Request sent successfully!"}</p>
                  <p className="text-xs font-bold opacity-80">{isAr ? "تم حفظ المشكلة وسيتواصل معك الفني قريباً." : "Your issue has been saved, a technician will contact you soon."}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-4">
          {loadingTickets ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-bold">{isAr ? "جاري تحميل الطلبات..." : "Loading requests..."}</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-105 dark:border-slate-800">
              <ClipboardList size={40} className="text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
              <p className="text-slate-500 font-bold text-sm">{isAr ? "لا توجد طلبات صيانة سابقة." : "No previous maintenance tickets."}</p>
            </div>
          ) : (
            <>
              {/* Type Filter Bar */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 overflow-x-auto no-scrollbar">
                {["all", "electrical", "plumbing", "furniture", "other"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTypeFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${typeFilter === cat
                      ? "!bg-blue-600 !text-white shadow-lg shadow-blue-600/20 dark:!bg-lime-500 dark:!text-slate-950 dark:shadow-lime-500/20"
                      : "!text-slate-700 dark:!bg-slate-800 hover:!bg-slate-50 dark:!text-slate-400 dark:hover:!bg-slate-800"
                      }`}
                  >
                    {cat === "all" ? (isAr ? "جميع الأنواع" : "All Types") : t(`student_maintenance.categories.${cat}`)}
                  </button>
                ))}
              </div>

              {tickets.filter(t => {
                if (typeFilter === "all") return true;
                const parsed = parseTicketDescription(t.issueDescription || t.description);
                return parsed.category === typeFilter;
              }).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-105 dark:border-slate-800 w-full col-span-full">
                  <ClipboardList size={40} className="text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
                  <p className="text-slate-500 font-bold text-sm">
                    {isAr ? "لا توجد طلبات صيانة لهذا النوع." : "No maintenance tickets for this category."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tickets
                    .filter(t => {
                      if (typeFilter === "all") return true;
                      const parsed = parseTicketDescription(t.issueDescription || t.description);
                      return parsed.category === typeFilter;
                    })
                    .map((t) => {
                      const parsed = parseTicketDescription(t.issueDescription || t.description);
                      const categoryObj = categories.find(c => c.id === parsed.category) || categories[3];
                      const CatIcon = categoryObj.icon;

                      return (
                        <motion.div
                          key={t.id || t.ticketID}
                          whileHover={{ y: -2 }}
                          className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-md flex flex-col gap-4 text-start justify-between"
                        >
                          <div>
                            {/* Header */}
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg ${categoryObj.bg} flex items-center justify-center`}>
                                  <CatIcon size={14} className={categoryObj.color} />
                                </div>
                                <span className="text-xs font-black text-slate-855 dark:text-white capitalize">{categoryObj.label}</span>
                              </div>
                              {getStatusBadge(t.status)}
                            </div>

                            {/* Description */}
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed mt-2 line-clamp-3">
                              {parsed.description}
                            </p>
                          </div>

                          {/* Image Attachment & Date */}
                          <div className="flex items-center justify-between gap-4 mt-1 border-t border-slate-50 dark:border-slate-800/50 pt-3">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                              {new Date(t.date || t.ticket_date || Date.now()).toLocaleDateString(isAr ? "ar-EG" : "en-US")}
                            </span>

                            {parsed.image && (
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
                                <img src={parsed.image} alt="Attachment" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
