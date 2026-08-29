import re
import math
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from bson import ObjectId

# Assuming these utilities will be available with python-friendly naming conventions
from ..utils.aliasNormalize import aliasNormalize as alias_normalize, ALIASES
from ..utils.normalizeQuery import normalizeQuery as normalize_query
from ..utils.extractFilters import extractFilters as extract_filters
from ..utils.polishReply import polishReply as polish_reply
from ..utils.formatAds import formatAds as format_ads, formatCurrentAd as format_current_ad

# Note: You will need a reference to your async MongoDB database instance here
# For example, if you are using Motor:
from motor.motor_asyncio import AsyncIOMotorDatabase
# from ..config import get_database # Replace with actual connection import

router = APIRouter()

ALLOWED_CATEGORIES = {
    "apartments",
    "cars",
    "clothes",
    "electronics",
    "properties",
}

CATEGORY_AR = {
    "cars": "السيارات",
    "apartments": "الشقق",
    "clothes": "الملابس",
    "electronics": "الإلكترونيات",
    "properties": "العقارات/الأراضي",
}

def safe_category(cat: str) -> Optional[str]:
    c = str(cat or "").lower()
    return c if c in ALLOWED_CATEGORIES else None

def escape_regex(string: str) -> str:
    # re.escape does this nicely in python
    return re.escape(str(string))

AD_PROJECTION = {
    "title": 1,
    "price": 1,
    "location": 1,
    "listingType": 1,
    "category": 1,
    "image": 1,
    "images": 1,
    "type": 1,
    "brand": 1,
    "model": 1,
    "color": 1,
    "size": 1,
    "condition": 1,
    "createdAt": 1,
}

async def get_ad_by_id(db: AsyncIOMotorDatabase, category: str, id_str: str) -> Optional[Dict[str, Any]]:
    cat = safe_category(category)
    if not cat: return None
    if not ObjectId.is_valid(id_str): return None

    col = db[cat]
    return await col.find_one(
        {"_id": ObjectId(id_str)},
        projection=AD_PROJECTION
    )

async def list_latest_ads(db: AsyncIOMotorDatabase, category: str, limit: int = 3) -> List[Dict[str, Any]]:
    cat = safe_category(category)
    if not cat: return []
    col = db[cat]

    cursor = col.find({}, projection=AD_PROJECTION).sort("createdAt", -1).limit(limit)
    return await cursor.to_list(length=limit)

STOP_WORDS = {
  # Arabic
  "بدي","بدور","ببحث","موجود","بالموقع","شو","في","فيه","كم","اسعار","سعر",
  "من","الى","إلى","لحد","ل","على","قريب","قريبة",
  "للبيع","للإيجار","ايجار","إيجار","جديد","مستعمل" ," سيارة","سياره"," سيارات",

  # English
  "is","are","the","a","an","in","on","for","with","and","or",
}

def tokenize_text(text: str, max_tokens: int = 6) -> List[str]:
    t = str(text or "").lower()
    t = re.sub(r'[^\w\u0600-\u06FF\s]', ' ', t)
    tokens = [w for w in re.split(r'\s+', t) if w]
    tokens = [w for w in tokens if len(w) >= 2 and w not in STOP_WORDS]
    return tokens[:max_tokens]

