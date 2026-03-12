"use client";

import { useEffect, useState } from "react";
import {
    Package,
    AlertTriangle,
    Plus,
    Search,
    Filter,
    Loader2,
    X,
    Pencil,
    Trash2,
    ArrowRightLeft,
    ArrowDownLeft,
    ArrowUpRight,
    ClipboardCheck,
    Warehouse,
    QrCode,
    History as HistoryIcon,
    LayoutDashboard,
    ScanLine,
    Activity,
    TrendingUp,
    TrendingDown,
    MoreHorizontal,
    CheckCircle2
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { StockOperationModal } from "./StockOperations";
import { CreateItemModal } from "./CreateItemModal";

const API_ROOT = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface InventoryLevel {
    warehouse_id: number;
    quantity_on_hand: number;
    quantity_reserved: number;
    quantity_available: number;
}

interface InventoryItem {
    id: number;
    sku: string;
    barcode?: string;
    name: string;
    description?: string;
    levels: InventoryLevel[];
    unit_price: number;
    unit: string;
    category?: string;
    min_stock: number;
    reorder_point: number;
    max_stock: number;
}

export default function InventoryPage() {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<"items" | "warehouses" | "transfers" | "audits" | "transactions">("items");
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [stats, setStats] = useState({
        total_items: 0,
        low_stock_items: 0,
        active_transfers: 0,
        total_value: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);

    // Modals state
    const [opType, setOpType] = useState<"IN" | "OUT" | "TRANSFER" | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [barcodeScan, setBarcodeScan] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [itemsRes, statsRes] = await Promise.all([
                fetch(`${API_ROOT}/inventory/items`),
                fetch(`${API_ROOT}/inventory/stats`)
            ]);

            if (itemsRes.ok) setItems(await itemsRes.json());
            if (statsRes.ok) setStats(await statsRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchData();
    }, []);

    if (!mounted) return null;

    const filteredItems = items.filter(item =>
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const getTotalOnHand = (item: InventoryItem) =>
        item.levels?.reduce((acc, lvl) => acc + lvl.quantity_on_hand, 0) || 0;

    const getAvailable = (item: InventoryItem) =>
        item.levels?.reduce((acc, lvl) => acc + lvl.quantity_available, 0) || 0;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Executive Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                            <Warehouse className="w-8 h-8" />
                        </div>
                        {t("inventory")}
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        {t("inventory_desc")}
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {t("add_product")}
                    </button>
                    <div className="h-8 w-px bg-slate-100 mx-1"></div>
                    <button
                        onClick={() => setOpType("IN")}
                        className="p-2.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all group"
                        title={t("stock_in")}
                    >
                        <ArrowDownLeft className="w-5 h-5 group-hover:scale-110" />
                    </button>
                    <button
                        onClick={() => setOpType("OUT")}
                        className="p-2.5 hover:bg-rose-50 text-rose-600 rounded-xl transition-all group"
                        title={t("stock_out")}
                    >
                        <ArrowUpRight className="w-5 h-5 group-hover:scale-110" />
                    </button>
                    <button
                        onClick={() => setOpType("TRANSFER")}
                        className="p-2.5 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all group"
                        title={t("transfer")}
                    >
                        <ArrowRightLeft className="w-5 h-5 group-hover:scale-110" />
                    </button>
                </div>
            </div>

            {/* Metric Overview - Dashboard Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title={t("total_items")}
                    value={stats.total_items}
                    icon={<Package className="w-5 h-5" />}
                    color="indigo"
                    subtitle={t("product_catalog")}
                />
                <MetricCard
                    title={t("stock_alert")}
                    value={stats.low_stock_items}
                    icon={<AlertTriangle className="w-5 h-5" />}
                    color="rose"
                    trend={stats.low_stock_items > 0 ? t("needs_attention") : t("safe")}
                    trendColor={stats.low_stock_items > 0 ? "text-rose-600" : "text-emerald-600"}
                />
                <MetricCard
                    title={t("active_transfers")}
                    value={stats.active_transfers}
                    icon={<ArrowRightLeft className="w-5 h-5" />}
                    color="amber"
                />
                <MetricCard
                    title={t("stock_value")}
                    value={formatCurrency(stats.total_value)}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="emerald"
                    subtitle={t("working_capital")}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content (3/4) */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Detailed Navigation */}
                    <div className="bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between overflow-x-auto scrollbar-hide">
                        <div className="flex items-center gap-1">
                            {[
                                { id: "items", label: t("products"), icon: Package },
                                { id: "transactions", label: t("history"), icon: HistoryIcon },
                                { id: "warehouses", label: t("warehouses"), icon: Warehouse },
                                { id: "transfers", label: t("transfer"), icon: ArrowRightLeft },
                                { id: "audits", label: t("audits"), icon: ClipboardCheck },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                        ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                        {activeTab === "items" && (
                            <>
                                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="relative flex-1 max-w-md w-full group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder={t("search_product")}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
                                            <Filter className="w-3.5 h-3.5" />
                                            {t("advanced_filter")}
                                        </button>
                                        <button className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200 hover:scale-105 transition-all">
                                            <ScanLine className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("products")}</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">{t("actual_stock")}</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">{t("available")}</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("status")}</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">{t("action")}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={5} className="py-32 text-center">
                                                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
                                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{t("loading")}</p>
                                                    </td>
                                                </tr>
                                            ) : filteredItems.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="py-32 text-center">
                                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                            <Package className="w-10 h-10 text-slate-200" />
                                                        </div>
                                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{t("no_products")}</p>
                                                        <button
                                                            onClick={() => setIsCreateOpen(true)}
                                                            className="mt-4 text-indigo-600 text-xs font-bold hover:underline"
                                                        >
                                                            {t("add_first_product")}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredItems.map(item => {
                                                    const available = getAvailable(item);
                                                    const total = getTotalOnHand(item);
                                                    const isLow = available <= item.reorder_point;

                                                    return (
                                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 text-slate-400 group-hover:bg-white group-hover:scale-110 transition-all group-hover:text-indigo-600 group-hover:border-indigo-100 group-hover:shadow-lg group-hover:shadow-indigo-50">
                                                                        <Package className="w-6 h-6" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-900 leading-tight">{item.name}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">SKU: {item.sku}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <span className="text-sm font-black text-slate-700">{total}</span>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{item.unit}</p>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <span className={`text-lg font-black ${isLow ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                                    {available}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                {isLow ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-tight shadow-sm shadow-rose-50 animate-pulse">
                                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                                        {t("need_restock")}
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-tight">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                                        {t("safety_level")}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100 shadow-sm">
                                                                        <Pencil className="w-4 h-4" />
                                                                    </button>
                                                                    <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-rose-600 transition-all border border-transparent hover:border-slate-100 shadow-sm">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {activeTab !== "items" && (
                            <div className="py-40 text-center flex flex-col items-center justify-center gap-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-dashed border-slate-300">
                                    <Activity className="w-10 h-10 text-slate-200" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-slate-800 tracking-tight">{t("page_under_construction")}</p>
                                    <p className="text-slate-500 font-medium text-sm mt-1">{t("data_available_soon")}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Analytics & Activities (1/4) */}
                <div className="space-y-8">
                    {/* Real-time Status Card */}
                    <div className="bg-slate-900 p-8 rounded-[32px] text-white overflow-hidden relative shadow-2xl shadow-slate-200">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Activity className="w-24 h-24" />
                        </div>
                        <h4 className="text-lg font-black mb-6 relative z-10">{t("warehouse_status")}</h4>
                        <div className="space-y-6 relative z-10">
                            <StatusRow label={t("stock_turnover")} value="84%" trend="+2.4%" trendUp />
                            <StatusRow label={t("warehouse_space")} value="62%" trend="-5% Space" />
                            <StatusRow label={t("receiving_time")} value="2.4h" valueSub="Avg. GRN" />
                        </div>
                        <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                            {t("view_detailed_report")}
                        </button>
                    </div>

                    {/* Quick Timeline */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                        <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                            <HistoryIcon className="w-5 h-5 text-indigo-500" />
                            {t("recent_activity")}
                        </h4>
                        <div className="space-y-8 border-l-2 border-slate-50 ml-2 pl-6">
                            <TimelineItem type="IN" title="Stock In: Solar Panel 450W" time="2h ago" user="Admin" />
                            <TimelineItem type="OUT" title="Dispatch Order SO-99" time="5h ago" user="Wh Manager" />
                            <TimelineItem type="TRANSFER" title="Transfer WH-MAIN -> BIN-A" time="8h ago" user="System" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateItemModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={fetchData}
            />
            <StockOperationModal
                type={opType}
                onClose={() => setOpType(null)}
                onSuccess={fetchData}
            />
        </div>
    );
}

function MetricCard({ title, value, icon, color, subtitle, trend, trendColor }: any) {
    const colors: any = {
        indigo: "bg-indigo-600 text-white shadow-indigo-100",
        rose: "bg-white text-slate-900 border-slate-200 shadow-sm",
        emerald: "bg-emerald-500 text-white shadow-emerald-100",
        amber: "bg-white text-slate-900 border-slate-200 shadow-sm"
    };

    const iconColors: any = {
        indigo: "bg-white/20 text-white",
        rose: "bg-rose-50 text-rose-600",
        emerald: "bg-white/20 text-white",
        amber: "bg-amber-50 text-amber-600"
    };

    return (
        <div className={`${colors[color]} p-6 rounded-[32px] border flex flex-col justify-between min-h-[160px] group hover:-translate-y-1 transition-all duration-300`}>
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${iconColors[color]} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-black uppercase tracking-widest ${trendColor}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className={`text-[10px] font-black uppercase tracking-widest opacity-60`}>{title}</p>
                <p className="text-2xl font-black mt-1">{value}</p>
                {subtitle && <p className="text-[10px] font-bold opacity-40 mt-1">{subtitle}</p>}
            </div>
        </div>
    );
}

function StatusRow({ label, value, trend, trendUp, valueSub }: any) {
    return (
        <div className="flex justify-between items-center group">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl font-black">{value}</span>
                    {valueSub && <span className="text-[10px] font-bold text-slate-500 italic">{valueSub}</span>}
                </div>
            </div>
            {trend && (
                <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {trend}
                </div>
            )}
        </div>
    );
}

function TimelineItem({ type, title, time, user }: any) {
    const icons: any = {
        IN: <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />,
        OUT: <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />,
        TRANSFER: <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
    };

    return (
        <div className="relative group">
            <div className="absolute -left-[33px] top-1 w-4 h-4 bg-white border-2 border-slate-200 rounded-full z-10 group-hover:border-indigo-500 transition-colors"></div>
            <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-xl mt-0.5">
                    {icons[type]}
                </div>
                <div>
                    <p className="text-[11px] font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{title}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{time}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{user}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
