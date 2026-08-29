import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench } from "lucide-react";
import MaintenanceRequestCard from "./MaintenanceRequestCard";
import api from "../../utils/api";

export default function MaintenanceRequests({ isAr, t, fadeUp, stagger }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/maintenance/landlord');
        if (response.success && response.data) {
          const mapped = response.data.map(req => {
            const desc = req.issueDescription || req.description || "";
            let image = null;
            let cleanDesc = desc;

            const imgMatch = cleanDesc.match(/\[Image\]\s*([^\s]+)/i);
            if (imgMatch) {
              image = imgMatch[1];
              cleanDesc = cleanDesc.replace(/\s*\[Image\]\s*[^\s]+/i, "");
            }

            let category = "other";
            const catMatch = cleanDesc.match(/^\[([A-Z]+)\]/i);
            if (catMatch) {
              category = catMatch[1].toLowerCase();
            }

            cleanDesc = cleanDesc.replace(/^\[([A-Z]+)\]\s*/i, "");

            return {
              id: req.id || req.ticketID,
              studentName: req.studentName || (isAr ? "طالب" : "Tenant"),
              propertyTitle: req.propertyTitle || (isAr ? "عقاري" : "Property"),
              description: cleanDesc,
              image: image,
              status: req.status,
              category: category,
              date: new Date(req.date || req.ticket_date || Date.now()).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                year: "numeric", month: "short", day: "numeric"
              })
            };
          });
          setRequests(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch landlord requests:", err);
      }
    };
    fetchRequests();
  }, [isAr]);

  // دالة عشان نغير حالة الطلب (نوافق، نرفض، نخلصه)
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await api.put(`/maintenance/${id}/status`, { status: newStatus });
      if (response.success) {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(isAr ? "فشل تحديث حالة الطلب." : "Failed to update ticket status.");
    }
  };

  // عشان نصفي الطلبات حسب الأزرار
  const filteredRequests = requests.filter(req => {
    const matchesStatus = filter === "all" || req.status === filter;
    const matchesType = typeFilter === "all" || req.category === typeFilter;
    return matchesStatus && matchesType;
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* ── ترويسة الصفحة مع الفلاتر ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="!text-blue-600 dark:!text-lime-400" />
            {t("owner_maintenance.title")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("owner_maintenance.desc")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* ── أزرار التصفية حسب الحالة ── */}
          <div className="flex items-center gap-2 bg-white dark:!bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
            {["all", "pending", "processing", "done", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filter === f
                  ? "!bg-blue-600 !text-white shadow-lg shadow-blue-600/20 dark:!bg-lime-500 dark:!text-slate-950 dark:shadow-lime-500/20"
                  : "!text-slate-700 dark:!bg-slate-800 hover:!bg-slate-50 dark:!text-slate-400 dark:hover:!bg-slate-850"
                  }`}
              >
                {f === "all" ? t("owner_maintenance.filter_all") : t(`owner_maintenance.status_${f}`)}
              </button>
            ))}
          </div>

          {/* ── أزرار التصفية حسب نوع الصيانة ── */}
          <div className="flex items-center gap-2 bg-white dark:!bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
            {["all", "electrical", "plumbing", "furniture", "other"].map((cat) => (
              <button
                key={cat}
                onClick={() => setTypeFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${typeFilter === cat
                  ? "!bg-blue-600 !text-white shadow-lg shadow-blue-600/20 dark:!bg-lime-500 dark:!text-slate-950 dark:shadow-lime-500/20"
                  : "!text-slate-700 dark:!bg-slate-800 hover:!bg-slate-50 dark:!text-slate-400 dark:hover:!bg-slate-850"
                  }`}
              >
                {cat === "all" ? (isAr ? "كل الأنواع" : "All Types") : t(`student_maintenance.categories.${cat}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── شبكة عرض طلبات الصيانة ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <MaintenanceRequestCard 
                key={req.id} 
                req={req} 
                updateStatus={updateStatus} 
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
            >
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-700">
                <Wrench size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {t("owner_maintenance.no_requests")}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {t("owner_maintenance.no_requests_desc")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