async def search_ads_smart(db: AsyncIOMotorDatabase, params: Dict[str, Any], limit: int = 8) -> List[Dict[str, Any]]:
    category = params.get("category")
    user_message = params.get("userMessage")
    price_min = params.get("priceMin")
    price_max = params.get("priceMax")
    listing_type = params.get("listingType")
    location_hint = params.get("locationHint")
    keywords = params.get("keywords")
    cheap = params.get("cheap")

    cats = [safe_category(category)] if category else list(ALLOWED_CATEGORIES)
    cats = [c for c in cats if c]

    raw = str(keywords).strip() if (keywords and str(keywords).strip()) else str(user_message or "")
    tokens = tokenize_text(raw, 6)

    GENERIC_TOKENS = {
      "car","cars",
      "phone","mobile",
      "laptop","computer","desktop",
      "tv","camera","drone",
      "apartment","apartments",
      "clothes","electronics",
      "property","properties","land",
    }

    strong_tokens = [t for t in tokens if t not in GENERIC_TOKENS]
    final_tokens = strong_tokens if strong_tokens else tokens

    has_structured = (price_min is not None) or (price_max is not None) or bool(listing_type)
    if not tokens and not location_hint and not has_structured:
        return []

    or_parts = []
    
    for tok in final_tokens:
        pattern = escape_regex(tok)
        
        # Pulling aliases dynamically
        aliases_list = getattr(ALIASES, tok, None) if type(ALIASES) is not dict else ALIASES.get(tok, None)

        if aliases_list:
            vs = [escape_regex(v) for v in aliases_list if v]
            pattern = f"(?:{'|'.join([escape_regex(tok)] + vs)})"

        regex = re.compile(pattern, re.IGNORECASE)
        
        or_parts.extend([
            {"title": regex},
            {"description": regex},
            {"location": regex},
            {"type": regex},
            {"brand": regex},
            {"model": regex},
            {"color": regex},
            {"size": regex},
            {"condition": regex},
            {"listingType": regex}
        ])

    if location_hint:
        regex_loc = re.compile(escape_regex(location_hint), re.IGNORECASE)
        or_parts.extend([
            {"location": regex_loc},
            {"description": regex_loc},
            {"title": regex_loc}
        ])

    filter_query = {}
    if or_parts:
        filter_query["$or"] = or_parts

    if price_min is not None or price_max is not None:
        filter_query["price"] = {}
        if price_min is not None: filter_query["price"]["$gte"] = price_min
        if price_max is not None: filter_query["price"]["$lte"] = price_max

    if listing_type:
        filter_query["listingType"] = re.compile(listing_type, re.IGNORECASE)

    all_docs = []
    for cat in cats:
        col = db[cat]
        cursor = col.find(filter_query, projection=AD_PROJECTION).limit(limit)
        docs = await cursor.to_list(length=limit)
        for d in docs:
            d["_category"] = cat
            all_docs.append(d)

    if cheap:
        all_docs.sort(key=lambda x: float(x.get("price", 1e18)))
    
    return all_docs[:limit]


def is_browse_intent_only(text: str) -> bool:
    t = str(text or "").lower().strip()
    return (
        bool(re.search(r"(بدور|ببحث|بدي اشوف|بدي أشوف|موجود|وريني|اعرضلي|اعرض لي)\s*(على)?\s*", t)) and
        not bool(re.search(r"(\d[\d,٫]*|دينار|jd|jod|تيسلا|tesla|سامسونج|samsung|ايفون|iphone|احمر|أحمر|اسود|أبيض|معان|عمان|الزرقاء|اربد|عقبة|ايجار|إيجار|للبيع|للإيجار)", t)) and
        len(t) <= 25
    )


def is_how_are_you(text: str) -> bool:
    t = str(text or "").lower().strip()
    return bool(re.match(r"^(كيفك|كيف حالك|شلونك|شو اخبارك|شو الأخبار|اخبارك|كيف الامور|كيف الأمور)\??$", t))

def is_thanks(text: str) -> bool:
    t = str(text or "").lower().strip()
    return bool(re.match(r"^(شكرا|شكرًا|يسلمو|يسلموا|مشكور|يعطيك العافيه|يعطيك العافية|thx|thanks)\s*!*$", t))

def is_about_site(text: str) -> bool:
    t = str(text or "").lower().strip()
    return bool(re.search(r"(شو هاد الموقع|شو هذا الموقع|شو موقعكم|شو بتعملو|كيف بشتري|كيف اشتري|كيف ببيع|كيف ابيع|كيف بضيف اعلان|كيف اضيف اعلان|كيف بتواصل|كيف التواصل)", t))

