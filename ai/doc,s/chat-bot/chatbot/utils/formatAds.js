function normalizeListingType(value) {
  const v = String(value || "").toLowerCase();
  if (v.includes("sale")) return "للبيع";
  if (v.includes("rent")) return "للإيجار";
  return "";
}

function pickImage(ad) {
  if (ad?.image) return ad.image;
  if (Array.isArray(ad?.images) && ad.images.length) return ad.images[0];
  return null;
}

// ✅ رابط تفاصيل الإعلان (عدّلي details.html إذا اسمها مختلف)
function buildDetailsLink(ad) {
  const cat = ad?.category || ad?._category || "";
  const id = ad?._id ? String(ad._id) : "";
  if (!cat || !id) return "";
  return `/Page2/details.html?cat=${encodeURIComponent(cat)}&id=${encodeURIComponent(id)}`;
}

// ✅ اختصار ID (اختياري)
function shortId(id) {
  const s = String(id || "");
  if (s.length <= 6) return s;
  return s.slice(-6);
}

function formatOne(ad, opts = {}) {
  const { showImage = true, showId = false, showLink = true } = opts;

  if (!ad) return "ما في إعلان حالي.";

  const title = ad.title || "بدون عنوان";
  const price = ad.price != null ? `${ad.price} دينار` : "السعر غير مذكور";
  const location = ad.location ? `📍 ${ad.location}` : "";
  const listing = normalizeListingType(ad.listingType);
  const cat = ad.category || ad._category || "";
  const id = ad._id ? String(ad._id) : "";
  const img = pickImage(ad);
  const link = buildDetailsLink(ad);

  // ✅ سطر أنظف (موظف)
  let line = `- [${cat}] ${title} — ${price}${listing ? ` (${listing})` : ""} ${location}`.trim();

  // ✅ رابط
  if (showLink && link) {
    line += `\n  🔗 افتح الإعلان: ${link}`;
  }

  // ✅ ID (مختصر) لو بدك
  if (showId && id) {
    line += `\n  🆔 ${shortId(id)}`;
  }


  return line;
}

function formatCurrentAd(ad) {
  if (!ad) return "ما في إعلان محدد.";
  // ✅ خليها false إذا ما بدك سطر الصورة حتى بالإعلان الحالي
  return formatOne(ad, { showImage: false, showId: false, showLink: true });
}

function formatAds(ads = [], limit = 8) {
  if (!ads.length) return "ما في نتائج مطابقة حالياً.";
  return ads
    .slice(0, limit)
    // ✅ أهم تعديل: شيلنا الصورة من القوائم
    .map((a) => formatOne(a, { showImage: false, showId: false, showLink: true }))
    .join("\n");
}


module.exports = {
  formatAds,
  formatCurrentAd
};
