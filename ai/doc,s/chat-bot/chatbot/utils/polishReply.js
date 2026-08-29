// utils/polishReply.js
const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ تحسين لسان فقط — إذا فشل، يرجع النص الأصلي بدون ما يكسر شي
async function polishReply({ userText, replyText }) {
  try {
    if (!replyText || typeof replyText !== "string") return replyText;

    // ما نرسل ردود قصيرة جدًا
    if (replyText.trim().length < 25) return replyText;

    const resp = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      max_tokens: 900,
      messages: [
        {
          role: "system",
          content:
                   "أنت مساعد لموقع إعلانات في الأردن اسمه Lumino Souq. " +
                   "مهمتك إعادة صياغة الرد ليكون لطيف وواضح باللهجة الأردنية الخفيفة. " +
                   "مسموح لك تقديم نصائح وتوصيات للمستخدم، " +
                   "لكن فقط بناءً على الإعلانات والبيانات الموجودة داخل المنصة. " +
                   "إذا سأل المستخدم عن رأيك أو نصيحتك، " +
                   "اربط النصيحة دائمًا بما هو متوفر حاليًا في المنصة، " +
                   "واستخدم عبارات مثل: " +
                   "\"حسب الإعلانات الموجودة\"، " +
                   "\"بناءً على الخيارات المتوفرة حاليًا\"، " +
                   "\"من ناحية السعر والعروض الموجودة عندنا\". " +
                   "ممنوع عليك إعطاء مقارنات تقنية عامة أو معلومات من خارج بيانات المنصة، " +
                   "وممنوع ذكر مواصفات أو مزايا غير مذكورة ضمن الإعلانات. " +
                   "ممنوع تغيّر الحقائق أو تضيف نتائج جديدة. " +
                   "ممنوع تغير الروابط أو الأسعار أو الأقسام. " +
                   "ممنوع تحذف أي سطر رابط يبدأ بـ /Page2/ أو أي ID. " +
                   "مهم جدًا: لا تختصر ولا تقص أي جزء من الرد، " +
                   "لازم ترجع نفس المحتوى كامل حرفيًا. " +
                   "إذا الرد فيه قائمة إعلانات، " +
                   "اترك القائمة كما هي حرفيًا بدون أي تعديل، " +
                   "وعدّل فقط المقدمة أو الخاتمة بجمل قصيرة.",


        },
        {
          role: "user",
          content:
            `رسالة المستخدم:\n${userText}\n\n` +
            `الرد الحالي (لا تغيّر الحقائق ولا الروابط):\n${replyText}\n\n` +
            `اكتب الرد المحسّن فقط:`,
        },
      ],
    });

    const out = resp.choices?.[0]?.message?.content?.trim();
    // ✅ حماية من القص: إذا الرد فيه روابط/قائمة إعلانات، وما رجّع كل شي، خلي الأصلي
    if (replyText.includes("/Page2/") && out && out.length < replyText.length * 0.8) {
    return replyText;
  }
    return out || replyText;
  } catch (e) {
    return replyText;
  }
}

module.exports = { polishReply };
