
import React from "react";
import PropertyCard from "./PropertyCard";
import { Button } from "../ui/Button";
import { useTranslation } from "react-i18next";

export default function PropertyGrid({ properties, clearFilters }) {
  const { t } = useTranslation();
  if (!properties.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          {t("property_grid.no_properties")}
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t("property_grid.try_changing")}
        </p>

        <Button
          onClick={clearFilters}
          variant="default"
          size="md"
          className="mt-5"
        >
          {t("property_grid.reset_filters")}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}