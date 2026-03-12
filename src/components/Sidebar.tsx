"use client";

import Link from "next/link";
import { LayoutDashboard, Users, Boxes, Settings, Truck, Sun, Award, Globe, ShoppingCart } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Sidebar() {
    const { t, lang, setLang } = useI18n();

    return (
        <aside className="w-64 bg-white border-r min-h-screen pt-4 px-3 flex flex-col">
            <div className="flex items-center justify-between px-4 mb-6">
                <div className="text-xl font-bold text-indigo-600">ERP System</div>
                <button
                    onClick={() => setLang(lang === "en" ? "vi" : "en")}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors flex items-center space-x-1"
                >
                    <Globe className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase">{lang}</span>
                </button>
            </div>

            <nav className="flex-1 space-y-1">
                <Link href="/" className="flex items-center space-x-3 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors">
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">{t("dashboard")}</span>
                </Link>
                <Link href="/projects" className="flex items-center space-x-3 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors">
                    <Sun className="w-5 h-5" />
                    <span className="font-medium">{t("projects")}</span>
                </Link>
                <Link href="/procurement" className="flex items-center space-x-3 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors">
                    <ShoppingCart className="w-5 h-5 text-violet-500" />
                    <span className="font-medium">{t("procurement")}</span>
                </Link>
                <Link href="/inventory" className="flex items-center space-x-3 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors">
                    <Boxes className="w-5 h-5" />
                    <span className="font-medium">{t("inventory")}</span>
                </Link>
                <Link href="/logistics" className="flex items-center space-x-3 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors">
                    <Truck className="w-5 h-5" />
                    <span className="font-medium">{t("logistics")}</span>
                </Link>
                <Link href="/kpi" className="flex items-center space-x-3 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span className="font-medium">{t("kpi")}</span>
                </Link>

                <div className="pt-6 mt-6 border-t border-slate-200">
                    <Link href="/users" className="flex items-center space-x-3 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors">
                        <Users className="w-5 h-5" />
                        <span className="font-medium">{t("users")}</span>
                    </Link>
                    <Link href="/settings" className="flex items-center space-x-3 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">{t("settings")}</span>
                    </Link>
                </div>
            </nav>
        </aside>
    );
}
