
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Search, X, SlidersHorizontal } from "lucide-react";
import FilterDrawer from "./FilterDrawer";

/* الفلتر الرئيسي */
export default function PropertyFilters({
  search, setSearch,
  typeFilter, setTypeFilter,
  genderFilter, setGenderFilter,
  priceFilter, setPriceFilter,
  sortBy, setSortBy,
  clearFilters,
}) {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  const hasActive = typeFilter !== "all" || genderFilter !== "all" || priceFilter !== "all" || sortBy !== "newest";
  const activeCount = [
    typeFilter !== "all",
    genderFilter !== "all",
    priceFilter !== "all",
    sortBy !== "newest",
  ].filter(Boolean).length;

  // إغلاق الـ drawer عند الضغط خارجه
  useEffect(() => {
    const close = e => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) setDrawerOpen(false);
    };
    if (drawerOpen) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [drawerOpen]);

  // منع تمرير الصفحة لما الـ drawer مفتوح
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* شريط البحث + زر الفلاتر */}
      <div className="sticky top-24 z-40 mb-8 flex items-center gap-3">

        {/* سيرش بار */}
        <div className="relative flex-1 group">
          <div className="absolute start-5 top-1/2 -translate-y-1/2 z-10
            h-8 w-8 rounded-xl bg-[#004A8D]/8 dark:bg-lime-500/8
            flex items-center justify-center pointer-events-none
            transition-colors group-focus-within:bg-[#004A8D]/15 dark:group-focus-within:bg-lime-500/15">
            <Search size={16} className="text-[#004A8D] dark:text-lime-400" />
          </div>

          <input
            type="text"
            placeholder={t("property_details.listings.search_placeholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="
              w-full h-[56px] rounded-2xl
              border border-slate-200/80 dark:border-slate-700/60
              bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl
              ps-16 pe-12 text-sm font-semibold
              text-slate-800 dark:text-slate-100
              placeholder:text-slate-400 dark:placeholder:text-slate-600
              outline-none transition-all duration-300
              shadow-md shadow-slate-200/20 dark:shadow-slate-950/30
              focus:shadow-lg focus:shadow-[#004A8D]/8 dark:focus:shadow-lime-500/8
              focus:border-[#004A8D]/35 dark:focus:border-lime-500/35
              focus:ring-4 focus:ring-[#004A8D]/6 dark:focus:ring-lime-500/6
            "
          />

          {search && (
            <button onClick={() => setSearch("")}
              className="absolute end-4 top-1/2 -translate-y-1/2 z-[100]
                h-8 w-8 flex items-center justify-center rounded-full
                hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-sm">
              ❌
            </button>
          )}
        </div>

        {/* زر فتح الـ Drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={`
            relative flex items-center gap-2.5 h-[56px] px-5 rounded-2xl
            border font-bold text-sm shrink-0
            transition-all duration-200 shadow-md
            ${hasActive
              ? "!bg-[#004A8D] dark:!bg-lime-500 !border-[#004A8D] dark:!border-lime-500 !text-white dark:!text-slate-900 shadow-[#004A8D]/25 dark:shadow-lime-500/20"
              : "!bg-white/90 dark:!bg-slate-900/80 !border-slate-200/80 dark:!border-slate-700/60 !text-slate-700 dark:!text-slate-200 hover:border-[#004A8D]/40 dark:hover:border-lime-500/40 backdrop-blur-xl"
            }
          `}
        >
          <SlidersHorizontal size={17} />
          <span className="hidden sm:inline">{t("property_details.listings.filter_any_type").split(" ")[0] === "Any" ? "Filters" : "فلاتر"}</span>

          {/* عداد الفلاتر النشطة */}
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full
              bg-white dark:bg-slate-900 text-[#004A8D] dark:text-lime-400
              text-[10px] font-black flex items-center justify-center
              border-2 border-[#004A8D] dark:border-lime-500 shadow-sm">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* الـ Drawer (تم نقله لملف خارجي)*/}
      <FilterDrawer
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        drawerRef={drawerRef}
        activeCount={activeCount}
        hasActive={hasActive}
        clearFilters={clearFilters}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
    </>
  );
}