import numpy as np
import faiss


class MatchingService:

    def encode(self, prefs):
        # Map values to numerical features [0, 1]
        sleep = 1 if prefs.get("sleep") == "late" else 0
        smoke = 1 if prefs.get("smoke") == "yes" else 0
        
        # Scale 1-5 values to 0-1
        clean = (prefs.get("clean", 3) - 1) / 4.0
        noise = (prefs.get("noise", 3) - 1) / 4.0
        social = (prefs.get("social", 3) - 1) / 4.0
        study = (prefs.get("study", 3) - 1) / 4.0
        
        pets = 1 if prefs.get("pets_allowed") else 0
        
        return [
            sleep,
            smoke,
            clean,
            noise,
            social,
            study,
            pets
        ]

    def find_matches(self, current_user, candidates, k=3):

        filtered_candidates = [
            c for c in candidates
            if c["gender"] == current_user["gender"]
            and c["id"] != current_user["id"]
        ]

        if not filtered_candidates:
            return []

        vectors = np.array([
            self.encode(c["prefs"])
            for c in filtered_candidates
        ]).astype("float32")

        ids = [c["id"] for c in filtered_candidates]

        query = np.array([
            self.encode(current_user["prefs"])
        ]).astype("float32")

        faiss.normalize_L2(vectors)
        faiss.normalize_L2(query)

        index = faiss.IndexFlatIP(vectors.shape[1])

        index.add(vectors)

        similarities, indices = index.search(query, k)

        results = []

        for score, idx in zip(similarities[0], indices[0]):

            if idx == -1:
                continue

            matched_student = filtered_candidates[idx]

            results.append({
                "student_id": matched_student["id"],
                "similarity_score": round(float(score) * 100, 2),
                "prefs": matched_student["prefs"]
            })

        return results