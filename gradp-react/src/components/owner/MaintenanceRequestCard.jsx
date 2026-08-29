import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, CheckCircle2, XCircle, Info, User, Building2,
  MessageSquare, Image as ImageIcon, Zap, Droplets, Armchair, AlertTriangle, X
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function MaintenanceRequestCard({ req, updateStatus }) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // عشان نجيب الألوان وشكل الحالة (معلق، قيد التنفيذ، الخ..)
  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "!bg-amber-50 text-amber-700 border-amber-200 dark:!bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
      case "processing":
        return "!bg-blue-50 text-blue-700 border-blue-200 dark:!bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      case "done":
        return "!bg-emerald-50 text-emerald-700 border-emerald-200 dark:!bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
      case "rejected":
        return "!bg-rose-50 text-rose-700 border-rose-200 dark:!bg-rose-900/20 dark:text-rose-400 dark:border-rose-800";
      default:
        return "!bg-slate-50 text-slate-700 border-slate-200 dark:!bg-slate-900/20 dark:text-slate-400 dark:border-slate-800";
    }
  };

  // عشان نطلع الأيقونة المناسبة للحالة
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock size={16} />;
      case "processing": return <Info size={16} />;
      case "done": return <CheckCircle2 size={16} />;
      case "rejected": return <XCircle size={16} />;
      default: return null;
    }
  };

  // مشان نترجم اسم الحالة من الملفات
  const getStatusLabel = (status) => {
    switch (status) {
      case "pending": return t("owner_maintenance.status_pending");
      case "processing": return t("owner_maintenance.status_processing");
      case "done": return t("owner_maintenance.status_done");
      case "rejected": return t("owner_maintenance.status_rejected");
      default: return status;
    }
  };

  // للتحكم بشكل أيقونات ولون فئة الصيانة
  const getCategoryConfig = (category) => {
    switch (category) {
      case "electrical":
        return {
          icon: <Zap size={12} />,
          style: "!bg-amber-50 text-amber-700 border-amber-200 dark:!bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30"
        };
      case "plumbing":
        return {
          icon: <Droplets size={12} />,
          style: "!bg-blue-50 text-blue-700 border-blue-200 dark:!bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30"
        };
      case "furniture":
        return {
          icon: <Armchair size={12} />,
          style: "!bg-rose-50 text-rose-700 border-rose-200 dark:!bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30"
        };
      default:
        return {
          icon: <AlertTriangle size={12} />,
          style: "!bg-slate-50 text-slate-700 border-slate-200 dark:!bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/30"
        };
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:!bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-black/20 transition-all duration-300 group"
    >
      <div className="flex flex-col h-full">
        {/* حالة الطلب وتاريخه */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(req.status)}`}>
              {getStatusIcon(req.status)}
              {getStatusLabel(req.status)}
            </div>

            {req.category && (() => {
              const catConfig = getCategoryConfig(req.category);
              return (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${catConfig.style}`}>
                  {catConfig.icon}
                  {t(`student_maintenance.categories.${req.category}`)}
                </div>
              );
            })()}
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {req.date}
          </span>
        </div>

        {/* معلومات الطالب واسم السكن */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:!bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/30">
            <User className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-slate-900 dark:text-white truncate">{req.studentName}</h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <Building2 size={12} />
                <span className="truncate">{req.propertyTitle}</span>
              </div>
            </div>
          </div>
        </div>

        {/* وصف المشكلة والصورة المرفقة */}
        <div className="flex-1 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <MessageSquare size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t("owner_maintenance.description")}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {req.description}
            </p>
          </div>

          {req.image && (
            <div className="relative group/img overflow-hidden rounded-2xl aspect-video bg-slate-100 dark:bg-slate-800">
              <img
                src={req.image}
                alt="Maintenance"
                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center p-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                >
                  <ImageIcon size={14} />
                  {t("owner_maintenance.view_image")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* أزرار الموافقة، الرفض، والانتهاء من الطلب */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
          {req.status === "pending" && (
            <>
              <button
                onClick={() => updateStatus(req.id, "rejected")}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-all border border-transparent"
              >
                <XCircle size={16} />
                {t("owner_maintenance.action_reject")}
              </button>
              <button
                onClick={() => updateStatus(req.id, "processing")}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <CheckCircle2 size={16} />
                {t("owner_maintenance.action_accept")}
              </button>
            </>
          )}

          {req.status === "processing" && (
            <>
              <div className="col-span-1" /> {/* Spacer */}
              <button
                onClick={() => updateStatus(req.id, "done")}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <CheckCircle2 size={16} />
                {t("owner_maintenance.action_done")}
              </button>
            </>
          )}

          {(req.status === "done" || req.status === "rejected") && (
            <div className="col-span-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-2">
              {t("owner_maintenance.closed")}
            </div>
          )}
        </div>
      </div>

      {/* Full Image Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center"
            >
              <div
                role="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black hover:bg-slate-950 text-red-500 flex items-center justify-center transition-all border border-white/10 cursor-pointer"
              >
                <X size={20} />
              </div>
              <img
                src={req.image}
                alt="Maintenance Full"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