def is_category_only_browse(text: str, effective_category: Optional[str]) -> bool:
    if not effective_category: return False
    t = str(text or "").lower().strip()

    has_specs = bool(re.search(r"(\d[\d,٫]*|jd|jod|دينار|amman|عمان|irbid|اربد|zarqa|الزرقاء|aqaba|العقبة|tesla|تيسلا|samsung|سامسونج|iphone|ايفون|احمر|أحمر|اسود|أسود|ابيض|أبيض|للبيع|للإيجار|ايجار|إيجار)", t))
    if has_specs: return False

    return (
        bool(re.match(r"^(في|موجود|موجوده|موجودة|عندك|عندكم|شو فيه|شو في|اعرض|وريني|بدور|بدي)\b", t)) or
        len(t) <= 12
    )

def normalize_lite(s: str) -> str:
    return str(s or "").lower().strip()

CAR_BRANDS = [
  "كيا","هيونداي","تويوتا","نيسان","هوندا","مرسيدس","bmw","بي ام دبليو","اودي","فورد","شيفروليه","ميتسوبيشي","سوزوكي","مازدا","mg","جيلي","chery","شيري","رينو","renault","volkswagen","فولكسفاغن"
]

ELEC_BRANDS = [
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
]

ELEC_TYPES = [
  "mobile","موبايل","تلفون","هاتف","phone",
  "laptop","لاب توب","لابتوب","notebook",
  "tablet","تابلت","ipad","ايباد",
  "tv","تلفزيون",
  "camera","كاميرا",
]

def find_first_match(tokens: List[str], lst: List[str]) -> Optional[str]:
    valid_set = {normalize_lite(item) for item in lst}
    for t in tokens:
        if normalize_lite(t) in valid_set:
            return t
    return None

def split_tokens(text: str) -> List[str]:
    return tokenize_text(text, 8)

def parse_car_query(raw_message: str) -> Dict[str, Optional[str]]:
    tokens = split_tokens(raw_message)
    brand = find_first_match(tokens, CAR_BRANDS)
    if not brand: return {"brand": None, "model": None}

    normalized_brand = normalize_lite(brand)
    try:
        idx = next(i for i, t in enumerate(tokens) if normalize_lite(t) == normalized_brand)
        after = tokens[idx + 1:]
        model = " ".join(after[:2]) if after else None
    except StopIteration:
        model = None

    return {"brand": brand, "model": model}

def parse_electronics_query(raw_message: str) -> Dict[str, Optional[str]]:
    tokens = split_tokens(raw_message)
    brand = find_first_match(tokens, ELEC_BRANDS)
    type_val = find_first_match(tokens, ELEC_TYPES)

    model_text = None

    if brand:
        normalized_brand = normalize_lite(brand)
        try:
            idx = next(i for i, t in enumerate(tokens) if normalize_lite(t) == normalized_brand)
            after = tokens[idx + 1:]
            if after: model_text = " ".join(after)
        except StopIteration:
            pass
    elif type_val:
        normalized_type = normalize_lite(type_val)
        try:
            idx = next(i for i, t in enumerate(tokens) if normalize_lite(t) == normalized_type)
            after = tokens[idx + 1:]
            if after: model_text = " ".join(after)
        except StopIteration:
            pass

    return {"brand": brand, "type": type_val, "modelText": model_text}


async def search_cars_strict(db: AsyncIOMotorDatabase, brand: Optional[str], model: Optional[str], filters: Dict[str, Any], limit: int = 6) -> List[Dict[str, Any]]:
    col = db["cars"]
    and_parts = []

    if brand: and_parts.append({"brand": re.compile(escape_regex(brand), re.IGNORECASE)})
    if model: and_parts.append({"model": re.compile(escape_regex(model), re.IGNORECASE)})

    if filters.get("priceMin") is not None or filters.get("priceMax") is not None:
        p = {}
        if filters.get("priceMin") is not None: p["$gte"] = filters["priceMin"]
        if filters.get("priceMax") is not None: p["$lte"] = filters["priceMax"]
        and_parts.append({"price": p})
    
    if filters.get("listingType"):
        and_parts.append({"listingType": re.compile(escape_regex(filters["listingType"]), re.IGNORECASE)})
    
    if filters.get("locationHint"):
        and_parts.append({"location": re.compile(escape_regex(filters["locationHint"]), re.IGNORECASE)})

    q = {"$and": and_parts} if and_parts else {}
    cursor = col.find(q, projection=AD_PROJECTION).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [{**d, "_category": "cars"} for d in docs]


