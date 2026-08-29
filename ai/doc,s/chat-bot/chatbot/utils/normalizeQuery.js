// utils/normalizeQuery.js
const { generateText } = require("./geminiClient");

// timeout wrapper عشان ما يعلّق السيرفر لو Gemini اتأخر
function withTimeout(promise, ms = 3500) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini timeout")), ms)
    ),
  ]);
}

function cleanKeywords(raw) {
  // نمنع Gemini يرجع شرح/سطرين.. بدنا كلمات فقط
  const txt = String(raw || "")
    .replace(/\n/g, " ")
    .replace(/[|؛؛]/g, ",")
    .replace(/\s+/g, " ")
    .trim();

  // خليها "comma separated" بشكل نظيف
  // وإذا رجع جملة طويلة، نقصّها
  const parts = txt
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  // فلترة كلمات قصيرة/غير مفيدة
  const filtered = parts
  .flatMap(p => p.split(" "))
  .map(w => w.trim())
  .filter(Boolean)
  .filter(w => (w.length >= 2) || /^\d+$/.test(w))
  .slice(0, 10);


  // رجّعيها نص واحد
  return filtered.join(" ");
}

async function normalizeQuery(userMessage) {
  const prompt =
    `حوّل جملة المستخدم لكلمات بحث قصيرة فقط (بدون شرح).\n` +
    `- رجّع كلمات مفتاحية فقط.\n` +
    `- لا تكتب جمل.\n` +
    `- لا تكتب "keywords:" ولا أي مقدمة.\n` +
    `- أقصى حد 10 كلمات.\n\n` +
    `User: ${userMessage}\n` +
    `Output:`;

  try {
    const raw = await withTimeout(generateText(prompt), 3500);
    const cleaned = cleanKeywords(raw);

    // لو طلع فاضي، رجّع null
    if (!cleaned || cleaned.length < 2) return null;

    return cleaned;
  } catch (e) {
    console.warn("normalizeQuery failed:", e.message);
    return null;
  }
}

module.exports = { normalizeQuery };
