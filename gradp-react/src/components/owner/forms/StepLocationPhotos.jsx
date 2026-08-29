
import React from "react";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import api from "../../../utils/api";

export default function StepLocationPhotos({ propData, setPropData, boxInput, labelCls, t }) {
  return (
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

      {/* العنوان والخرائط */}
      <div className="space-y-1.5">
        <label className={labelCls}>{t("owner_dashboard.location_text")}</label>
        <input required type="text" value={propData.locationText || ""} onChange={e => setPropData({ ...propData, locationText: e.target.value })} className={boxInput} />
      </div>
      {/* حقل رابط جوجل ماب (اختياري) */}
      <div className="space-y-1.5">
        <label className={labelCls}>{t("owner_dashboard.maps_url")}</label>
        <input type="url" value={propData.locationLink || ""} onChange={e => setPropData({ ...propData, locationLink: e.target.value })} className={boxInput} />
      </div>

      {/* رفع الصور ومعاينتها */}
      <div className="space-y-3">
        <label className={labelCls}>{t("owner_dashboard.images")}</label>

        {/* منطقة الضغط للرفع (Dropzone Simulator) */}
        <div
          onClick={() => document.getElementById('prop-images').click()}
          className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-10 text-center space-y-4 hover:border-blue-500 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/30"
        >
          <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 shadow-sm mx-auto grid place-items-center text-blue-600">
            <Upload size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{t("owner_dashboard.upload_photos")}</p>
            <p className="text-xs text-slate-400 mt-1">{t("owner_dashboard.click_to_browse")}</p>
          </div>
          {/* حقل الملفات المخفي */}
          <input
            id="prop-images"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={async (e) => {
              const files = Array.from(e.target.files);
              if (files.length > 0) {
                const currentImages = propData.images || [];
                const newPaths = [];
                for (const file of files) {
                  const uploadFormData = new FormData();
                  uploadFormData.append("properties_image", file);
                  try {
                    const uploadRes = await api.post("/upload/property-image", uploadFormData, {
                      headers: { "Content-Type": "multipart/form-data" }
                    });
                    if (uploadRes.success && uploadRes.filePath) {
                      newPaths.push(`/${uploadRes.filePath}`);
                    }
                  } catch (err) {
                    console.error("Property image upload failed:", err);
                  }
                }
                if (newPaths.length > 0) {
                  const updatedImages = [...currentImages, ...newPaths];
                  setPropData({
                    ...propData,
                    properties_image: updatedImages[0],
                    propertiesImage: updatedImages[0],
                    images: updatedImages
                  });
                }
              }
            }}
          />
        </div>

        {/* عرض الصور التي تم اختيارها (Previews) */}
        {propData.images && propData.images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {propData.images.map((img, idx) => (
              <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={img} alt="" className="w-full h-full object-cover" />
                {/* زر الحذف السريع للصورة */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = propData.images.filter((_, i) => i !== idx);
                    setPropData({ ...propData, images: updated });
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
