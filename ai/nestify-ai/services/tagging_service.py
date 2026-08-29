from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional

import torch
import torch.nn.functional as F
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
from transformers import AutoModel, AutoTokenizer


DEVICE = "cpu"


@dataclass(frozen=True)
class TagConfig:
    prompt: str
    text_weight: float
    image_weight: float
    booster_weight: float
    threshold: float


class AutoTaggingService:
    """
    Nestify auto-tagging model:
    - pretrained text encoder (DistilBERT)
    - optional pretrained image encoder (ResNet18)
    - semantic similarity against tag prompts
    - explicit text booster layer
    - evidence gating for sensitive tags
    - contradiction handling
    - threshold + top-k selection

    This is a hybrid low-resource multi-label prototype.
    """

    def __init__(self) -> None:
        self.device = DEVICE

        self.tag_configs: Dict[str, TagConfig] = {
            "wifi": TagConfig(
                prompt="a student housing listing with wifi or internet included",
                text_weight=0.65,
                image_weight=0.00,
                booster_weight=0.35,
                threshold=0.55,
            ),
            "utilities_included": TagConfig(
                prompt="student housing with utilities included in rent",
                text_weight=0.65,
                image_weight=0.00,
                booster_weight=0.35,
                threshold=0.55,
            ),
            "near_uni": TagConfig(
                prompt="student housing near university campus",
                text_weight=0.70,
                image_weight=0.00,
                booster_weight=0.30,
                threshold=0.56,
            ),
            "near_services": TagConfig(
                prompt="student housing near shops and daily services",
                text_weight=0.65,
                image_weight=0.00,
                booster_weight=0.35,
                threshold=0.56,
            ),
            "near_center": TagConfig(
                prompt="student housing near the city center or downtown",
                text_weight=0.65,
                image_weight=0.00,
                booster_weight=0.35,
                threshold=0.58,
            ),
            "near_connectors": TagConfig(
                prompt="student housing near transportation and connectors",
                text_weight=0.65,
                image_weight=0.00,
                booster_weight=0.35,
                threshold=0.56,
            ),
            "pets_allowed": TagConfig(
                prompt="student housing where pets are allowed",
                text_weight=0.60,
                image_weight=0.00,
                booster_weight=0.40,
                threshold=0.60,
            ),
            "smoking_allowed": TagConfig(
                prompt="student housing where smoking is allowed",
                text_weight=0.60,
                image_weight=0.00,
                booster_weight=0.40,
                threshold=0.60,
            ),
            "furnished": TagConfig(
                prompt="a furnished student room or apartment with furniture",
                text_weight=0.55,
                image_weight=0.10,
                booster_weight=0.35,
                threshold=0.55,
            ),
            "private_room": TagConfig(
                prompt="a private student room for one person",
                text_weight=0.55,
                image_weight=0.10,
                booster_weight=0.35,
                threshold=0.58,
            ),
            "shared_room": TagConfig(
                prompt="a shared student room with multiple beds",
                text_weight=0.55,
                image_weight=0.10,
                booster_weight=0.35,
                threshold=0.58,
            ),
            "ac": TagConfig(
                prompt="student housing with air conditioning",
                text_weight=0.60,
                image_weight=0.10,
                booster_weight=0.30,
                threshold=0.56,
            ),
            "parking": TagConfig(
                prompt="student housing with parking available",
                text_weight=0.60,
                image_weight=0.10,
                booster_weight=0.30,
                threshold=0.56,
            ),
            "security": TagConfig(
                prompt="student housing with security or safe building access",
                text_weight=0.60,
                image_weight=0.10,
                booster_weight=0.30,
                threshold=0.58,
            ),
        }

        self.tags: List[str] = list(self.tag_configs.keys())

        # These tags should not appear from semantic similarity alone.
        self.explicit_only_tags = {"pets_allowed", "smoking_allowed"}

        self.booster_rules: Dict[str, List[str]] = {
            "wifi": [
                "wifi",
                "wi-fi",
                "internet included",
                "internet",
                "wireless",
                "fiber",
                "واي فاي",
                "واي-فاي",
                "إنترنت",
                "انترنت",
                "شبكة",
                "ألياف",
                "الياف",
            ],
            "utilities_included": [
                "utilities included",
                "electricity included",
                "water included",
                "bills included",
                "all bills included",
                "included utilities",
                "شامل الخدمات",
                "شامل الفواتير",
                "شامل الكهرباء",
                "شامل الماء",
                "شامل المي",
                "الخدمات مشمولة",
                "الفواتير مشمولة",
            ],
            "near_uni": [
                "near ahu",
                "near university",
                "close to university",
                "walking distance to university",
                "5 minutes from ahu",
                "minutes from ahu",
                "campus nearby",
                "قريب من الجامعة",
                "قريبة من الجامعة",
                "قريب من جامعة",
                "قريبة من جامعة",
                "قرب الجامعة",
                "مسافة مشي للجامعة",
                "قريب من الحسين",
            ],
            "near_services": [
                "near services",
                "near shops",
                "near supermarket",
                "near market",
                "close to pharmacy",
                "close to restaurants",
                "قريب من الخدمات",
                "قريبة من الخدمات",
                "قريب من المحلات",
                "قرب الخدمات",
                "مطاعم",
                "سوبرماركت",
                "صيدلية",
            ],
            "near_center": [
                "near center",
                "city center",
                "downtown",
                "close to center",
                "قريب من وسط البلد",
                "قريب من السنتر",
                "وسط المدينة",
                "وسط البلد",
            ],
            "near_connectors": [
                "near bus",
                "near transportation",
                "near transport",
                "near connectors",
                "near main road",
                "easy transport",
                "قريب من المواصلات",
                "قريب من الباص",
                "مواصلات سهلة",
                "قرب المواصلات",
                "باصات",
            ],
            "pets_allowed": [
                "pets allowed",
                "pet friendly",
                "cats allowed",
                "dogs allowed",
                "مسموح بالحيوانات",
                "مسموح القطط",
                "حيوانات أليفة",
                "مسموح الحيوانات",
            ],
            "smoking_allowed": [
                "smoking allowed",
                "smokers allowed",
                "مسموح التدخين",
                "للمدخنين",
                "مسموح تدخين",
            ],
            "furnished": [
                "furnished",
                "fully furnished",
                "bed included",
                "desk included",
                "wardrobe",
                "sofa",
                "furniture",
                "مفروش",
                "مفروشة",
                "مجهزة",
                "سرير",
                "خزانة",
                "مكتب",
                "أثاث",
                "اثاث",
            ],
            "private_room": [
                "private room",
                "single room",
                "own room",
                "independent room",
                "غرفة منفردة",
                "غرفة مستقلة",
                "غرفة خاصة",
                "غرفة لحالي",
                "غرفة مفردة",
            ],
            "shared_room": [
                "shared room",
                "shared bedroom",
                "roommate",
                "two beds",
                "multiple beds",
                "غرفة مشتركة",
                "سرير مشترك",
                "سريرين",
                "سرير مزدوج",
                "غرفة مزدوجة",
                "شريك سكن",
            ],
            "ac": [
                "ac",
                "a/c",
                "air conditioning",
                "air-conditioned",
                "مكيف",
                "تكييف",
                "مكيفة",
                "اي سي",
                "كندشن",
            ],
            "parking": [
                "parking",
                "private parking",
                "car parking",
                "garage",
                "كراج",
                "موقف سيارات",
                "باركينج",
                "موقف خاص",
            ],
            "security": [
                "security",
                "secure building",
                "guard",
                "camera",
                "cctv",
                "safe area",
                "حراسة",
                "أمن",
                "امن",
                "كاميرات مراقبة",
                "كاميرات",
                "حارس",
            ],
        }

        self.tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
        self.text_model = AutoModel.from_pretrained("distilbert-base-uncased").to(self.device)
        self.text_model.eval()

        image_model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        image_model.fc = torch.nn.Identity()
        image_model.to(self.device)
        image_model.eval()
        self.image_model = image_model

        self.image_transform = transforms.Compose(
            [
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
            ]
        )

        # Compute prompt embeddings once at startup.
        self.tag_prompt_embeddings = self._build_tag_prompt_embeddings()

    def _encode_text(self, text: str) -> torch.Tensor:
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=256,
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.text_model(**inputs)

        cls_embedding = outputs.last_hidden_state[:, 0, :]
        return F.normalize(cls_embedding, p=2, dim=1)

    def _build_tag_prompt_embeddings(self) -> torch.Tensor:
        embeddings = []
        for tag in self.tags:
            emb = self._encode_text(self.tag_configs[tag].prompt)
            embeddings.append(emb)
        stacked = torch.cat(embeddings, dim=0)
        return F.normalize(stacked, p=2, dim=1)

    def _extract_image_features(self, image_path: str) -> torch.Tensor:
        try:
            image = Image.open(image_path).convert("RGB")
            image_tensor = self.image_transform(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                features = self.image_model(image_tensor)

            return F.normalize(features, p=2, dim=1)
        except Exception:
            return torch.zeros((1, 512), device=self.device)

    @staticmethod
    def _normalize_similarity(sim: float) -> float:
        """
        Convert cosine similarity from [-1, 1] to [0, 1].
        """
        return max(0.0, min(1.0, (sim + 1.0) / 2.0))

    def _text_semantic_scores(self, text: str) -> Dict[str, float]:
        listing_embedding = self._encode_text(text)
        sims = torch.matmul(listing_embedding, self.tag_prompt_embeddings.T).cpu().numpy()[0]
        return {
            tag: self._normalize_similarity(float(sims[i]))
            for i, tag in enumerate(self.tags)
        }

    def _image_support_scores(self, image_path: Optional[str]) -> Dict[str, float]:
        """
        Conservative image support.
        It only weakly helps visual tags.
        """
        if not image_path:
            return {tag: 0.0 for tag in self.tags}

        _ = self._extract_image_features(image_path)

        visual_tags = {
            "furnished",
            "private_room",
            "shared_room",
            "ac",
            "parking",
            "security",
        }
        return {tag: (0.15 if tag in visual_tags else 0.0) for tag in self.tags}

    def _booster_scores(self, text: str) -> Dict[str, float]:
        text_lower = text.lower()
        scores = {tag: 0.0 for tag in self.tags}

        for tag, phrases in self.booster_rules.items():
            matched_phrases = [phrase for phrase in phrases if phrase in text_lower]
            matched = len(matched_phrases)

            if matched == 0:
                continue

            if matched == 1:
                scores[tag] = 0.75
            elif matched == 2:
                scores[tag] = 0.90
            else:
                scores[tag] = 1.00

        return scores

    def _combine_scores(
        self,
        text_scores: Dict[str, float],
        image_scores: Dict[str, float],
        booster_scores: Dict[str, float],
    ) -> Dict[str, float]:
        final_scores: Dict[str, float] = {}

        for tag, cfg in self.tag_configs.items():
            score = (
                text_scores[tag] * cfg.text_weight
                + image_scores[tag] * cfg.image_weight
                + booster_scores[tag] * cfg.booster_weight
            )
            final_scores[tag] = round(float(max(0.0, min(1.0, score))), 4)

        return final_scores

    def _apply_evidence_gating(
        self,
        scores: Dict[str, float],
        booster_scores: Dict[str, float],
    ) -> Dict[str, float]:
        """
        Prevent sensitive tags from appearing without explicit evidence.
        """
        for tag in self.explicit_only_tags:
            if booster_scores[tag] == 0.0:
                scores[tag] *= 0.20

        return {k: round(v, 4) for k, v in scores.items()}

    def _apply_contradictions(
        self,
        scores: Dict[str, float],
        booster_scores: Dict[str, float],
    ) -> Dict[str, float]:
        """
        private_room and shared_room should not both stay strong
        unless the text truly supports both.
        """
        private_boost = booster_scores["private_room"]
        shared_boost = booster_scores["shared_room"]

        if private_boost > 0.0 and shared_boost == 0.0:
            scores["shared_room"] *= 0.55
        elif shared_boost > 0.0 and private_boost == 0.0:
            scores["private_room"] *= 0.55
        elif private_boost == 0.0 and shared_boost == 0.0:
            if scores["private_room"] >= scores["shared_room"]:
                scores["shared_room"] *= 0.55
            else:
                scores["private_room"] *= 0.55

        return {k: round(v, 4) for k, v in scores.items()}

    def _select_tags(
        self,
        scores: Dict[str, float],
        booster_scores: Dict[str, float],
        top_k: int = 8,
    ) -> List[str]:
        eligible = [
            tag
            for tag, score in scores.items()
            if score >= self.tag_configs[tag].threshold
        ]

        room_tags = {"private_room", "shared_room"}
        location_tags = {"near_uni", "near_services", "near_center", "near_connectors"}
        property_tags = {"wifi", "utilities_included", "furnished", "ac", "parking", "security"}

        eligible.sort(
            key=lambda t: (
                1 if booster_scores[t] > 0 else 0,
                1 if t in room_tags else 0,
                1 if t in location_tags else 0,
                1 if t in property_tags else 0,
                scores[t],
            ),
            reverse=True,
        )

        if eligible:
            return eligible[:top_k]

        ranked = sorted(scores.keys(), key=lambda t: scores[t], reverse=True)
        return ranked[: min(top_k, 3)]

    def _translate_to_english(self, text: str) -> str:
        import urllib.parse
        import requests
        try:
            url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q={urllib.parse.quote(text)}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                json_data = response.json()
                parts = [part[0] for part in json_data[0] if part[0]]
                return "".join(parts)
        except Exception as e:
            print(f"Translation helper failed, using original text: {e}")
        return text

    def predict_tags(
        self,
        title: str,
        description: str,
        image_path: Optional[str] = None,
        top_k: int = 8,
    ) -> Dict[str, object]:
        text = f"{title.strip()} {description.strip()}".strip()

        # Detect Arabic and translate to English for better semantic model performance
        translated_text = text
        import re
        if re.search(r"[\u0600-\u06FF]", text):
            translated_text = self._translate_to_english(text)

        text_scores = self._text_semantic_scores(translated_text)
        image_scores = self._image_support_scores(image_path)
        
        # Calculate booster scores on both original (Arabic/English) and translated (English)
        booster_scores = self._booster_scores(text)
        if translated_text != text:
            translated_booster = self._booster_scores(translated_text)
            for tag in booster_scores:
                booster_scores[tag] = max(booster_scores[tag], translated_booster[tag])

        final_scores = self._combine_scores(text_scores, image_scores, booster_scores)
        final_scores = self._apply_evidence_gating(final_scores, booster_scores)
        final_scores = self._apply_contradictions(final_scores, booster_scores)

        selected_tags = self._select_tags(final_scores, booster_scores, top_k=top_k)

        return {
            "tags": selected_tags,
            "scores": final_scores,
            "components": {
                "text_similarity": text_scores,
                "image_support": image_scores,
                "booster": booster_scores,
            },
        }