async def search_electronics_strict(db: AsyncIOMotorDatabase, brand: Optional[str], model_text: Optional[str], type_val: Optional[str], filters: Dict[str, Any], limit: int = 6) -> List[Dict[str, Any]]:
    col = db["electronics"]
    and_parts = []

    if brand: and_parts.append({"brand": re.compile(escape_regex(brand), re.IGNORECASE)})
    if model_text:
        r = re.compile(escape_regex(model_text), re.IGNORECASE)
        and_parts.append({"$or": [{"description": r}, {"title": r}, {"model": r}]})
    
    if type_val:
        r = re.compile(escape_regex(type_val), re.IGNORECASE)
        and_parts.append({"$or": [{"title": r}, {"type": r}, {"description": r}]})

    if filters.get("priceMin") is not None or filters.get("priceMax") is not None:
        p = {}
        if filters.get("priceMin") is not None: p["$gte"] = filters["priceMin"]
        if filters.get("priceMax") is not None: p["$lte"] = filters["priceMax"]
        and_parts.append({"price": p})
    
    if filters.get("listingType"):
        and_parts.append({"listingType": re.compile(escape_regex(filters["listingType"]), re.IGNORECASE)})
    
    if filters.get("locationHint"):
        and_parts.append({"location": re.compile(escape_regex(filters["locationHint"]), re.IGNORECASE)})

    q = {"$and": and_parts} if and_parts else {}
    cursor = col.find(q, projection=AD_PROJECTION).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [{**d, "_category": "electronics"} for d in docs]


class ChatRequest(BaseModel):
    message: Optional[str] = ""
    page: Optional[str] = "souq"
    category: Optional[str] = None
    adId: Optional[str] = None


