import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';

export default function PropertyRating({ propertyId, onRatingSubmitted }) {
  const { t } = useTranslation();
  const [hoverRating, setHoverRating] = useState(0);
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      alert(t('property_details.rating.login_required', "You must be logged in to rate a property."));
      return;
    }
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/properties/${propertyId}/reviews`, { rating_value: rating });
      if (res.success) {
        setHasRated(true);
        if (onRatingSubmitted) onRatingSubmitted();
      }
    } catch (error) {
      console.error("Failed to submit rating:", error);
      alert(error.message || "Failed to submit rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasRated) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 text-sm font-bold text-center">
        {t('property_details.rating.thank_you', "Thank you for rating this property!")}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
      <h3 className="text-sm font-black mb-3">{t('property_details.rating.title', "Rate this property")}</h3>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 hover:scale-110 transition-transform focus:outline-none"
            >
              <Star
                size={28}
                className={`${
                  (hoverRating || rating) >= star
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                } transition-colors`}
              />
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-black rounded-xl transition-colors"
        >
          {isSubmitting ? t('property_details.rating.submitting', "Submitting...") : t('property_details.rating.submit', "Submit Rating")}
        </button>
      </div>
    </div>
  );
}
