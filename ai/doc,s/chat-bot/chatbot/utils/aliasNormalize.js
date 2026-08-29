// utils/aliasNormalize.js

// ✅ Aliases dictionary (canonical -> variants)
const ALIASES = {
  // =========================
  // Electronics - Brands
  // =========================
  samsung: ["سامسونج", "سامسنوج", "سامسونغ", "samsung", "samsong", "samssung"],
  apple: ["ابل", "آبل", "apple"],
  iphone: ["ايفون", "آيفون", "iphone", "i phone", "اي فون", "اي-فون"],
  oppo: ["اوبو", "oppo"],
  huawei: ["هواوي", "huawei", "huwaei"],
  xiaomi: ["شاومي", "شياومي", "xiaomi", "xiomi"],
  tecno: ["تكنو", "tecno"],
  infinix: ["انفينيكس", "infinix"],
  realme: ["ريلمي", "realme", "real me", "ريل مي"],

  // Computing - Brands
  hp: ["hp", "إتش بي", "اتش بي", "اتشبي", "hewlett packard", "هيوليت باكارد"],
  dell: ["dell", "ديل", "دل"],
  lenovo: ["lenovo", "لينوفو"],
  acer: ["acer", "إيسر", "ايسر", "ايسير"],
  asus: ["asus", "أسوس", "اسوس", "ازوس"],
  msi: ["msi", "إم إس آي", "ام اس اي", "ام اساي"],
  razer: ["razer", "رايزر", "ريزر"],
  surface: ["surface", "microsoft surface", "مايكروسوفت سيرفس", "سيرفس", "سيرفيس"],
  mac: ["mac", "macbook", "apple mac", "أبل ماك", "ابل ماك", "ماك", "ماك بوك", "ماكبوك"],
  gigabyte: ["gigabyte", "جيجابايت", "غيغابايت", "قيقابايت"],

  // TVs & Home Theater - Brands
  lg: ["lg", "إل جي", "ال جي", "الجى", "لجي"],
  sony: ["sony", "سوني"],
  // Cameras & Drones - Brands
  canon: ["canon", "كانون"],
  nikon: ["nikon", "نيكون"],
  fujifilm: ["fujifilm", "fuji", "فوجي", "فوجي فيلم", "فوجيفيلم"],
  sony_alpha: ["sony alpha", "سوني الفا", "سوني ألفا"],
  gopro: ["gopro", "go pro", "جو برو", "غو برو"],

  // Gaming Consoles
  playstation: ["playstation", "ps", "ps4", "ps5", "بلايستيشن", "بلاي ستيشن", "بلاي"],
  xbox: ["xbox", "x box", "اكس بوكس", "إكس بوكس", "xbox one", "xbox series"],

  // Audio
  bose: ["bose", "بوز", "بوس"],

  // Electronics - Device Types
  phone: [
  "تلفون","تليفون","جوال","موبايل","هاتف",
  // ✅ جمع
  "تلفونات","تليفونات","جوالات","موبايلات","هواتف",
  // ✅ مع (الـ)
  "التلفون","التليفون","الجوال","الموبايل","الهاتف",
  "التلفونات","التليفونات","الجوالات","الموبايلات","الهواتف",
  // إنجليزي
  "phone","mobile","cell"
],

  laptop: ["لابتوب", "لاب توب", "حاسوب", "كمبيوتر محمول", "laptop", "notebook"],
  computer: ["كمبيوتر", "حاسوب", "computer", "pc", "بي سي", "حاسب"],
  desktop: ["desktop", "كمبيوتر مكتبي", "مكتبي"],
  tv: ["tv", "تلفزيون", "شاشة", "سمارت تي في", "smart tv", "smarttv"],
  home_theater: ["home theater", "هوم ثياتر", "مسرح منزلي", "ساوند سيستم", "sound system"],
  camera: ["camera", "كاميرا", "كميرا"],
  drone: ["drone", "درون", "طائرة درون", "طيره درون"],
  headphones: ["headphones", "سماعات", "سماعه", "هيدفون", "هيدفونز"],
  earbuds: ["earbuds", "ايربودز", "إيربودز", "سماعات اذن", "سماعات أذن"],
  console: ["console", "كونسول", "جهاز العاب", "جهاز ألعاب", "منصة العاب", "منصة ألعاب"],

  // =========================
  // Cars - Brands
  // =========================
  toyota: ["تويوتا", "toyota"],
  nissan: ["نيسان", "نيسون", "nissan"],
  honda: ["هوندا", "honda"],
  mazda: ["مازدا", "mazda"],
  mitsubishi: ["ميتسوبيشي", "mitsubishi"],
  hyundai: ["هيونداي", "hyundai"],
  kia: ["كيا", "kia"],
  mercedes: ["مرسيدس", "مرسيدس بنز", "mercedes", "mercedes benz"],
  bmw: ["بي ام دبليو", "بي إم دبليو", "bmw"],
  tesla: ["تيسلا", "tesla","تسلا"],

  // Toyota Models
  corolla: ["كورولا", "corola", "corolla"],
  camry: ["كامري", "camry"],
  land_cruiser: ["لاند كروزر", "لاندكروزر", "land cruiser"],
  hilux: ["هايلكس", "هيلكس", "hilux"],
  rav4: ["راف 4", "راف4", "rav4"],
  yaris: ["يارس", "yaris"],

  // Nissan Models
  sunny: ["صني", "sunny"],
  altima: ["التيما", "ألتيما", "altima"],
  patrol: ["باترول", "patrol"],
  maxima: ["ماكسيما", "maxima"],
  xtrail: ["اكس تريل", "إكس تريل", "xtrail", "x-trail"],
  kicks: ["كيكس", "kicks"],

  // Honda Models
  civic: ["سيفيك", "civic"],
  accord: ["اكورد", "أكورد", "accord"],
  crv: ["crv", "cr-v", "سي ار في", "سي ار-في"],
  pilot: ["بايلوت", "pilot"],
  city: ["سيتي", "city"],

  // Mazda Models
  mazda3: ["مازدا 3", "mazda 3"],
  mazda6: ["مازدا 6", "mazda 6"],
  cx5: ["cx5", "cx-5"],
  cx9: ["cx9", "cx-9"],

  // Mitsubishi Models
  lancer: ["لانسر", "lancer"],
  pajero: ["باجيرو", "pajero"],
  outlander: ["اوتلاندر", "أوتلاندر", "outlander"],
  l200: ["l200", "ال200"],
  xpander: ["اكسباندر", "إكسباندر", "xpander"],

  // Hyundai Models
  accent: ["اكسنت", "أكسنت", "accent"],
  elantra: ["النترا", "إلنترا", "elantra"],
  sonata: ["سوناتا", "sonata"],
  tucson: ["توسان", "tucson"],
  santafe: ["سانتا في", "santa fe", "santafe"],
  kona: ["كونا", "kona"],

  // Kia Models
  picanto: ["بيكانتو", "picanto"],
  rio: ["ريو", "rio"],
  cerato: ["سيراتو", "cerato", "k3"],
  sportage: ["سبورتاج", "sportage"],
  sorento: ["سورينتو", "sorento"],
  telluride: ["تلورايد", "telluride"],
  sephia: ["سيفيا", "sephia"],

  // Mercedes Models
  c_class: ["c class", "c-class", "سي كلاس", "سي-كلاس"],
  e_class: ["e class", "e-class", "اي كلاس", "اي-كلاس"],
  s_class: ["s class", "s-class", "اس كلاس", "اس-كلاس"],
  g_class: ["g class", "g-class", "جي كلاس", "جي-كلاس"],
  gle: ["gle", "جي ال اي", "جي-ال-اي"],

  // BMW Models
  bmw_3: ["الفئة الثالثة", "3 series", "bmw 3"],
  bmw_5: ["الفئة الخامسة", "5 series", "bmw 5"],
  bmw_7: ["الفئة السابعة", "7 series", "bmw 7"],
  x5: ["x5"],
  x6: ["x6"],

  // Tesla Models
  model_s: ["model s"],
  model_3: ["model 3"],
  model_x: ["model x"],
  model_y: ["model y"],
  cybertruck: ["cybertruck", "سايبرترك"],
  roadster: ["roadster"],
  tesla_semi: ["tesla semi", "سيمي"],

  // Fuel / Power Types
  petrol: ["بنزين", "gas", "petrol"],
  diesel: ["ديزل", "diesel"],
  hybrid: ["هايبرد", "hybrid"],
  electric: ["كهربا", "كهرباء", "electric", "ev"],
  plugin_hybrid: ["plug in hybrid", "هايبرد قابل للشحن"],

  // Vehicle Types
  sedan: ["سيدان", "sedan"],
  suv: ["suv", "دفع رباعي"],
  pickup: ["بيك اب", "pickup"],
  hatchback: ["هاتشباك", "hatchback"],
  coupe: ["كوبيه", "coupe"],

  // =========================
  // Real Estate - Property Types
  // =========================
  apartment: ["شقة", "شقه", "شقق", "apartment", "apartments"],
  villa: ["فيلا", "villa"],
  palace: ["قصر", "قصور", "palace"],
  studio: ["ستوديو", "ستديو", "استوديو", "studio"],
  chalet: ["شاليه", "شاليهات", "chalet"],
  farm: ["مزرعه", "مزرعة", "farm"],
  land: ["ارض", "أرض", "اراضي", "أراضي", "land", "plot"],

  // Rooms / Spaces
  living_room: ["صالة", "غرفة معيشة", "صالون", "living room"],
  bedroom: ["غرفة نوم", "غرف نوم", "bedroom"],
  kitchen: ["مطبخ", "kitchen"],
  bathroom: ["حمام", "حمامات", "bathroom"],
  dining_room: ["سفرة", "غرفة طعام", "dining room"],
  entrance: ["بهو", "مدخل", "entrance"],
  hallway: ["ممر", "موزع", "hallway"],
  balcony: ["شرفة", "بلكونة", "بلكون", "balcony"],
  laundry: ["غرفة غسيل", "laundry"],
  storage: ["مخزن", "مستودع", "storage", "store room"],
  office_room: ["غرفة مكتب", "مكتب", "office"],
  stairs: ["سلالم", "درج", "stairs"],

  // Outdoor / Extras
  garden: ["حديقه", "حديقة", "garden"],
  pool: ["مسبح", "pool"],
  garage: ["كراج", "جراج", "garage"],

  // Fixtures / Finishes
  doors: ["ابواب", "أبواب", "باب", "doors"],
  windows: ["نوافذ", "شباك", "شبابيك", "windows"],
  floors: ["ارضيات", "أرضيات", "flooring", "floors"],
  walls: ["جدران", "حائط", "حوائط", "walls"],
  ceilings: ["اسقف", "أسقف", "سقف", "ceilings"],
  built_in_closets: ["خزائن حائط", "خزائن", "دواليب", "closet", "closets"],

  // Systems
  electrical: ["تمديدات كهربائية", "كهرباء", "electrical", "wiring"],
  plumbing: ["تمديدات صحية", "سباكة", "plumbing"],
  hvac: ["تدفئة", "تكييف", "نظام تدفئة", "نظام تكييف", "تدفئة وتكييف", "ac", "hvac"],

  // Quality / Lighting
  lighting: ["اضاءه", "إضاءة", "إنارة", "lighting"],
  deluxe: ["ديلوكس", "deluxe", "فاخر", "فخم"],

  // =========================
  // Land - Types / Zoning
  // =========================
  residential_land: ["اراضي سكنية", "ارض سكنية", "سكني", "residential land", "residential plot"],
  commercial_land: ["اراضي تجارية", "ارض تجارية", "تجاري", "commercial land", "commercial plot"],
  industrial_land: ["اراضي صناعية", "ارض صناعية", "صناعي", "industrial land", "industrial plot"],
  agricultural_land: ["اراضي زراعية", "ارض زراعية", "زراعي", "agricultural land", "farm land"],
  empty_land: ["اراضي فضاء", "ارض فضاء", "ارض بيضاء", "ارض خالية", "empty land", "vacant land"],
  investment_land: ["اراضي استثمارية", "ارض استثمارية", "استثماري", "investment land"],
  government_land: ["اراضي حكومية", "ارض حكومية", "حكومي", "government land"],
  waqf_land: ["اراضي وقف", "ارض وقف", "وقف", "waqf land"],
  tourism_land: ["اراضي سياحية", "ارض سياحية", "سياحي", "tourism land"],
  pasture_land: ["اراضي رعوية", "ارض رعوية", "رعوي", "pasture land", "grazing land"],
  desert_land: ["اراضي صحراوية", "ارض صحراوية", "صحراوي", "desert land"],
  barren_land: ["اراضي بور", "ارض بور", "غير صالحة للزراعة", "barren land", "wasteland"],

  // =========================
  // Clothing - Upper Wear
  // =========================
  tshirt: ["تيشيرت", "تي شيرت", "t-shirt", "tshirt"],
  shirt: ["قميص", "shirt"],
  blouse: ["بلوزة", "بلوزه", "blouse"],
  hoodie: ["هودي", "hoody", "hoodie"],
  sweatshirt: ["سويتشيرت", "sweatshirt"],
  jacket: ["جاكيت", "jacket"],
  coat: ["معطف", "coat"],
  vest: ["سترة", "فيست", "vest"],
  sweater: ["كنزة", "كنزة صوفية", "sweater"],

  // Lower Wear
  jeans: ["جينز", "بنطلون جينز", "jeans"],
  trousers: ["بنطلون قماش", "بنطلون", "trousers", "pants"],
  shorts: ["شورت", "shorts"],
  skirt: ["تنورة", "skirt"],
  leggings: ["ليجن", "ليغنز", "leggings"],
  joggers: ["بنطلون رياضي", "joggers", "sweatpants"],

  // Full Outfits
  dress: ["فستان", "dress"],
  suit: ["بدلة", "بدلة رسمية", "suit"],
  jumpsuit: ["جمبسوت", "jumpsuit"],
  tracksuit: ["طقم رياضي", "تركسوت", "tracksuit"],
  abaya: ["عباية", "عباءة", "abaya"],
  kaftan: ["قفطان", "kaftan"],

  // Sleep & Home
  pyjamas: ["بيجامة", "بيجاما", "pyjamas", "pajamas"],
  bathrobe: ["روب حمام", "روب حماّم", "bathrobe"],
  nightgown: ["قميص نوم", "nightgown"],

  // Swim & Sports
  swimsuit: ["مايوه", "swimsuit"],
  robe: ["برنس", "robe"],
  diving_wear: ["ملابس غطس", "diving suit", "wet suit"],

  // Accessories
  scarf: ["وشاح", "شال", "scarf"],
  hat: ["قبعة", "hat", "كاب"],
  gloves: ["قفازات", "gloves"],
  socks: ["جوارب", "شرابات", "socks"],
  belt: ["حزام", "belt"],
  tie: ["ربطة عنق", "كرافات", "tie"],

  // Underwear
  undershirt: ["قميص داخلي", "undershirt"],
  under_shorts: ["شورت داخلي", "underwear shorts", "boxers"],

  // Bags
  handbag: ["حقيبة يد", "handbag", "purse"],
  backpack: ["حقيبة ظهر", "backpack"],
  shoulder_bag: ["حقيبة كتف", "shoulder bag"],
  crossbody_bag: ["حقيبة كروس", "crossbody bag"],
  suitcase: ["حقيبة سفر", "شنطة سفر", "suitcase"],
  waist_bag: ["حقيبة خصر", "fanny pack", "waist bag"],
  laptop_bag: ["حقيبة لاب توب", "laptop bag"],
  clutch: ["كلتش", "حقيبة سهره", "clutch"],
  tote_bag: ["حقيبة تسوق", "tote bag"],
  duffel_bag: ["حقيبة رياضية", "duffel bag"],
  makeup_bag: ["حقيبة مكياج", "حقيبة مستحضرات تجميل", "makeup bag"],
  wallet: ["محفظة", "محفظة جيب", "wallet"],

  // Shoes
  sneakers: ["حذاء رياضي", "سنيكرز", "sneakers"],
  formal_shoes: ["حذاء رسمي", "classic shoes", "formal shoes"],
  heels: ["كعب عالي", "heels"],
  flats: ["حذاء مسطح", "flats", "ballerinas"],
  boots: ["بوت", "boots"],
  ankle_boots: ["نص بوت", "ankle boots"],
  sandals: ["صندل", "sandals"],
  slippers: ["شبشب", "نعال", "slippers", "flip flops"],
  loafers: ["لوفر", "loafers"],
  moccasins: ["موكاسان", "moccasins"],
  safety_boots: ["حذاء سيفتي", "safety boots"],
  casual_shoes: ["حذاء كاجوال", "casual shoes"],

  // =========================
  // Jordan - Governorates & Cities
  // =========================
  amman: ["عمان", "عمّان", "amman"],

  irbid: ["اربد", "إربد", "irbid"],
  ramtha: ["الرمثا", "ramtha"],
  husn: ["الحصن", "husn"],

  zarqa: ["الزرقاء", "زرقاء", "zarqa"],
  ruseifa: ["الرصيفة", "ruseifa"],

  salt: ["السلط", "salt"],
  madaba: ["مادبا", "madaba"],
  karak: ["الكرك", "karak"],
  tafileh: ["الطفيلة", "tafileh"],
  maan: ["معان", "ma'an", "maan"],
  aqaba: ["العقبة", "عقبه", "aqaba"],
  mafraq: ["المفرق", "mafraq"],
  jerash: ["جرش", "jerash"],
  ajloun: ["عجلون", "ajloun"],

  dead_sea: ["البحر الميت", "dead sea"],
  petra: ["البتراء", "petra"],
  // ✅ Amman suburbs (quick)
  west_amman: ["عبدون","خلدا","شميساني","صويلح","تلاع العلي","الجبيهة","دابوق","الرابيه","الرابية","ام اذينه","أم أذينة","ام اذينه","ام اذينة","دير غبار","ديرغبار","ضاحية الرشيد","ضاحيه الرشيد"],
  east_amman: ["ماركا","ماركه","طبربور","النصر","الاشرفية","الأشرفية","الهاشمي","الهاشمي الشمالي","الهاشمي الجنوبي","القويسمة","القويسمه","الجويدة","الجويْدة","ابو علندا","أبو علندا","الزهراء","ضاحية الياسمين","راس العين","رأس العين","وسط البلد","جبل الحسين","طريق المطار","ابو علندة","ابو علنده"],


  // =========================
  // Colors
  // =========================
  black: ["اسود", "أسود", "black"],
  white: ["ابيض", "أبيض", "white"],
  gray: ["رمادي", "رصاصي", "gray", "grey"],
  silver: ["فضي", "silver"],
  gold: ["ذهبي", "gold"],
  red: ["احمر", "أحمر", "red"],
  blue: ["ازرق", "أزرق", "blue"],
  green: ["اخضر", "أخضر", "green"],
  yellow: ["اصفر", "أصفر", "yellow"],
  orange: ["برتقالي", "orange"],
  brown: ["بني", "brown"],
  beige: ["بيج", "beige"],
  pink: ["زهري", "وردي", "pink"],
  purple: ["بنفسجي", "purple"],
  navy: ["كحلي", "navy"],

  // =========================
  // Sizes - Clothing (IMPORTANT: replace single-letter sizes to size_* so tokens pass length>=2)
  // =========================
  size_xs: ["xs", "اكس اس", "صغير جدا"],
  size_s: ["s", "سمول", "صغير"],
  size_m: ["m", "ميديوم", "وسط"],
  size_l: ["l", "لارج", "كبير"],
  size_xl: ["xl", "اكس لارج", "كبير جدا"],
  size_xxl: ["xxl", "دبل اكس لارج"],

  // Sizes - Shoes (numbers)
  size_36: ["36"],
  size_37: ["37"],
  size_38: ["38"],
  size_39: ["39"],
  size_40: ["40"],
  size_41: ["41"],
  size_42: ["42"],
  size_43: ["43"],
  size_44: ["44"],
  size_45: ["45"],
};

