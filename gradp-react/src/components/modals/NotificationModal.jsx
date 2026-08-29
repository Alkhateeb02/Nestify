/**
 * مكون نافذة الإشعارات (NotificationModal)
 * يعرض قائمة الإشعارات الواردة للمستخدم المسجل دخوله سواءً كان مالكاً أو طالباً.
 * يدعم اللغتين العربية والإنجليزية، الوضع المظلم، وحركات التحول السلسة باستخدام Framer Motion.
 */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Bell, Wrench, Calendar, CreditCard, Sparkles, CheckCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import api from "../../utils/api";

const translateNotification = (title, message, isAr) => {
  if (!isAr) return { title, message };

  const titlesMap = {
    "Maintenance Request Submitted": "تم تقديم طلب الصيانة",
    "New Maintenance Request": "طلب صيانة جديد",
    "Maintenance Ticket Updated": "تم تحديث تذكرة الصيانة",
    "Maintenance Request Accepted": "تم قبول طلب الصيانة",
    "Maintenance Request Completed": "تم إكمال طلب الصيانة",
    "Maintenance Request Rejected": "تم رفض طلب الصيانة",
    "New Booking Request": "طلب حجز جديد",
    "Booking Request Placed": "تم تقديم طلب الحجز",
    "Booking Accepted": "تم قبول الحجز",
    "Booking Rejected": "تم رفض الحجز",
    "Payment Successful": "عملية الدفع ناجحة",
    "Payment Received": "تم استلام الدفعة",
    "Payment Claimed": "تم تأكيد الدفعة",
    "Unit Full Alert": "تنبيه: الوحدة ممتلئة",
    "Match Request Accepted": "تم قبول طلب المطابقة",
    "Match Request Rejected": "تم رفض طلب المطابقة",
    "New Match Request": "طلب مطابقة جديد"
  };

  let cleanTitle = title ? title.trim() : "";
  let arTitle = titlesMap[cleanTitle] || cleanTitle;
  let arMsg = message ? message.trim() : "";

  const statusMap = {
    "processing": "قيد المعالجة",
    "done": "مكتمل",
    "completed": "مكتمل",
    "rejected": "مرفوض",
    "pending": "قيد الانتظار"
  };

  if (/^Your maintenance request for (.+?) has been accepted and is now processing\.$/i.test(arMsg)) {
    const match = arMsg.match(/^Your maintenance request for (.+?) has been accepted and is now processing\.$/i);
    arMsg = `تم قبول طلب الصيانة الخاص بك لـ ${match[1]} وهو الآن قيد المعالجة.`;
  } else if (/^Your maintenance request for (.+?) has been rejected\.$/i.test(arMsg)) {
    const match = arMsg.match(/^Your maintenance request for (.+?) has been rejected\.$/i);
    arMsg = `تم رفض طلب الصيانة الخاص بك لـ ${match[1]}.`;
  } else if (/^Your maintenance request for (.+?) has been marked as completed\.$/i.test(arMsg)) {
    const match = arMsg.match(/^Your maintenance request for (.+?) has been marked as completed\.$/i);
    arMsg = `تم إكمال طلب الصيانة الخاص بك لـ ${match[1]}.`;
  } else if (/^Your maintenance request for (.+?)(?: \((Unit: .+?)\))? has been submitted\.$/i.test(arMsg)) {
    const match = arMsg.match(/^Your maintenance request for (.+?)(?: \((Unit: .+?)\))? has been submitted\.$/i);
    const unitPart = match[2] ? ` (${match[2].replace("Unit:", "الوحدة:")})` : "";
    arMsg = `تم تقديم طلب الصيانة الخاص بك لـ ${match[1]}${unitPart}.`;
  } else if (/^Your maintenance request for (.+?) has been submitted \(Standard\)$/i.test(arMsg)) {
    const match = arMsg.match(/^Your maintenance request for (.+?) has been submitted \(Standard\)$/i);
    arMsg = `تم تقديم طلب الصيانة الخاص بك لـ ${match[1]} (طلب عادي).`;
  } else if (/^New maintenance request submitted for (.+?)(?: \((Unit: .+?)\))?\.$/i.test(arMsg)) {
    const match = arMsg.match(/^New maintenance request submitted for (.+?)(?: \((Unit: .+?)\))?\.$/i);
    const unitPart = match[2] ? ` (${match[2].replace("Unit:", "الوحدة:")})` : "";
    arMsg = `تم تقديم طلب صيانة جديد لـ ${match[1]}${unitPart}.`;
  } else if (/^Your maintenance ticket for (.+?) has been updated to: (.+?)\.$/i.test(arMsg)) {
    const match = arMsg.match(/^Your maintenance ticket for (.+?) has been updated to: (.+?)\.$/i);
    const statusAr = statusMap[match[2].toLowerCase()] || match[2];
    arMsg = `تم تحديث تذكرة الصيانة الخاصة بك لـ ${match[1]} إلى: ${statusAr}.`;
  } else if (/^A student has requested to book your unit at (.+?)\.$/i.test(arMsg)) {
    const match = arMsg.match(/^A student has requested to book your unit at (.+?)\.$/i);
    arMsg = `طلب طالب حجز وحدتك في ${match[1]}.`;
  } else if (arMsg.toLowerCase() === "request done waiting approval") {
    arMsg = "تم تقديم طلبك وبانتظار موافقة المالك.";
  } else if (arMsg.toLowerCase() === "your payment was processed successfully.") {
    arMsg = "تمت معالجة دفعتك بنجاح.";
  } else if (arMsg.toLowerCase() === "payment received for booking request.") {
    arMsg = "تم استلام الدفعة لطلب الحجز.";
  } else if (arMsg.toLowerCase() === "payment is claimed") {
    arMsg = "تم استلام الدفعة وتأكيدها.";
  } else if (/^Your booking request has been approved by the landlord\.$/i.test(arMsg)) {
    arMsg = "تمت الموافقة على طلب الحجز الخاص بك من قبل المالك.";
  } else if (/^Your booking request has been declined by the landlord\.$/i.test(arMsg)) {
    arMsg = "تم رفض طلب الحجز الخاص بك من قبل المالك.";
  } else if (arMsg.toLowerCase() === "telling that the unit is now full") {
    arMsg = "الوحدة ممتلئة تماماً بالكامل الآن.";
  } else if (arMsg.toLowerCase() === "your match request has been accepted") {
    arMsg = "تم قبول طلب المطابقة الخاص بك.";
  } else if (arMsg.toLowerCase() === "your match request has been rejected") {
    arMsg = "تم رفض طلب المطابقة الخاص بك.";
  } else if (arMsg.toLowerCase() === "received a match request") {
    arMsg = "لقد تلقيت طلب مطابقة شريك سكني جديد.";
  }

  return { title: arTitle, message: arMsg };
};