@router.post("/chat")
async def chat_endpoint(request: Request, payload: ChatRequest):
    try:
        print("🔥 CHAT ROUTE ACTIVE - BUILD = 2026-01-04_1")
        print("✅ /chat hit - version: GEMINI_FALLBACK_1")

        # In a real FastAPI app, you might obtain db from request.app.state.db or a Dependency
        # e.g., db = request.app.db
        from ..config import get_database # Assuming a dummy import
        db = get_database()

        raw_message = (payload.message or "").strip()
        user_message = alias_normalize(raw_message)

        page = payload.page or "souq"
        page_category = payload.category
        ad_id = payload.adId

        if not user_message:
            return {"reply": "اكتب سؤالك 🙂"}

        if re.match(r"^(مرحبا|مرحباً|هلا|هلا والله|اهلا|أهلا|السلام عليكم|سلام)$", user_message, re.IGNORECASE):
             return {"reply": "يا هلا فيك 😄 احكيلي بتدور على سيارات ولا شقق ولا اراضي ولا إلكترونيات ولا ملابس؟"}
        
        if is_how_are_you(raw_message):
             return {
                "reply": "الحمدلله تمام 😄💜\n" +
                "احكيلي شو بتدوري؟ (سيارات/شقق/أراضي/إلكترونيات/ملابس) + مدينة + ميزانية لو بتقدري"
             }

        if is_thanks(raw_message):
            return {"reply": "العفو يا قمر 💜 إذا بدك أي شي احكيلي شو بتدوري وبساعدك فورًا 😄"}

        if is_about_site(raw_message):
            return {
                "reply": "هذا موقع إعلانات ✨ بتقدري تدوري على (سيارات/شقق/أراضي/إلكترونيات/ملابس).\n" +
                "مثال اكتبي: (تيسلا بعمان تحت 20000) أو (شقة للايجار بإربد تحت 250).\n" +
                "قوليلي شو بدك وأنا بطلعلك المناسب 👌"
            }

        current_ad = None
        if page == "details" and page_category and ad_id:
            current_ad = await get_ad_by_id(db, page_category, ad_id)
        
        filters = extract_filters(
            user_message,
            safe_category(page_category) if page == "category" else None
        )

        effective_category = filters.get("category") or (safe_category(page_category) if page == "category" else None)

        async def send(reply_text: str):
            polished = await polish_reply({"userText": raw_message, "replyText": reply_text})
            return {"reply": polished}

        if filters.get("listAll") and effective_category:
            latest = await list_latest_ads(db, effective_category, 8)
            cat_ar = CATEGORY_AR.get(effective_category, effective_category)

            if not latest:
                return await send(f"بصراحة هسا ما في إعلانات بقسم {cat_ar}.\nبدك مدينة أو ميزانية؟")
            
            latest_with_cat = [{**x, "_category": effective_category} for x in latest]
            return await send(f"تمام 👌 هاي آخر {min(8, len(latest))} إعلانات بقسم {cat_ar}:\n{format_ads(latest_with_cat, 8)}")

        if is_category_only_browse(user_message, effective_category):
            latest = await list_latest_ads(db, effective_category, 3)
            cat_ar = CATEGORY_AR.get(effective_category, effective_category)

            if not latest:
                return await send(f"هسا ما في إعلانات بقسم {cat_ar} 😅\nبدك تقوليلي مدينة/ميزانية/مواصفات؟")
            
            latest_with_cat = [{**x, "_category": effective_category} for x in latest]
            return await send(
                f"أكيد 👌 هاي آخر 3 إعلانات بقسم {cat_ar}:\n" +
                f"{format_ads(latest_with_cat, 3)}\n\n" +
                "بدك مدينة أو ميزانية أو مواصفات عشان أفلترلك أدق؟"
            )

        if effective_category and is_browse_intent_only(user_message):
            latest = await list_latest_ads(db, effective_category, 3)
            cat_ar = CATEGORY_AR.get(effective_category, effective_category)

            if not latest:
                return await send(f"بصراحة هسا ما في إعلانات بقسم {cat_ar}.\nبدك مدينة أو ميزانية أو مواصفات؟")

            latest_with_cat = [{**x, "_category": effective_category} for x in latest]
            return await send(
                f"تمام 👌 هاي آخر 3 إعلانات بقسم {cat_ar}:\n" +
                f"{format_ads(latest_with_cat, 3)}\n\n" +
                "بدك مواصفات/مدينة عشان أفلترلك أدق؟"
            )

        number_match = re.match(r"^(\d[\d,٫]*)$", user_message)
        if number_match and filters.get("priceMax") is None:
            n_str = number_match.group(1).replace(",", "").replace("٫", "")
            try:
                filters["priceMax"] = float(n_str)
            except ValueError:
                pass

        search_params = {**filters, "category": effective_category, "userMessage": user_message}
        results = await search_ads_smart(db, search_params, 8)

        car_q = parse_car_query(raw_message)
        elec_q = parse_electronics_query(raw_message)

        if not results and (effective_category == "cars" or (car_q["brand"] and not elec_q["brand"])):
            brand = car_q["brand"]
            model = car_q["model"]

            if brand and model:
                strict = await search_cars_strict(db, brand, model, filters, 6)
                if strict:
                    results = strict
                else:
                    brand_only = await search_cars_strict(db, brand, None, filters, 6)
                    if brand_only:
                        return await send(
                            f"تمام 👌 دورت على \"{brand} {model}\" بس ما لقيته بالزبط.\n" +
                            f"بس لقيتلك سيارات {brand} ثانية ممكن تعجبك 👇\n" +
                            f"{format_ads(brand_only, 6)}\n\n" +
                            "إذا بدك نفس الموديل بالزبط، احكيلي سنة/ميزانية/مدينة وبفلترلك."
                        )

                    latest = await list_latest_ads(db, "cars", 3)
                    if latest:
                        latest_with_cat = [{**x, "_category": "cars"} for x in latest]
                        return await send(
                            f"ما لقيت \"{brand} {model}\" ولا حتى سيارات {brand} حالياً 😅\n" +
                            "بس هاي آخر 3 إعلانات سيارات عندنا 👇\n" +
                            f"{format_ads(latest_with_cat, 3)}\n\n" +
                            "بدك تقوليلي ميزانيتك أو مدينة؟"
                        )

        if not results and (effective_category == "electronics" or (elec_q["brand"] and not car_q["brand"])):
            brand = elec_q["brand"]
            type_val = elec_q["type"]
            model_text = elec_q.get("modelText")

            if brand and model_text:
                strict = await search_electronics_strict(db, brand, model_text, type_val, filters, 6)
                if strict:
                    results = strict
                else:
                    brand_only = await search_electronics_strict(db, brand, None, None, filters, 6)
                    if brand_only:
                        return await send(
                            f"دورت على \"{brand} {model_text}\" بس ما لقيته بالزبط.\n" +
                            f"بس هاي أجهزة من نفس البراند ({brand}) 👇\n" +
                            f"{format_ads(brand_only, 6)}\n\n" +
                            "بدك موديل ثاني؟ أو حددي ميزانية/مدينة."
                        )
                    latest = await list_latest_ads(db, "electronics", 3)
                    if latest:
                        latest_with_cat = [{**x, "_category": "electronics"} for x in latest]
                        return await send(
                            f"ما لقيت \"{brand} {model_text}\" ولا حتى {brand} بالموقع حالياً 😅\n" +
                            "بس هاي آخر 3 إعلانات بالإلكترونيات 👇\n" +
                            f"{format_ads(latest_with_cat, 3)}\n\n" +
                            "بدك أحاول ببراند ثاني؟"
                        )

            if brand and not model_text:
                brand_only = await search_electronics_strict(db, brand, None, None, filters, 6)
                if brand_only:
                    results = brand_only
                else:
                    latest = await list_latest_ads(db, "electronics", 3)
                    if latest:
                        latest_with_cat = [{**x, "_category": "electronics"} for x in latest]
                        return await send(
                            f"حالياً ما في \"{brand}\" بالموقع 😅\n" +
                            "بس هاي آخر 3 إعلانات بالإلكترونيات 👇\n" +
                            f"{format_ads(latest_with_cat, 3)}\n\n" +
                            "بدك أقترحلك براندات ثانية حسب ميزانيتك؟"
                        )

        if not results:
            msg = str(user_message or "").strip()
            if len(msg) >= 6:
                normalized = await normalize_query(raw_message)
                normalized2 = alias_normalize(normalized) if normalized else None
                
                if normalized2:
                    search_params = {**filters, "category": effective_category, "userMessage": user_message, "keywords": normalized2}
                    results = await search_ads_smart(db, search_params, 8)

        if not results:
            if filters.get("priceMax") is not None:
                return await send(f"تمام 👌 ميزانيتك لحد {filters['priceMax']} دينار.\nبدك بأي مدينة؟")

            if current_ad:
                return await send(f"تمام 👌 هذا الإعلان اللي قدامك:\n{format_current_ad(current_ad)}\n\nشو بتحب تعرف عنه؟")

            return await send("والله دورت بس ما طلع معي نتائج مطابقة هسا 😅\nبدك تحكيلي مدينة/ميزانية/مواصفات؟")

        return await send(f"تمام! لقيتلك هالإعلانات 👇\n{format_ads(results, 8)}\n\n")

    except Exception as e:
        print("CHAT ERROR:", e)
        return {"reply": "صار خطأ بالسيرفر… جرّب كمان مرة."}
