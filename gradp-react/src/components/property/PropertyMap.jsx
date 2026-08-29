
import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function PropertyMap({ locationName = "Ma'an, Jordan" }) {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(locationName)}`;

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl group h-[340px]">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 animate-pulse">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Navigation size={36} className="animate-bounce" />
              <p className="text-xs font-bold uppercase tracking-widest">{t("property_details.map.loading")}</p>
            </div>
          </div>
        )}
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10214.368863640244!2d35.7946927!3d30.1989679!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15033ed7eaaeeb83%3A0xe67baeb919a84eab!2sMa'an%20University%20College!5e0!3m2!1sen!2sjo!4v1700000000000!5m2!1sen!2sjo"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Property Location"
          onLoad={() => setLoaded(true)}
          className={`transition-all duration-700 grayscale group-hover:grayscale-0 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="pointer-events-none absolute bottom-5 left-5 flex items-center gap-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2.5 shadow-xl border border-white/50 dark:border-slate-700">
          <MapPin size={16} className="text-blue-700 dark:text-lime-500 shrink-0" />
          <span className="text-xs font-black text-slate-900 dark:text-white">{locationName}</span>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] shadow-[inset_0_0_30px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]" />
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full rounded-2xl border border-blue-100 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-sm font-black text-blue-700 dark:text-blue-400 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/30"
      >
        <ExternalLink size={16} />
        {t("property_details.map.open_in_google_maps")}
      </a>
    </div>
  );
}