// =========================
// Normalizer
// =========================
function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Arabic light normalization
function normalizeArabicChars(t) {
  return String(t)
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ّ/g, "");
}

// Build a flat list of (variant -> canonical), sorted by variant length desc (important!)
let REPLACERS = null;

function buildReplacers() {
  const items = [];
  for (const [canonical, variants] of Object.entries(ALIASES)) {
    for (const v of variants) {
      const vv = normalizeArabicChars(String(v).toLowerCase()).trim();
      if (!vv) continue;

      // الأساسي
      items.push({ vv, canonical });

      // ✅ دعم "بعمان/بالزرقاء" إلخ
      if (/[\u0600-\u06FF]/.test(vv)) {
        items.push({ vv: "ب" + vv, canonical });
        items.push({ vv: "بال" + vv, canonical });
      }
    }
  }

  // longer first to avoid partial replace (e.g. "model 3" before "model")
  items.sort((a, b) => b.vv.length - a.vv.length);
  return items;
}

function aliasNormalize(text) {
  let t = String(text || "").toLowerCase();
  t = normalizeArabicChars(t);

  if (!REPLACERS) REPLACERS = buildReplacers();

  for (const { vv, canonical } of REPLACERS) {
    const pattern = new RegExp(`(^|\\s)${escapeRegExp(vv)}(?=\\s|$)`, "g");
    t = t.replace(pattern, `$1${canonical}`);
  }

  t = t.replace(/\s+/g, " ").trim();
  return t;
}

module.exports = { aliasNormalize, ALIASES };
