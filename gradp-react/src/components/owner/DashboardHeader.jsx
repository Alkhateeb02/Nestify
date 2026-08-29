
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/Button";

export default function DashboardHeader({ t, openAdd }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

      {/*  عنوان الصفحة ورسالة الترحيب  */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          {t("owner_dashboard.overview")}
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          {t("owner_dashboard.welcome_back")}
        </p>
      </div>

      {/*  زر إضافة سكن جديد  */}
      <Button
        onClick={openAdd}
        className="!h-11 !px-6 !rounded-xl !bg-blue-600 hover:!bg-blue-700 !text-white font-bold gap-2 shadow-sm border-none transition-all active:scale-95"
      >
        <Plus size={18} />
        {t("owner_dashboard.add_property")}
      </Button>

    </div>
  );
}
