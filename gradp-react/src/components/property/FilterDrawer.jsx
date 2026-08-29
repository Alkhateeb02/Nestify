
import React from "react";
import { useTranslation } from "react-i18next";
import {
  X, RotateCcw, Home, Building2, BookOpen, Users,
  Wallet, TrendingDown, ArrowUpDown, TrendingUp, Clock
} from "lucide-react";
import { Button } from "../ui/Button";
import { CompactChip } from "../ui/CompactChip";

export default function FilterDrawer({
  drawerOpen, setDrawerOpen,
  drawerRef, activeCount, hasActive, clearFilters,
  typeFilter, setTypeFilter,
  genderFilter, setGenderFilter,
  priceFilter, setPriceFilter,
  sortBy, setSortBy
}) {
  const { t } = useTranslation();

  return (
    <>
      {/* 
          Overlay خلف الـ Drawer
       */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur-sm
          transition-opacity duration-300
          ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ top: "72px" }}
        aria-hidden="true"
      />

      {/* 
          الـ Drawer نفسه
       */}
      <aside
        ref={drawerRef}
        className={`
          fixed right-0 z-[60] w-[340px] max-w-[92vw]
          flex flex-col
          bg-white dark:!bg-[#0e1320]
          border border-slate-200/60 dark:border-slate-800/60
          rounded-tl-3xl rounded-bl-3xl
          shadow-2xl shadow-slate-900/20 dark:shadow-slate-950/60
          transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]
          ${drawerOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ top: "72px", bottom: 0 }}
      >
        {/* Header الـ Drawer */}
        <div className="flex items-center justify-between px-6 py-5
          border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {t("property_details.listings.filter_any_type").split(" ")[0] === "Any" ? "Filters" : "الفلاتر"}
            </h3>
            {activeCount > 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {activeCount} {activeCount === 1 ? "active" : "active"} filter{activeCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="h-8 w-8 flex items-center justify-center rounded-xl
            dark:!bg-slate-800
              hover:bg-slate-800 dark:hover:!bg-slate-800 transition-colors text-sm"
          >
            ❌
          </button>
        </div>

        {/* محتوى الـ Drawer */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 no-scrollbar">
          {/* ── النوع: Compact Grid ── */}
          <div>
            <div className="mb-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                {t("property_details.listings.filter_any_type")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CompactChip className={typeFilter === "all" ? "!bg-[#004A8D] !border-[#004A8D] !text-white" : "text-blue-500 dark:text-white dark:!bg-slate-800"} icon={Home} label={t("property_details.listings.all_properties")} active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
              <CompactChip className={typeFilter === "Apartment" ? "!bg-[#004A8D] !border-[#004A8D] !text-white" : "text-blue-500 dark:text-white dark:!bg-slate-800"} icon={Building2} label={t("property_details.stats.apartment")} active={typeFilter === "Apartment"} onClick={() => setTypeFilter("Apartment")} />
              <CompactChip className={typeFilter === "Studio" ? "!bg-[#004A8D] !border-[#004A8D] !text-white" : "text-blue-500 dark:text-white dark:!bg-slate-800"} icon={BookOpen} label={t("property_details.stats.studio")} active={typeFilter === "Studio"} onClick={() => setTypeFilter("Studio")} />
              <CompactChip className={typeFilter === "Shared Room" ? "!bg-[#004A8D] !border-[#004A8D] !text-white" : "text-blue-500 dark:text-white dark:!bg-slate-800"} icon={Users} label={t("property_details.stats.shared_room")} active={typeFilter === "Shared Room"} onClick={() => setTypeFilter("Shared Room")} />
            </div>
          </div>

          {/* ── الجنس: Compact Grid ── */}
          <div>
            <div className="mb-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                {t("property_details.listings.filter_any_gender")}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <CompactChip className={genderFilter === "all" ? "!bg-[#004A8D] !border-[#004A8D] !text-white" : "text-blue-500 dark:text-white dark:!bg-slate-800"} label={t("property_details.listings.filter_any_gender")} active={genderFilter === "all"} onClick={() => setGenderFilter("all")} />
              <CompactChip className={genderFilter === "Male" ? "!bg-[#004A8D] !border-[#004A8D] !text-white" : "text-blue-500 dark:text-white dark:!bg-slate-800"} label={`👨 ${t("property_details.stats.male_only")}`} active={genderFilter === "Male"} onClick={() => setGenderFilter("Male")} />
              <CompactChip className={genderFilter === "Female" ? "!bg-[#004A8D] !border-[#004A8D] !text-white" : "text-blue-500 dark:text-white dark:!bg-slate-800"} label={`👩 ${t("property_details.stats.female_only")}`} active={genderFilter === "Female"} onClick={() => setGenderFilter("Female")} />
            </div>
          </div>

          {/* ── السعر: Compact Grid ── */}
          <div>
            <div className="mb-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                {t("property_details.listings.filter_any_budget")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CompactChip className={priceFilter === "all" ? "!bg-[#004A8D] !border-[#004A8D] !text-white" : "text-blue-500 dark:text-white dark:!bg-slate-800"} icon={Wallet} label={t("property_details.listings.filter_any_budget")} active={priceFilter === "all"} onClick={() => setPriceFilter("all")} />
              <CompactChip className={priceFilter === "under100" ? "!bg-[#004A8D] !border-[#004A8D] !text-white" : "text-blue-500 dark:text-white dark:!bg-slate-800"} icon={TrendingDown} label="< 100 JD" active={priceFilter === "under100"} onClick={() => setPriceFilter("under100")} />
              <CompactChip className={priceFilter === "100to150" ? "!bg-[#004A8D] !border-[#004A8D] !text-white" : "text-blue-500 dark:text-white dark:!bg-slate-800"} icon={ArrowUpDown} label="100–150 JD" active={priceFilter === "100to150"} onClick={() => setPriceFilter("100to150")} />
              <CompactChip className={priceFilter === "above150" ? "!bg-[#004A8D] !border-[#004A8D] !text-white" : "text-blue-500 dark:text-white dark:!bg-slate-800"} icon={TrendingUp} label="> 150 JD" active={priceFilter === "above150"} onClick={() => setPriceFilter("above150")} />
            </div>
          </div>

          {/* ── الترتيب: Compact Grid ── */}
          <div>
            <div className="mb-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                {t("property_details.listings.sort_by") || "Sort by"}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <CompactChip className={sortBy === "newest" ? "!bg-[#004A8D] !border-[#004A8D] !text-white" : "text-blue-500 dark:text-white dark:!bg-slate-800"} icon={Clock} label={t("property_details.listings.sort_newest")} active={sortBy === "newest"} onClick={() => setSortBy("newest")} />
              <CompactChip className={sortBy === "price-low" ? "!bg-[#004A8D] !border-[#004A8D] !text-white" : "text-blue-500 dark:text-white dark:!bg-slate-800"} icon={TrendingUp} label={t("property_details.listings.sort_price_low")} active={sortBy === "price-low"} onClick={() => setSortBy("price-low")} />
              <CompactChip className={sortBy === "price-high" ? "!bg-[#004A8D] !border-[#004A8D] !text-white" : "text-blue-500 dark:text-white dark:!bg-slate-800"} icon={TrendingDown} label={t("property_details.listings.sort_price_high")} active={sortBy === "price-high"} onClick={() => setSortBy("price-high")} />
            </div>
          </div>

        </div>

        {/* Footer الـ Drawer */}
        <div className="px-5 py-5 border-t border-slate-100 dark:border-slate-800 shrink-0 flex gap-3">
          <Button
            variant="outline"
            onClick={() => { clearFilters(); }}
            disabled={!hasActive}
            className="flex-1 gap-2 !h-12 !rounded-xl
              !border-blue-500 !text-blue-500 hover:!bg-blue-50
              dark:!bg-slate-800 dark:!border-slate-700 dark:!text-white dark:hover:!bg-slate-700
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-200"
          >
            <RotateCcw size={14} />
            {t("property_details.listings.reset_filters")}
          </Button>
          <Button
            variant="default"
            onClick={() => setDrawerOpen(false)}
            className="flex-1 !h-12 !rounded-xl
              !bg-[#004A8D] dark:!bg-lime-500
              !text-white dark:!text-slate-900
              hover:!bg-blue-900 dark:hover:!bg-lime-400
              !shadow-lg !shadow-[#004A8D]/20 dark:!shadow-lime-500/20
              transition-all duration-200"
          >
            {t("property_details.listings.filter_any_type").split(" ")[0] === "Any" ? "Apply" : "تطبيق"}
          </Button>
        </div>
      </aside>
    </>
  );
}
