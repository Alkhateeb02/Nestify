// routes/chatRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const { aliasNormalize, ALIASES } = require("../utils/aliasNormalize"); // تعديل 6

const { normalizeQuery } = require("../utils/normalizeQuery");
const { extractFilters } = require("../utils/extractFilters");
const { polishReply } = require("../utils/polishReply");

const { formatAds, formatCurrentAd } = require("../utils/formatAds");

const router = express.Router();

const ALLOWED_CATEGORIES = new Set([
  "apartments",
  "cars",
  "clothes",
  "electronics",
  "properties",
]);

const CATEGORY_AR = {
  cars: "السيارات",
  apartments: "الشقق",
  clothes: "الملابس",
  electronics: "الإلكترونيات",
  properties: "العقارات/الأراضي",
};

function safeCategory(cat) {
  const c = String(cat || "").toLowerCase();
  return ALLOWED_CATEGORIES.has(c) ? c : null;
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * ✅ (1) Projection — بنجيب بس هالحقول (أسرع وأنظف)
 */
const AD_PROJECTION = {
  title: 1,
  price: 1,
  location: 1,
  listingType: 1,
  category: 1,
  image: 1,
  images: 1,
  type: 1,
  brand: 1,
  model: 1,
  color: 1,
  size: 1,
  condition: 1,
  createdAt: 1,
};

async function getAdById(category, id) {
  const cat = safeCategory(category);
  if (!cat) return null;
  if (!ObjectId.isValid(id)) return null;

  const col = mongoose.connection.collection(cat);
  return await col.findOne(
    { _id: new ObjectId(id) },
    { projection: AD_PROJECTION }
  );
}

async function listLatestAds(category, limit = 3) {
  const cat = safeCategory(category);
  if (!cat) return [];
  const col = mongoose.connection.collection(cat);

  return await col
    .find({}, { projection: AD_PROJECTION })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

/**
 * ✅ (2) StopWords + Tokenize موحّدين
 *
 * ✅ تعديل مهم: حذفنا كلمات الأقسام + phone/mobile/car
 * لأنها كانت بتسبب نتائج عامة (كل الإلكترونيات/كل السيارات)
 */
const STOP_WORDS = new Set([
  // عربي
  "بدي","بدور","ببحث","موجود","بالموقع","شو","في","فيه","كم","اسعار","سعر",
  "من","الى","إلى","لحد","ل","على","قريب","قريبة",
  "للبيع","للإيجار","ايجار","إيجار","جديد","مستعمل" ," سيارة","سياره"," سيارات",

  // إنجليزي
  "is","are","the","a","an","in","on","for","with","and","or",
]);

function tokenizeText(text, maxTokens = 6) {
  const tokens = String(text || "")
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => w.length >= 2)
    .filter((w) => !STOP_WORDS.has(w));

  // نحدّها عشان ما تكبر الاستعلامات
  return tokens.slice(0, maxTokens);
}

/**
 * ✅ بحث ذكي tokens + projection
 */
async function searchAdsSmart(
  { category, userMessage, priceMin, priceMax, listingType, locationHint, keywords, cheap },
  limit = 8
) {
  const cats = category
    ? [safeCategory(category)].filter(Boolean)
    : Array.from(ALLOWED_CATEGORIES);

  const raw = (keywords && String(keywords).trim())
    ? String(keywords)
    : String(userMessage || "");

  const tokens = tokenizeText(raw, 6);

  // تعديل (1)

// ✅ FIX 2: شيل الكلمات العامة إذا في كلمات قوية (ماركة/موديل/مدينة...)
const GENERIC_TOKENS = new Set([
  "car","cars",
  "phone","mobile",
  "laptop","computer","desktop",
  "tv","camera","drone",
  "apartment","apartments",
  "clothes","electronics",
  "property","properties","land",
]);

const strongTokens = tokens.filter(t => !GENERIC_TOKENS.has(t));
const finalTokens = strongTokens.length ? strongTokens : tokens;
// لهون

  // إذا ما في كلمات مفيدة ولا locationHint → ما نعمل بحث
  // ✅ FIX 3A: اسمحي بالبحث حتى بدون tokens إذا في فلترة سعر/بيع-ايجار
// تعديل (3)
  const hasStructured = (priceMin != null || priceMax != null || !!listingType);
if (!tokens.length && !locationHint && !hasStructured) return [];
// لهون استبدال سطر

  const orParts = [];

  for (const tok of finalTokens) { //  (2) تعديل 
    // تعديل 7
let pattern = escapeRegex(tok);

if (ALIASES && ALIASES[tok]) {
  const vs = ALIASES[tok]
    .map(v => escapeRegex(v))
    .filter(Boolean);
  // tok + variants
  pattern = `(?:${[escapeRegex(tok), ...vs].join("|")})`;
}

const regex = new RegExp(pattern, "i");
//// لهون
    orParts.push(
      { title: regex },
      { description: regex },
      { location: regex },
      { type: regex },
      { brand: regex },
      { model: regex },
      { color: regex },
      { size: regex },
      { condition: regex },
      { listingType: regex }
    );
  }

  if (locationHint) {
    const regexLoc = new RegExp(escapeRegex(locationHint), "i");
    orParts.push(
      { location: regexLoc },
      { description: regexLoc },
      { title: regexLoc }
    );
  }

  const filter = {};
  if (orParts.length) filter.$or = orParts;

  // price filter
  if (priceMin != null || priceMax != null) {
    filter.price = {};
    if (priceMin != null) filter.price.$gte = priceMin;
    if (priceMax != null) filter.price.$lte = priceMax;
  }

  // listingType
  if (listingType) {
    filter.listingType = new RegExp(listingType, "i");
  }

  const all = [];
  for (const cat of cats) {
    const col = mongoose.connection.collection(cat);

    const docs = await col
      .find(filter, { projection: AD_PROJECTION })
      .limit(limit)
      .toArray();

    docs.forEach((d) => all.push({ ...d, _category: cat }));
  }

  if (cheap) {
    all.sort((a, b) => (a.price ?? 1e18) - (b.price ?? 1e18));
  }

  return all.slice(0, limit);
}

/**
 * هل المستخدم بس بحكي "بدور على ..."؟
 */
function isBrowseIntentOnly(text) {
  const t = (text || "").toLowerCase().trim();

  return (
    /(بدور|ببحث|بدي اشوف|بدي أشوف|موجود|وريني|اعرضلي|اعرض لي)\s*(على)?\s*/.test(t) &&
    !/(\d[\d,٫]*|دينار|jd|jod|تيسلا|tesla|سامسونج|samsung|ايفون|iphone|احمر|أحمر|اسود|أبيض|معان|عمان|الزرقاء|اربد|عقبة|ايجار|إيجار|للبيع|للإيجار)/.test(t) &&
    t.length <= 25
  );
}
function isHowAreYou(text) {
  const t = (text || "").toLowerCase().trim();
  return /^(كيفك|كيف حالك|شلونك|شو اخبارك|شو الأخبار|اخبارك|كيف الامور|كيف الأمور)\??$/.test(t);
}

function isThanks(text) {
  const t = (text || "").toLowerCase().trim();
  return /^(شكرا|شكرًا|يسلمو|يسلموا|مشكور|يعطيك العافيه|يعطيك العافية|thx|thanks)\s*!*$/.test(t);
}

function isAboutSite(text) {
  const t = (text || "").toLowerCase().trim();
  return /(شو هاد الموقع|شو هذا الموقع|شو موقعكم|شو بتعملو|كيف بشتري|كيف اشتري|كيف ببيع|كيف ابيع|كيف بضيف اعلان|كيف اضيف اعلان|كيف بتواصل|كيف التواصل)/.test(t);
}

// ✅ سؤال عام عن قسم فقط: "في سيارات؟" / "موجود سيارات" / "سيارات"
function isCategoryOnlyBrowse(text, effectiveCategory) {
  if (!effectiveCategory) return false;
  const t = (text || "").toLowerCase().trim();

  // إذا النص قصير/عام وما فيه مواصفات أو أرقام أو مدينة
  const hasSpecs =
    /(\d[\d,٫]*|jd|jod|دينار|amman|عمان|irbid|اربد|zarqa|الزرقاء|aqaba|العقبة|tesla|تيسلا|samsung|سامسونج|iphone|ايفون|احمر|أحمر|اسود|أسود|ابيض|أبيض|للبيع|للإيجار|ايجار|إيجار)/.test(t);

  if (hasSpecs) return false;

  // أسئلة "موجود؟/في؟/شو عندكم؟" + كلمة القسم أو بدونها (لأنه category ممكن طالعة من detectCategory)
  return (
    /^(في|موجود|موجوده|موجودة|عندك|عندكم|شو فيه|شو في|اعرض|وريني|بدور|بدي)\b/.test(t) ||
    t.length <= 12
  );
}
/////// تعديل البراندات والانواع
function normalizeLite(s) {
  return String(s || "").toLowerCase().trim();
}

// brands lists (كبداية — زيدي عليهم براحتك)
const CAR_BRANDS = [
  "كيا","هيونداي","تويوتا","نيسان","هوندا","مرسيدس","bmw","بي ام دبليو","اودي","فورد","شيفروليه","ميتسوبيشي","سوزوكي","مازدا","mg","جيلي","chery","شيري","رينو","renault","volkswagen","فولكسفاغن"
];

const ELEC_BRANDS = [
  "apple","ابل","iphone","ايفون",
  "samsung","سامسونج",
  "xiaomi","شاومي",
  "oppo","اوبو",
  "huawei","هواوي",
  "lenovo","لينوفو",
  "dell","ديل",
  "hp",
  "asus","ايسوس",
  "acer","ايسر",
];

const ELEC_TYPES = [
  "mobile","موبايل","تلفون","هاتف","phone",
  "laptop","لاب توب","لابتوب","notebook",
  "tablet","تابلت","ipad","ايباد",
  "tv","تلفزيون",
  "camera","كاميرا",
];

function findFirstMatch(tokens, list) {
  const set = new Set(list.map(normalizeLite));
  return tokens.find(t => set.has(normalizeLite(t))) || null;
}

function splitTokens(text) {
  return tokenizeText(text, 8); // عندك tokenizeText جاهز
}

// ✅ استخراج (brand, model) للسيارات من الجملة
function parseCarQuery(rawMessage) {
  const tokens = splitTokens(rawMessage);

  const brand = findFirstMatch(tokens, CAR_BRANDS);
  if (!brand) return { brand: null, model: null };

  // model = كل اللي بعد brand (أحيانًا كلمتين)
  const idx = tokens.findIndex(t => normalizeLite(t) === normalizeLite(brand));
  const after = tokens.slice(idx + 1);

  // إذا ما في شيء بعد البراند -> مجرد براند
const model = after.length ? after.slice(0, 2).join(" ") : null;

  return { brand, model };
}

// ✅ استخراج (brand, modelText, type) للإلكترونيات
function parseElectronicsQuery(rawMessage) {
  const tokens = splitTokens(rawMessage);

  const brand = findFirstMatch(tokens, ELEC_BRANDS);
  const type = findFirstMatch(tokens, ELEC_TYPES);

  let modelText = null;

  if (brand) {
    const idx = tokens.findIndex(t => normalizeLite(t) === normalizeLite(brand));
    const after = tokens.slice(idx + 1);
    if (after.length) modelText = after.join(" "); // مثل "a14" أو "15 pro max"
  } else if (type) {
    const idx = tokens.findIndex(t => normalizeLite(t) === normalizeLite(type));
    const after = tokens.slice(idx + 1);
    if (after.length) modelText = after.join(" ");
  }

  return { brand, type, modelText };
}

// ✅ بحث strict للسيارات: brand + model (بما إنه موجودين كحقول)
async function searchCarsStrict({ brand, model, filters }, limit = 6) {
  const col = mongoose.connection.collection("cars");

  const and = [];

  if (brand) and.push({ brand: new RegExp(escapeRegex(brand), "i") });
  if (model) and.push({ model: new RegExp(escapeRegex(model), "i") });

  // احترام فلاتر السعر/المكان/بيع-ايجار
  if (filters?.priceMin != null || filters?.priceMax != null) {
    const p = {};
    if (filters.priceMin != null) p.$gte = filters.priceMin;
    if (filters.priceMax != null) p.$lte = filters.priceMax;
    and.push({ price: p });
  }
  if (filters?.listingType) and.push({ listingType: new RegExp(escapeRegex(filters.listingType), "i") });
  if (filters?.locationHint) and.push({ location: new RegExp(escapeRegex(filters.locationHint), "i") });

  const q = and.length ? { $and: and } : {};

  const docs = await col.find(q, { projection: AD_PROJECTION }).limit(limit).toArray();
  return docs.map(d => ({ ...d, _category: "cars" }));
}

// ✅ بحث strict للإلكترونيات: brand + (modelText داخل description)
async function searchElectronicsStrict({ brand, modelText, type, filters }, limit = 6) {
  const col = mongoose.connection.collection("electronics");
  const and = [];

  if (brand) and.push({ brand: new RegExp(escapeRegex(brand), "i") });

  // الموديل غالبًا في description
  if (modelText) {
    const r = new RegExp(escapeRegex(modelText), "i");
    and.push({ $or: [{ description: r }, { title: r }, { model: r }] }); // لو مستقبلًا صار عندك model
  }

  // النوع: عندك title="mobile" أحيانًا
  if (type) {
    const r = new RegExp(escapeRegex(type), "i");
    and.push({ $or: [{ title: r }, { type: r }, { description: r }] });
  }

  if (filters?.priceMin != null || filters?.priceMax != null) {
    const p = {};
    if (filters.priceMin != null) p.$gte = filters.priceMin;
    if (filters.priceMax != null) p.$lte = filters.priceMax;
    and.push({ price: p });
  }
  if (filters?.listingType) and.push({ listingType: new RegExp(escapeRegex(filters.listingType), "i") });
  if (filters?.locationHint) and.push({ location: new RegExp(escapeRegex(filters.locationHint), "i") });

  const q = and.length ? { $and: and } : {};
  const docs = await col.find(q, { projection: AD_PROJECTION }).limit(limit).toArray();
  return docs.map(d => ({ ...d, _category: "electronics" }));
}

/// لهووووون
console.log("polishReply typeof:", typeof polishReply);


router.post("/chat", async (req, res) => {
  try {
    console.log("🔥 CHAT ROUTE ACTIVE - BUILD = 2026-01-04_1");
    console.log("✅ /chat hit - version: GEMINI_FALLBACK_1");

    // ✅ تعديل: نخزن النص الأصلي + نطبع normalized للبحث
    const rawMessage = (req.body?.message || "").trim();
    const userMessage = aliasNormalize(rawMessage);

    const page = req.body?.page || "souq";
    const pageCategory = req.body?.category || null;
    const adId = req.body?.adId || null;

    if (!userMessage) return res.json({ reply: "اكتب سؤالك 🙂" });

    // رد يدوي للتحية
    if (/^(مرحبا|مرحباً|هلا|هلا والله|اهلا|أهلا|السلام عليكم|سلام)$/i.test(userMessage)) {
      return res.json({
        reply: "يا هلا فيك 😄 احكيلي بتدور على سيارات ولا شقق ولا اراضي ولا إلكترونيات ولا ملابس؟",
      });
    }
        // ✅ Small-talk: كيفك / شكرًا / عن الموقع
    if (isHowAreYou(rawMessage)) {
      return res.json({
        reply:
          "الحمدلله تمام 😄💜\n" +
          "احكيلي شو بتدوري؟ (سيارات/شقق/أراضي/إلكترونيات/ملابس) + مدينة + ميزانية لو بتقدري",
      });
    }

    if (isThanks(rawMessage)) {
      return res.json({
        reply: "العفو يا قمر 💜 إذا بدك أي شي احكيلي شو بتدوري وبساعدك فورًا 😄",
      });
    }

    if (isAboutSite(rawMessage)) {
      return res.json({
        reply:
          "هذا موقع إعلانات ✨ بتقدري تدوري على (سيارات/شقق/أراضي/إلكترونيات/ملابس).\n" +
          "مثال اكتبي: (تيسلا بعمان تحت 20000) أو (شقة للايجار بإربد تحت 250).\n" +
          "قوليلي شو بدك وأنا بطلعلك المناسب 👌",
      });
    }


    // سياق صفحة التفاصيل
    let currentAd = null;
    if (page === "details" && pageCategory && adId) {
      currentAd = await getAdById(pageCategory, adId);
    }

    // فلترة
    const filters = extractFilters(
      userMessage,
      safeCategory(page === "category" ? pageCategory : null)
    );

    const effectiveCategory =
      filters.category || (page === "category" ? safeCategory(pageCategory) : null);


      // ✅ Small-talk intents (عشان ما يفوت على البحث بأسئلة بشرية)

              // ✅ Helper: polish كل الردود
    const send = async (replyText) => {
      const polished = await polishReply({ userText: rawMessage, replyText });
      return res.json({ reply: polished });
      

    };
    

    // ✅ FIX: list-all intent -> اعرض آخر إعلانات بالقسم بدل بحث keywords
    if (filters.listAll && effectiveCategory) {
      const latest = await listLatestAds(effectiveCategory, 8);

      if (!latest.length) {
        return send(
          `بصراحة هسا ما في إعلانات بقسم ${CATEGORY_AR[effectiveCategory] || effectiveCategory}.\n` +
          "بدك مدينة أو ميزانية؟"
        );
      }

      return send(
        `تمام 👌 هاي آخر ${Math.min(8, latest.length)} إعلانات بقسم ${CATEGORY_AR[effectiveCategory] || effectiveCategory}:\n` +
        `${formatAds(latest.map(x => ({ ...x, _category: effectiveCategory })), 8)}`
      );
    }

    // ✅ FIX: إذا سؤال فقط عن وجود قسم (في سيارات؟) اعرض latest بدل Search
    if (isCategoryOnlyBrowse(userMessage, effectiveCategory)) {
      const latest = await listLatestAds(effectiveCategory, 3);

      if (!latest.length) {
        return send(
          `هسا ما في إعلانات بقسم ${CATEGORY_AR[effectiveCategory] || effectiveCategory} 😅\n` +
          "بدك تقوليلي مدينة/ميزانية/مواصفات؟"
        );
      }

      return send(
        `أكيد 👌 هاي آخر 3 إعلانات بقسم ${CATEGORY_AR[effectiveCategory] || effectiveCategory}:\n` +
        `${formatAds(latest.map(x => ({ ...x, _category: effectiveCategory })), 3)}\n\n` +
        "بدك مدينة أو ميزانية أو مواصفات عشان أفلترلك أدق؟"
      );
    }

    // Browse: اعرض آخر 3 بالقسم
    if (effectiveCategory && isBrowseIntentOnly(userMessage)) {
      const latest = await listLatestAds(effectiveCategory, 3);

      if (!latest.length) {
        return send(
          `بصراحة هسا ما في إعلانات بقسم ${CATEGORY_AR[effectiveCategory] || effectiveCategory}.\n` +
          "بدك مدينة أو ميزانية أو مواصفات؟"
        );
      }

      return send(
        `تمام 👌 هاي آخر 3 إعلانات بقسم ${CATEGORY_AR[effectiveCategory] || effectiveCategory}:\n` +
        `${formatAds(latest.map(x => ({ ...x, _category: effectiveCategory })), 3)}\n\n` +
        "بدك مواصفات/مدينة عشان أفلترلك أدق؟"
      );
    }

    // رقم لحاله = ميزانية max
    if (/^(\d[\d,٫]*)$/.test(userMessage) && filters.priceMax == null) {
      const n = Number(String(userMessage).replace(/[,٫]/g, ""));
      if (Number.isFinite(n)) filters.priceMax = n;
    }

    // ✅ بحث أول (طبيعي)
let results = await searchAdsSmart(
  { ...filters, category: effectiveCategory, userMessage },
  8
);

// ✅ لازم يكونوا هون قبل أي if
const carQ = parseCarQuery(rawMessage);
const elecQ = parseElectronicsQuery(rawMessage);

// ✅ cars strict fallback
if (!results.length && (effectiveCategory === "cars" || (carQ.brand && !elecQ.brand))) {
  const { brand, model } = carQ;

  if (brand && model) {
    const strict = await searchCarsStrict({ brand, model, filters }, 6);

    if (strict.length) {
      results = strict;
    } else {
      const brandOnly = await searchCarsStrict({ brand, model: null, filters }, 6);

      if (brandOnly.length) {
        return send(
          `تمام 👌 دورت على "${brand} ${model}" بس ما لقيته بالزبط.\n` +
          `بس لقيتلك سيارات ${brand} ثانية ممكن تعجبك 👇\n` +
          `${formatAds(brandOnly, 6)}\n\n` +
          `إذا بدك نفس الموديل بالزبط، احكيلي سنة/ميزانية/مدينة وبفلترلك.`
        );
      }

      const latest = await listLatestAds("cars", 3);
      if (latest.length) {
        return send(
          `ما لقيت "${brand} ${model}" ولا حتى سيارات ${brand} حالياً 😅\n` +
          `بس هاي آخر 3 إعلانات سيارات عندنا 👇\n` +
          `${formatAds(latest.map(x => ({ ...x, _category: "cars" })), 3)}\n\n` +
          `بدك تقوليلي ميزانيتك أو مدينة؟`
        );
      }
    }
  }
}

// ✅ electronics strict fallback
if (!results.length && (effectiveCategory === "electronics" || (elecQ.brand && !carQ.brand))) {
  const { brand, type, modelText } = elecQ;

  if (brand && modelText) {
    const strict = await searchElectronicsStrict({ brand, modelText, type, filters }, 6);

    if (strict.length) {
      results = strict;
    } else {
      const brandOnly = await searchElectronicsStrict({ brand, modelText: null, type: null, filters }, 6);

      if (brandOnly.length) {
        return send(
          `دورت على "${brand} ${modelText}" بس ما لقيته بالزبط.\n` +
          `بس هاي أجهزة من نفس البراند (${brand}) 👇\n` +
          `${formatAds(brandOnly, 6)}\n\n` +
          `بدك موديل ثاني؟ أو حددي ميزانية/مدينة.`
        );
      }

      const latest = await listLatestAds("electronics", 3);
      if (latest.length) {
        return send(
          `ما لقيت "${brand} ${modelText}" ولا حتى ${brand} بالموقع حالياً 😅\n` +
          `بس هاي آخر 3 إعلانات بالإلكترونيات 👇\n` +
          `${formatAds(latest.map(x => ({ ...x, _category: "electronics" })), 3)}\n\n` +
          `بدك أحاول ببراند ثاني؟`
        );
      }
    }
  }

  // brand only (مثال: موجود اوبو؟)
  if (brand && !modelText) {
    const brandOnly = await searchElectronicsStrict({ brand, modelText: null, type: null, filters }, 6);

    if (brandOnly.length) {
      results = brandOnly;
    } else {
      const latest = await listLatestAds("electronics", 3);
      if (latest.length) {
        return send(
          `حالياً ما في "${brand}" بالموقع 😅\n` +
          `بس هاي آخر 3 إعلانات بالإلكترونيات 👇\n` +
          `${formatAds(latest.map(x => ({ ...x, _category: "electronics" })), 3)}\n\n` +
          `بدك أقترحلك براندات ثانية حسب ميزانيتك؟`
        );
      }
    }
  }
}



    // ✅ Gemini fallback فقط إذا ما في نتائج
    if (!results.length) {
      const msg = String(userMessage || "").trim();

      if (msg.length >= 6) {
        const normalized = await normalizeQuery(rawMessage);
        const normalized2 = normalized ? aliasNormalize(normalized) : null;

        if (normalized2) {
          results = await searchAdsSmart(
            {
              ...filters,
              category: effectiveCategory,
              userMessage,
              keywords: normalized2,
            },
            8
          );
        }
      }
    }

    // إذا ما في نتائج
    if (!results.length) {
      if (filters.priceMax != null) {
        return send(
          `تمام 👌 ميزانيتك لحد ${filters.priceMax} دينار.\n` +
          "بدك بأي مدينة؟"
        );
      }

      if (currentAd) {
        return send(
          `تمام 👌 هذا الإعلان اللي قدامك:\n${formatCurrentAd(currentAd)}\n\n` +
          "شو بتحب تعرف عنه؟"
        );
      }

      return send(
        "والله دورت بس ما طلع معي نتائج مطابقة هسا 😅\n" +
        "بدك تحكيلي مدينة/ميزانية/مواصفات؟"
      );
    }

    // ✅ إذا في نتائج
    return send(
      "تمام! لقيتلك هالإعلانات 👇\n" +
      `${formatAds(results, 8)}\n\n`
    );
  } catch (err) {
    console.error("CHAT ERROR:", err?.response?.data || err);
    res.status(500).json({ reply: "صار خطأ بالسيرفر… جرّب كمان مرة." });
  }
});

module.exports = router;
