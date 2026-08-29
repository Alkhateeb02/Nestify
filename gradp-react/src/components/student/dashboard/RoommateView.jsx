import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Sparkles, UserPlus2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { STATUS } from "../../../data/roommates";
import RoommateCard from "./roommate/RoommateCard";
import SuggestionCard from "./roommate/SuggestionCard";
import MatchedProfileView from "./roommate/MatchedProfileView";
import { Button } from "../../ui/Button";
import api from "../../../utils/api";

/* زر التبويب  الي فوق عشان يحول بين الصفحات */
function Tab({ active, onClick, children, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${active
        ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm"
        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
    >
      {children}
      {badge > 0 && (
        <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-black flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

/* واجهة تظهر لما ما يكون في أي طلبات */
function EmptyRequests({ t }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 space-y-3 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
        <Users size={24} className="text-slate-400" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
        {t("roommate_matching.request.no_requests")}
      </p>
    </motion.div>
  );
}

/*  Main Component  */
export default function RoommateView({ viewportVariants }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  // هل نُظهر الاقتراحات أم شاشة البحث الرئيسية؟
  const [showSuggestions, setShowSuggestions] = useState(false);
  // قائمة الطلاب المقترحين للغرفة هاي من فوق
  const [suggestions, setSuggestions] = useState([]);
  const [fetchingMatches, setFetchingMatches] = useState(false);
  
  // شريك السكن المقبول المخزن بقاعدة البيانات
  const [dbAcceptedRoommate, setDbAcceptedRoommate] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(true);

  useEffect(() => {
    const fetchDbMatch = async () => {
      try {
        const response = await api.get('/ai/roommate-match');
        if (response.success && response.data) {
          setDbAcceptedRoommate(response.data);
        } else {
          setDbAcceptedRoommate(null);
        }
      } catch (err) {
        console.error("Failed to fetch database roommate match:", err);
      } finally {
        setLoadingMatch(false);
      }
    };
    fetchDbMatch();
  }, []);

  const fetchRoommateMatches = async () => {
    setFetchingMatches(true);
    try {
      const response = await api.post('/ai/match-roommates');
      if (response.success && response.data) {
        // فلترة الشركاء المقترحين بحيث لا يظهر شريك السكن الحالي المقبول في الاقتراحات
        const currentMatchId = dbAcceptedRoommate?.id;
        const filtered = currentMatchId 
          ? response.data.filter(item => item.id !== currentMatchId)
          : response.data;
        setSuggestions(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch roommate matches:", err);
    } finally {
      setFetchingMatches(false);
    }
  };

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [activeTab, setActiveTab] = useState("suggestions");

  const fetchRoommateRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await api.get('/ai/roommate-requests');
      if (response.success && response.data) {
        setRequests(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch roommate requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRoommateRequests();
  }, []);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRoommateRequests();
    }
  }, [activeTab]);

  const pendingCount = requests.filter((r) => r.status === STATUS.PENDING).length;

  const handlePair = async (person) => {
    if (dbAcceptedRoommate) return;
    if (requests.find((r) => r.id === person.id)) return;
    try {
      const response = await api.post('/ai/roommate-request/send', {
        receiverId: person.id
      });
      if (response.success) {
        await fetchRoommateRequests();
        setActiveTab("requests");
      }
    } catch (err) {
      console.error("Failed to send roommate request:", err);
    }
  };

  const handleAccept = async (id) => {
    if (dbAcceptedRoommate) return;
    const person = requests.find(r => r.id === id);
    if (!person) return;
    
    try {
      const response = await api.post('/ai/roommate-request/accept', {
        senderId: id
      });
      if (response.success) {
        setDbAcceptedRoommate(person);
        await fetchRoommateRequests();
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to accept roommate request:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await api.post('/ai/roommate-request/reject', {
        senderId: id
      });
      if (response.success) {
        await fetchRoommateRequests();
      }
    } catch (err) {
      console.error("Failed to reject roommate request:", err);
    }
  };

  const handleCancel = async (id) => {
    try {
      const response = await api.post('/ai/roommate-request/cancel', {
        receiverId: id
      });
      if (response.success) {
        await fetchRoommateRequests();
      }
    } catch (err) {
      console.error("Failed to cancel roommate request:", err);
    }
  };

  const handleUnmatch = async () => {
    const partnerId = dbAcceptedRoommate?.id;
    if (!partnerId) return;

    try {
      const response = await api.post('/ai/unpair-roommate', { partnerId });
      if (response.success) {
        setDbAcceptedRoommate(null);
        setRequests([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error("Failed to unpair roommates in database:", err);
    }
  };

  const currentRoommate = dbAcceptedRoommate;

  if (loadingMatch) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
          {isAr ? "تحميل معلومات شريك السكن..." : "Loading roommate information..."}
        </p>
      </div>
    );
  }

  /* عرض واجهة الشريك المقبول مباشرة إذا تمت الموافقة والمطابقة */
  if (currentRoommate) {
    return (
      <MatchedProfileView
        roommate={currentRoommate}
        onUnmatch={handleUnmatch}
        viewportVariants={viewportVariants}
        isAr={isAr}
      />
    );
  }

  /* ── Landing (not yet opened suggestions) ── */
  if (!showSuggestions) {
    return (
      <motion.div
        variants={viewportVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col items-center justify-center py-12 space-y-8 text-center"
      >
        {/* Animated icon */}
        <div className="relative">
          <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-violet-500 via-indigo-600 to-blue-700 flex items-center justify-center shadow-2xl shadow-violet-500/30">
            <UserPlus2 size={52} className="text-white" strokeWidth={1.5} />
          </div>
          {/* Orbiting dot */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-lime-400 shadow-lg shadow-lime-400/50" />
          </motion.div>
        </div>

        <div className="space-y-2 max-w-xs">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {t("roommate_matching.find_title")}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {t("roommate_matching.find_desc")}
          </p>
        </div>

        <Button
          onClick={() => {
            setShowSuggestions(true);
            fetchRoommateMatches();
          }}
          variant=""
          size=""
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-black text-sm shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles size={18} />
          {t("roommate_matching.find_matches_btn")}
        </Button>
      </motion.div>
    );
  }

  /* ── Suggestions / Requests View ── */
  return (
    <motion.div
      variants={viewportVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
          <Users size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none mb-0.5">
            {t("roommate_matching.title")}
          </h2>
          <p className="text-slate-400 text-xs font-medium">
            {t("roommate_matching.subtitle")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1.5 bg-slate-100 dark:bg-white/[0.04] rounded-2xl w-fit">
        <Tab
          active={activeTab === "suggestions"}
          onClick={() => setActiveTab("suggestions")}
        >
          {t("roommate_matching.tabs.suggestions")}
        </Tab>
        <Tab
          active={activeTab === "requests"}
          onClick={() => setActiveTab("requests")}
          badge={pendingCount}
        >
          {t("roommate_matching.tabs.requests")}
        </Tab>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "suggestions" && (
          <motion.div
            key="sug"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
            className="space-y-2"
          >
            {fetchingMatches ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-4" />
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  {isAr ? "جاري حساب أفضل الشركاء المتوافقين..." : "Calculating best compatible roommates..."}
                </p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm font-bold text-slate-400">
                  {isAr ? "لم نجد عروضاً متوافقة حالياً. جرب تحديث عادات سكنك." : "No compatible matches found yet. Try updating your habit preferences."}
                </p>
              </div>
            ) : (
              suggestions.map((p) => (
                <SuggestionCard
                  key={p.id}
                  data={p}
                  onPair={handlePair}
                  alreadySent={!!requests.find((r) => r.id === p.id)}
                />
              ))
            )}
          </motion.div>
        )}

        {activeTab === "requests" && (
          <motion.div
            key="req"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
            className="space-y-2"
          >
            {requests.length === 0 ? (
              <EmptyRequests t={t} />
            ) : (
              requests.map((req) => (
                <RoommateCard
                  key={req.id}
                  data={req}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onCancel={handleCancel}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
