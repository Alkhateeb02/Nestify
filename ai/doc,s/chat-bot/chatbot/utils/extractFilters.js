// utils/extractFilters.js

const ALLOWED_CATEGORIES = new Set([
  "apartments",
  "cars",
  "clothes",
  "electronics",
  "properties",
]);

const CATEGORY_KEYWORDS = [
  // cars
  { cat: "cars", keys: ["سيارة", "سيارات", "مركبة", "car", "cars", "toyota", "nissan", "honda", "mazda", "mitsubishi", "hyundai", "kia", "bmw", "mercedes", "tesla", "hybrid", "electric", "diesel", "petrol", "suv", "sedan", "pickup"] },

  // electronics
  { cat: "electronics", keys: [
    "الكترونيات", "إلكترونيات",
    "phone","mobile","iphone","samsung","apple","oppo","huawei","xiaomi","tecno","infinix","realme",
    "laptop","computer","desktop","tv","camera","drone","headphones","earbuds","console","playstation","xbox",
    "hp","dell","lenovo","acer","asus","msi","razer","surface","mac","gigabyte","lg","sony","canon","nikon","fujifilm","gopro","bose" ,"تلفون","تلفونات","موبايل","موبايلات","جوال","جوالات","هاتف","هواتف"

  ]},

  // apartments
  { cat: "apartments", keys: ["شقة","شقق","apartment","apartments","studio","chalet","villa","balcony","bathroom","kitchen","bedroom"] },

  // properties (lands / real estate)
  { cat: "properties", keys: [
    "عقار","عقارات","ارض","أرض","اراضي","أراضي","properties","property","land","plot",
    "residential_land","commercial_land","industrial_land","agricultural_land","empty_land","investment_land",
    "government_land","waqf_land","tourism_land","pasture_land","desert_land","barren_land",
    "villa","farm","palace"
  ]},

  // clothes
  { cat: "clothes", keys: [
    "ملابس","clothes",
    "tshirt","shirt","blouse","hoodie","sweatshirt","jacket","coat","vest","sweater",
    "jeans","trousers","shorts","skirt","leggings","joggers",
    "dress","suit","jumpsuit","tracksuit","abaya","kaftan",
    "handbag","backpack","sneakers","boots","heels","sandals",
    "black","white","red","blue","size_m","size_l","size_xl" // اختياري يساعد
  ]},
];


function detectCategory(text) {
  const t = (text || "").toLowerCase();
  for (const row of CATEGORY_KEYWORDS) {
    if (row.keys.some(k => t.includes(k.toLowerCase()))) return row.cat;
  }
  return null;
}

function parseNumber(str) {
  if (!str) return null;
  const cleaned = String(str).replace(/[,٫]/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

// من X ل Y / X-Y / تحت X / فوق X
function extractPriceRange(text) {
  const t = text || "";

  // 7000-9000
  let m = t.match(/(\d[\d,٫]*)\s*[-–]\s*(\d[\d,٫]*)/);
  if (m) return { min: parseNumber(m[1]), max: parseNumber(m[2]) };

  // من X ل Y / من X الى Y
  m = t.match(/من\s*(\d[\d,٫]*)\s*(ل|الى|إلى)\s*(\d[\d,٫]*)/);
  if (m) return { min: parseNumber(m[1]), max: parseNumber(m[3]) };

  // تحت X / أقل من X
  m = t.match(/(تحت|اقل من|أقل من)\s*(\d[\d,٫]*)/);
  if (m) return { min: null, max: parseNumber(m[2]) };

  // فوق X / أكثر من X
  m = t.match(/(فوق|اكثر من|أكثر من)\s*(\d[\d,٫]*)/);
  if (m) return { min: parseNumber(m[2]), max: null };

  // ✅ رقم لحاله أو "ميزانيتي 10000" -> نخليه MAX
  m = t.match(/(ميزاني(ه|تي)|budget)?\s*(\d[\d,٫]*)\s*(دينار|jd|jod)?/i);
  if (m) {
    const n = parseNumber(m[3] || m[2]); // حسب المجموعات
    // إذا النص كله تقريبًا رقم
    const justNumber = String(t).trim().match(/^(\d[\d,٫]*)$/);
    if (justNumber) return { min: null, max: parseNumber(justNumber[1]) };

    // إذا فيه كلمة ميزانية أو دينار أو رقم واضح
    if (n != null && /(ميزاني|دينار|jd|jod)/i.test(t)) return { min: null, max: n };
  }

  return { min: null, max: null };
}

function detectListingType(text) {
  const t = (text || "").toLowerCase();
  if (/(ايجار|إيجار|للإيجار|للايجار|rent)/.test(t)) return "rent";
  if (/(بيع|للبيع|for sale|sale)/.test(t)) return "sale";
  return null;
}

function extractLocationHint(text) {
  const t = (text || "").trim();
  if (!t) return null;

  const m = t.match(/(قريب من|جنب|بالقرب من)\s+(.+)/);
  if (m) return m[2].trim();

  return null;
}

function detectCheapIntent(text) {
  const t = (text || "").toLowerCase();
  return /(رخيص|رخيصة|اقل سعر|أقل سعر|اقتصادي)/.test(t);
}

// ✅ نية “اعرضلي الموجود” (list all)
function detectListAllIntent(text) {
  const t = (text || "").toLowerCase();
  return /(شو موجود|شو فيه|اعرض|وريني|كل|الموجود|العروض|شو عندكم)/.test(t);
}

function extractFilters(message, pageCategory = null) {
  const text = message || "";

  const categoryFromText = detectCategory(text);
  const category =
    (categoryFromText && ALLOWED_CATEGORIES.has(categoryFromText) && categoryFromText) ||
    (pageCategory && ALLOWED_CATEGORIES.has(pageCategory) && pageCategory) ||
    null;

  const { min, max } = extractPriceRange(text);
  const listingType = detectListingType(text);
  const locationHint = extractLocationHint(text);
  const cheap = detectCheapIntent(text);
  const listAll = detectListAllIntent(text);

  // كلمات مفتاحية: نشيل أشياء عامة
  const keywords = text
    .replace(/\d[\d,٫]*/g, " ")
    .replace(/من|الى|إلى|ل|تحت|فوق|اقل من|أقل من|اكثر من|أكثر من|ايجار|إيجار|للبيع|للإيجار|رخيص|رخيصة|ميزانية|دينار/g, " ")
    .trim();

  return {
    category,
    priceMin: min,
    priceMax: max,
    listingType,
    locationHint,
    cheap,
    listAll,
    keywords,
  };
}

module.exports = { extractFilters };