export default function NotificationModal({ isOpen, onClose, onUnreadCountChange }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.is_read).length;
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [notifications, onUnreadCountChange]);

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    try {
      await Promise.all(unread.map(n => api.patch(`/notifications/${n.id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const toggleReadStatus = async (id, currentIsRead) => {
    if (currentIsRead) return;
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // إرجاع أيقونة مخصصة بناءً على نوع الإشعار لتسهيل الفهم البصري للمستخدم
  const getIcon = (type) => {
    switch (type) {
      case "maintenance":
        return <Wrench className="text-amber-500" size={18} />;
      case "booking":
        return <Calendar className="text-blue-500" size={18} />;
      case "payment":
        return <CreditCard className="text-emerald-500" size={18} />;
      case "match":
        return <Sparkles className="text-indigo-500" size={18} />;
      default:
        return <Bell className="text-slate-500" size={18} />;
    }
  };

  // إذا كانت النافذة مغلقة لا يتم رندرة أي شيء
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* خلفية معتمة خفيفة وراقية خلف النافذة (Backdrop) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* كارت النافذة الرئيسي والتأثير الحركي المخصص له عند الظهور والاختفاء */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-[480px] bg-white dark:bg-slate-950 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col border border-slate-100 dark:border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ترويسة نافذة الإشعارات (الهيدر) */}
        <div className="p-6 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[#004A8D] dark:text-lime-500">
              <Bell size={18} />
            </div>
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
              {isAr ? "الإشعارات" : "Notifications"}
            </h2>
          </div>
          {/* زر الإغلاق العلوي */}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* جسم الإشعارات ويحتوي على قائمة العناصر المرتبة */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[50vh] no-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((notif) => {
              const formattedTime = notif.created_at ? new Date(notif.created_at).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
              }) : "";

              const { title, message } = translateNotification(notif.title, notif.message, isAr);

              return (
                <div
                  key={notif.id}
                  onClick={() => toggleReadStatus(notif.id, notif.is_read)}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 flex gap-3 items-start cursor-pointer hover:scale-[1.01] ${
                    !notif.is_read
                      ? "bg-indigo-50/20 dark:bg-lime-500/[0.03] border-indigo-100/50 dark:border-lime-500/10"
                      : "bg-transparent border-slate-100 dark:border-slate-800/40 opacity-70"
                  }`}
                >
                  {/* خلفية دائرية تحتوي على الأيقونة */}
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0">
                    {getIcon(notif.type)}
                  </div>

                  {/* التفاصيل النصية للإشعار والوقت */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                        {title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                        {formattedTime}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {message}
                    </p>
                  </div>

                  {/* النقطة النابضة الخاصة بالإشعارات غير المقروءة */}
                  {!notif.is_read && (
                    <span className="absolute top-4 right-4 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#004A8D] dark:bg-lime-500"></span>
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            // حالة عدم وجود إشعارات جديدة (قائمة فارغة)
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-700">
                <Bell size={24} />
              </div>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
                {isAr ? "لا توجد إشعارات جديدة" : "No new notifications"}
              </p>
            </div>
          )}
        </div>

        {/* تذييل النافذة (الفوتر) ويحتوي على أزرار التحكم */}
        <div className="p-6 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex gap-3">
          {notifications.some(n => !n.is_read) && (
            // زر تحديد المقروء يظهر فقط في حال وجود إشعارات غير مقروءة
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="flex-1 h-11 gap-2 text-xs font-black uppercase tracking-widest hover:!bg-[#004A8D] hover:!text-white dark:hover:!bg-lime-500 dark:hover:!text-slate-950 transition-all border-slate-200 dark:border-slate-800"
            >
              <CheckCheck size={14} />
              {isAr ? "تحديد المقروء" : "Mark read"}
            </Button>
          )}
          {/* زر الإغلاق الأساسي */}
          <Button
            onClick={onClose}
            className="flex-1 h-11 !bg-[#004A8D] dark:!bg-lime-500 !text-white dark:!text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/10 hover:opacity-90 transition-all border-none"
          >
            {isAr ? "إغلاق" : "Close"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
