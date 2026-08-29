import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, User, Minus } from "lucide-react";
import { Button } from "../ui/Button";
import api from "../../utils/api";

export default function FloatingAI() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState("");

  const messagesEndRef = useRef(null);

  // Load user name and initialize conversation
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    let name = isAr ? "طالبنا العزيز" : "Student";
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed.name) name = parsed.name;
      } catch (e) {
        console.error(e);
      }
    }
    setUserName(name);

    // Initial welcome message
    setMessages([
      {
        id: 1,
        sender: "bot",
        text: t("chatbot.welcome", { name: name }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [isAr, t]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Chatbot logic matching keywords
  const getBotResponse = (input) => {
    const text = input.toLowerCase().trim();

    if (isAr) {
      if (text.includes("مرحبا") || text.includes("سلام") || text.includes("هلا")) {
        return `أهلاً بك يا ${userName}! يسعدني جداً التحدث معك. كيف يمكنني خدمتك اليوم؟`;
      }
      if (text.includes("جامعة") || text.includes("قرب") || text.includes("مسافة") || text.includes("الرواد") || text.includes("النخبة")) {
        return "أكثر السكنات قرباً من جامعة الحسين بن طلال في معان هي 'سكن الرواد' و'سكن النخبة'، حيث تبعد مسافة مشي قصيرة جداً (أقل من 5 دقائق) وبها كافة الخدمات المتميزة للطلاب.";
      }
      if (text.includes("سعر") || text.includes("اسعار") || text.includes("رخيص") || text.includes("بكم") || text.includes("تكلفة")) {
        return "تبدأ أسعار السكنات في معان من 80 ديناراً شهرياً لحجز سرير في غرفة مشتركة (Bed Basis)، وتصل إلى 180 ديناراً للأستوديوهات والشقق المستقلة والمفروشة بالكامل.";
      }
      if (text.includes("حجز") || text.includes("كيف احجز") || text.includes("طريقة الحجز") || text.includes("احجز")) {
        return "الحجز في غاية السهولة! تصفح السكنات، اختر السكن المناسب، ثم اضغط على زر 'عرض التفاصيل' ومن ثم 'احجز الآن'. حدد تاريخ انتقالك والدفع (فيزا أو نقدي) وأرسل الطلب للمالك ليقوم بقبوله.";
      }
      if (text.includes("روم ميت") || text.includes("شريك") || text.includes("صاحب") || text.includes("شريكة")) {
        return "لإيجاد شريك سكن متوافق، اذهب إلى لوحة التحكم الشخصية (Dashboard) -> قسم 'شريك السكن'. عبّئ اختبار تفضيلات نمط الحياة (النوم، الدراسة، النظافة)، وسيقوم نظامنا بمطابقتك تلقائياً مع شركاء متوافقين تماماً!";
      }
      if (text.includes("صيانة") || text.includes("خربان") || text.includes("تصليح")) {
        return "إذا واجهت أي عطل في سكنك الحالي، يمكنك الدخول للداشبورد -> 'طلب صيانة'، وتحديد المشكلة (كهرباء، سباكة، أثاث) مع رفع صورة لها، وسيقوم المالك بمتابعتها وتصليحها فوراً.";
      }
      if (text.includes("اتصال") || text.includes("تواصل") || text.includes("تلفون") || text.includes("واتس") || text.includes("رقم")) {
        return "نوفر لك أرقام هواتف الملاك وروابط واتساب مباشرة في صفحة تفاصيل كل عقار لتتمكن من التحدث معهم مباشرة وبدون أي عمولات أو وسطاء.";
      }
      return "سؤال رائع! بصفتي مساعد Nestify الذكي، يمكنني إرشادك لأفضل السكنات القريبة من جامعة الحسين، أو إعطائك تفاصيل عن الأسعار، أو مساعدتك في العثور على شريك سكن متوافق. ما الذي تود معرفته؟";
    } else {
      if (text.includes("hi") || text.includes("hello") || text.includes("hey") || text.includes("yo")) {
        return `Hello ${userName}! Nice to talk to you. How can I assist you today?`;
      }
      if (text.includes("university") || text.includes("campus") || text.includes("near") || text.includes("close") || text.includes("dorms")) {
        return "The closest housing options to Al-Hussein Bin Talal University are 'Al-Rowad Dorms' and 'Elite Housing', both are within a short walking distance (less than 5 minutes).";
      }
      if (text.includes("price") || text.includes("prices") || text.includes("cost") || text.includes("cheap") || text.includes("rent")) {
        return "Dorm prices in Ma'an start from 80 JOD/month for a shared bed space, up to 180 JOD/month for fully furnished private studios/apartments.";
      }
      if (text.includes("book") || text.includes("reserve") || text.includes("how to book")) {
        return "To book a room, browse the listings, choose a property, click 'View Details' and then 'Reserve Now'. Select your move-in date and payment method (card or cash). The owner will instantly receive and review your request!";
      }
      if (text.includes("roommate") || text.includes("partner") || text.includes("match")) {
        return "To find the perfect roommate, navigate to your Student Dashboard -> 'Roommate' section. Fill in your lifestyle preferences quiz (sleep, study, cleanliness), and our system will match you with highly compatible students.";
      }
      if (text.includes("maintenance") || text.includes("fix") || text.includes("repair") || text.includes("broken")) {
        return "If you have an issue in your room, go to your Student Dashboard -> 'Maintenance' tab, choose the issue category (plumbing, electrical, furniture), add details/photos, and submit it directly to your landlord.";
      }
      if (text.includes("contact") || text.includes("call") || text.includes("phone") || text.includes("whatsapp")) {
        return "You can directly connect with landlords via phone or WhatsApp link provided on each property details page. No middleman, 100% free!";
      }
      return "That's a great question! As Nestify AI, I can help you find dorms near university, explain prices, show you how to book, or help you find compatible roommates. What would you like to know?";
    }
  };

  const handleSend = async (textToSend) => {
    const messageText = textToSend || inputValue;
    if (!messageText.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue("");

    // Trigger typing simulation
    setIsTyping(true);

    try {
      const res = await api.post("/ai/chat", { message: messageText });
      setIsTyping(false);
      
      const replyText = res.success && res.data 
        ? res.data 
        : (isAr 
            ? "عذراً، أواجه مشكلة في معالجة طلبك حالياً." 
            : "Sorry, I am having trouble processing your request right now.");

      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat API error, falling back to keyword matching:", err);
      setIsTyping(false);
      
      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: getBotResponse(messageText),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }
  };

  const quickChips = [
    { label: t("chatbot.chips.campus"), query: isAr ? "سكنات قرب الجامعة" : "dorms near university" },
    { label: t("chatbot.chips.prices"), query: isAr ? "الأسعار" : "rent prices" },
    { label: t("chatbot.chips.roommate"), query: isAr ? "روم ميت" : "roommate match" },
    { label: t("chatbot.chips.booking"), query: isAr ? "طريقة الحجز" : "how to book" }
  ];

  return (
    <div className={`fixed bottom-6 ${isAr ? "left-6" : "right-6"} z-[9999] font-sans pointer-events-none`}>
      {/* CSS style block to hide webkit scrollbars for the chips container */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <AnimatePresence>
        {/* Full-Screen Glassmorphic Blur Backdrop */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/20 dark:bg-black/40 backdrop-blur-[6px] z-[-1] pointer-events-auto cursor-pointer"
          />
        )}

        {/* Chat Box Popup */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50, x: isAr ? -30 : 30 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40, x: isAr ? -20 : 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`w-[360px] sm:w-[380px] h-[520px] rounded-[2rem] !bg-white/95 dark:!bg-slate-950/95 backdrop-blur-xl border border-slate-100 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col mb-4 pointer-events-auto`}
          >
            {/* Header */}
            <div className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 p-4 !text-white flex items-center justify-between shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner relative">
                  <Sparkles size={20} className="!text-white animate-pulse" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-indigo-600 rounded-full" />
                </div>
                <div className="text-start">
                  <h3 className="font-black text-sm tracking-tight flex items-center gap-1.5 !text-white">
                    {t("chatbot.title")}
                  </h3>
                  <p className="text-[10px] font-bold text-blue-100/90 tracking-wide">
                    {t("chatbot.subtitle")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 relative z-10">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="!h-8 !w-8 hover:!bg-white/10 !text-white rounded-lg !bg-indigo-600"
                >
                  <Minus size={18} className="!text-white absolute z-10 " />
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="!h-8 !w-8 hover:!bg-white/10 !text-white rounded-lg !bg-indigo-600"
                >
                  <X size={18} className="!text-white absolute z-10 " />
                </Button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 !bg-slate-50/50 dark:!bg-slate-900/10 flex flex-col">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-[1.5rem] p-3 text-sm leading-relaxed shadow-sm text-start ${msg.sender === "user"
                      ? "!bg-blue-600 !text-white rounded-br-none"
                      : "!bg-white dark:!bg-slate-800 !text-slate-800 dark:!text-slate-200 border border-slate-100 dark:border-white/5 rounded-bl-none"
                      }`}
                  >
                    <p className="font-medium whitespace-pre-line">{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 font-bold ${msg.sender === "user" ? "!text-blue-200" : "!text-slate-400"
                        }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="!bg-white dark:!bg-slate-800 border border-slate-100 dark:border-white/5 p-3 rounded-[1.5rem] rounded-bl-none shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full !bg-slate-400 dark:!bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full !bg-slate-400 dark:!bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full !bg-slate-400 dark:!bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="px-4 py-2 !bg-slate-100/50 dark:!bg-slate-900/30 border-t border-slate-100 dark:border-white/5 flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap py-2.5"
            >
              {quickChips.map((chip, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleSend(chip.query)}
                  variant="outline"
                  className="px-3.5 py-1.5 !rounded-full !bg-white dark:!bg-slate-800 hover:!bg-indigo-50 dark:hover:!bg-indigo-900/20 text-xs font-black !text-slate-700 dark:!text-slate-300 !border !border-slate-200/60 dark:!border-slate-700 transition-all hover:!border-indigo-200 dark:hover:!border-indigo-900/50 shadow-sm !h-auto !py-1.5 !px-3.5"
                >
                  {chip.label}
                </Button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3 !bg-white dark:!bg-slate-950 border-t border-slate-100 dark:border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={t("chatbot.placeholder")}
                className="flex-1 px-4 py-3 rounded-2xl !bg-slate-50 dark:!bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 text-sm font-semibold !text-slate-800 dark:!text-slate-100"
              />
              <Button
                onClick={() => handleSend()}
                variant="default"
                size="icon"
                className="!rounded-2xl !h-12 !w-12 !bg-blue-600 !text-white hover:!bg-blue-700 shadow-md shadow-blue-600/10"
              >
                <Send size={16} className="!text-white" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bubble Button */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="pointer-events-auto cursor-pointer"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="default"
          size="icon"
          className="w-16 h-16 !rounded-full !bg-gradient-to-tr !from-blue-600 !via-indigo-600 !to-indigo-500 !text-white flex items-center justify-center shadow-[0_8px_30px_rgb(79,70,229,0.4)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] cursor-pointer hover:rotate-6 transition-all duration-300 relative border-2 border-white/20 dark:border-white/10"
        >
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
          <MessageSquare size={26} className="!text-white" />
        </Button>
      </motion.div>
    </div>
  );
}

