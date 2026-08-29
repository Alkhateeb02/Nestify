// الخطوة 1: المعلومات الأساسية (الاسم، النوع، الجنس، الوصف)
import React from "react";
import { motion } from "framer-motion";

export default function StepBasicInfo({ propData, setPropData, boxInput, labelCls, t, isAr, suggesting, onAiSuggest }) {
  return (
    <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      
      {/* الاسم والنوع */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* حقل اسم السكن */}
        <div className="space-y-1.5">
          <label className={labelCls}>{t("owner_dashboard.prop_name")}</label>
          <input required type="text" value={propData.title || ""} onChange={e => setPropData({ ...propData, title: e.target.value })} placeholder={t("owner_dashboard.prop_name_ph")} className={boxInput} />
        </div>
        {/* حقل نوع السكن */}
        <div className="space-y-1.5">
          <label className={labelCls}>{t("owner_dashboard.prop_type")}</label>
          <select value={propData.type || "Apartment"} onChange={e => setPropData({ ...propData, type: e.target.value })} className={boxInput}>
            <option value="Apartment">{t("owner_dashboard.type_apartment")}</option>
            <option value="Studio">{t("owner_dashboard.type_studio")}</option>
            <option value="Shared Room">{t("owner_dashboard.type_shared")}</option>
            <option value="Villa">{t("owner_dashboard.type_villa")}</option>
          </select>
        </div>
      </div>

      {/* طريقة الحجز والجنس المستهدف */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* حقل نوع التأجير (فردي، بالسرير، إلخ) */}
        <div className="space-y-1.5">
          <label className={labelCls}>{t("owner_dashboard.listing_type")}</label>
          <select value={propData.listingType || "Solo"} onChange={e => setPropData({ ...propData, listingType: e.target.value })} className={boxInput}>
            <option value="Solo">{t("owner_dashboard.type_solo")}</option>
            <option value="PerBed">{t("owner_dashboard.type_per_bed")}</option>
            <option value="Hybrid">{t("owner_dashboard.type_hybrid")}</option>
          </select>
        </div>
        {/* حقل الجنس المستهدف */}
        <div className="space-y-1.5">
          <label className={labelCls}>{t("owner_dashboard.target_gender")}</label>
          <select value={propData.gender || "Male"} onChange={e => setPropData({ ...propData, gender: e.target.value })} className={boxInput}>
            <option value="Male">{t("owner_dashboard.gender_male")}</option>
            <option value="Female">{t("owner_dashboard.gender_female")}</option>
            <option value="Any">{t("owner_dashboard.gender_any")}</option>
          </select>
        </div>
      </div>

      {/* حقل السعة الاستيعابية (يظهر فقط في أنواع معينة) */}
      {(propData.listingType === "Hybrid" || propData.listingType === "PerBed") && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1.5">
          <label className={labelCls}>{t("owner_dashboard.capacity")}</label>
          <input required type="number" min="1" value={propData.capacity || ""} onChange={e => setPropData({ ...propData, capacity: e.target.value })} placeholder="5" className={boxInput} />
        </motion.div>
      )}

      {/* وصف العقار */}
      <div className="space-y-1.5">
        <label className={labelCls}>{t("owner_dashboard.prop_desc")}</label>
        <textarea rows={4} value={propData.description || ""} onChange={e => setPropData({ ...propData, description: e.target.value })} placeholder={t("owner_dashboard.prop_desc_ph")} className={`${boxInput} resize-none`} />
      </div>
    </motion.div>
  );
}
