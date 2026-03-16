"use client";

import { useEffect, useState } from "react";
import {
    ShoppingCart, Package, Users, FileText, Plus, Search, Filter,
    Loader2, CheckCircle2, Clock, AlertTriangle, ArrowDownLeft,
    Truck, DollarSign, Activity, TrendingUp, Eye, MoreHorizontal,
    ChevronRight, X, Boxes
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CreatePOModal } from "./CreatePOModal";
import { SupplierModal } from "./SupplierModal";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface POItem {
    id: number;
    item_id: number;
    quantity: number;
    unit_price: number;
    received_quantity: number;
    item_name?: string;
    item_sku?: string;
}

interface PurchaseOrder {
    id: number;
    po_number: string;
    supplier_id: number;
    warehouse_id: number;
    status: string;
    total_amount: number;
    created_by: string;
    created_at: string;
    approved_at?: string;
    items: POItem[];
    supplier_name?: string;
    warehouse_name?: string;
    notes?: string;
}

// Status config will be moved inside the component to use the 't' hook.

export default function ProcurementPage() {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<"orders" | "suppliers">("orders");
    const [pos, setPOs] = useState<PurchaseOrder[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [stats, setStats] = useState({ total_pos: 0, pending_approval: 0, active_suppliers: 0, monthly_value: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);

    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
        DRAFT: { label: t("draft"), color: "bg-slate-100 text-slate-600 border-slate-200", icon: FileText },
        PENDING_APPROVAL: { label: t("pending_approval"), color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
        APPROVED: { label: t("approve"), color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
        SENT: { label: t("sent"), color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Truck },
        PARTIALLY_RECEIVED: { label: t("partially_received"), color: "bg-orange-50 text-orange-700 border-orange-200", icon: ArrowDownLeft },
        COMPLETED: { label: t("completed"), color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: CheckCircle2 },
        CANCELLED: { label: t("cancelled"), color: "bg-rose-50 text-rose-600 border-rose-200", icon: X },
    };

    const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
    const [isSupplierOpen, setIsSupplierOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [posRes, suppRes, statsRes] = await Promise.all([
                fetch(`${API}/procurement/purchase-orders`),
                fetch(`${API}/procurement/suppliers`),
                fetch(`${API}/procurement/stats`),
            ]);
            if (posRes.ok) setPOs(await posRes.json());
            if (suppRes.ok) setSuppliers(await suppRes.json());
            if (statsRes.ok) setStats(await statsRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { setMounted(true); fetchData(); }, []);
    if (!mounted) return null;

    const handleStatusChange = async (poId: number, newStatus: string) => {
        await fetch(`${API}/procurement/purchase-orders/${poId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        fetchData();
    };

    const handleReceive = async (po: PurchaseOrder) => {
        const receiveItems = po.items
            .filter(i => i.received_quantity < i.quantity)
            .map(i => ({ item_id: i.item_id, received_qty: i.quantity - i.received_quantity }));
        if (receiveItems.length === 0) return;

        await fetch(`${API}/procurement/purchase-orders/${po.id}/receive`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: receiveItems }),
        });
        fetchData();
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

    const filteredPOs = pos.filter(po =>
        po.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (po.supplier_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-violet-600 rounded-2xl text-white shadow-xl shadow-violet-100">
                            <ShoppingCart className="w-8 h-8" />
                        </div>
                        {t("procurement")}
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-violet-500" />
                        {t("procurement_desc")}
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm">
                    <button onClick={() => setIsCreatePOOpen(true)}
                        className="px-6 py-2.5 bg-violet-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> {t("create_po")}
                    </button>
                    <div className="h-8 w-px bg-slate-100 mx-1"></div>
                    <button onClick={() => setIsSupplierOpen(true)}
                        className="px-5 py-2.5 bg-white text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Users className="w-4 h-4" /> {t("add_supplier")}
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title={t("total_pos")} value={stats.total_pos} icon={<FileText className="w-5 h-5" />} color="violet" />
                <MetricCard title={t("pending_approval")} value={stats.pending_approval} icon={<Clock className="w-5 h-5" />} color="amber"
                    trend={stats.pending_approval > 0 ? t("needs_attention") : t("none")} trendColor={stats.pending_approval > 0 ? "text-amber-600" : "text-emerald-600"} />
                <MetricCard title={t("active_suppliers")} value={stats.active_suppliers} icon={<Users className="w-5 h-5" />} color="slate" />
                <MetricCard title={t("monthly_value")} value={formatCurrency(stats.monthly_value)} icon={<TrendingUp className="w-5 h-5" />} color="emerald" subtitle={t("current_month")} />
            </div>

            {/* Tabs */}
            <div className="bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-1">
                {[
                    { id: "orders", label: t("purchase_orders"), icon: FileText },
                    { id: "suppliers", label: t("supplier"), icon: Users },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            }`}>
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                {activeTab === "orders" && (
                    <>
                        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md w-full group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                                <input type="text" placeholder={t("search_po")}
                                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-violet-500 transition-all outline-none font-medium" />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("order")}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("supplier")}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">{t("value")}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("status")}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("receive_progress")}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">{t("action")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isLoading ? (
                                        <tr><td colSpan={6} className="py-32 text-center">
                                            <Loader2 className="w-10 h-10 animate-spin text-violet-600 mx-auto mb-4" />
                                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{t("loading")}</p>
                                        </td></tr>
                                    ) : filteredPOs.length === 0 ? (
                                        <tr><td colSpan={6} className="py-32 text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                <ShoppingCart className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{t("no_po")}</p>
                                            <button onClick={() => setIsCreatePOOpen(true)} className="mt-4 text-violet-600 text-xs font-bold hover:underline">
                                                {t("create_first_po")}
                                            </button>
                                        </td></tr>
                                    ) : filteredPOs.map(po => {
                                        const totalQty = po.items.reduce((a, i) => a + i.quantity, 0);
                                        const receivedQty = po.items.reduce((a, i) => a + i.received_quantity, 0);
                                        const pct = totalQty > 0 ? Math.round((receivedQty / totalQty) * 100) : 0;
                                        const sc = statusConfig[po.status] || statusConfig.DRAFT;
                                        const StatusIcon = sc.icon;

                                        return (
                                            <tr key={po.id} className="hover:bg-slate-50/50 transition-all group">
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-black text-slate-900">{po.po_number}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                        {new Date(po.created_at).toLocaleDateString("vi-VN")}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-bold text-slate-700">{po.supplier_name || "N/A"}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{po.warehouse_name}</p>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-sm font-black text-slate-900">{formatCurrency(po.total_amount)}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-tight ${sc.color}`}>
                                                        <StatusIcon className="w-3.5 h-3.5" /> {sc.label}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="w-full max-w-[120px]">
                                                        <div className="flex justify-between mb-1">
                                                            <span className="text-[10px] font-black text-slate-500">{receivedQty}/{totalQty}</span>
                                                            <span className="text-[10px] font-black text-slate-400">{pct}%</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-violet-500' : 'bg-slate-200'}`}
                                                                style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {po.status === "DRAFT" && (
                                                            <button onClick={() => handleStatusChange(po.id, "APPROVED")}
                                                                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-100 transition-all border border-emerald-100">
                                                                {t("approve")}
                                                            </button>
                                                        )}
                                                        {(po.status === "APPROVED" || po.status === "SENT" || po.status === "PARTIALLY_RECEIVED") && (
                                                            <button onClick={() => handleReceive(po)}
                                                                className="px-3 py-1.5 bg-violet-50 text-violet-600 rounded-xl text-[10px] font-black uppercase hover:bg-violet-100 transition-all border border-violet-100 flex items-center gap-1">
                                                                <ArrowDownLeft className="w-3 h-3" /> {t("receive_goods")}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === "suppliers" && (
                    <>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900">{t("active_suppliers")}</h3>
                            <button onClick={() => setIsSupplierOpen(true)}
                                className="px-5 py-2.5 bg-violet-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-violet-700 transition-all flex items-center gap-2">
                                <Plus className="w-4 h-4" /> {t("add_supplier")}
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("supplier")}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("contact")}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("tax_code")}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("status")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {suppliers.length === 0 ? (
                                        <tr><td colSpan={4} className="py-20 text-center text-slate-400 text-sm font-bold">
                                            {t("no_suppliers")}
                                        </td></tr>
                                    ) : suppliers.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-black text-slate-900">{s.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.code}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm text-slate-700 font-medium">{s.contact_person || "—"}</p>
                                                <p className="text-[10px] text-slate-400">{s.email || s.phone || ""}</p>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-slate-500 font-mono">{s.tax_code || "—"}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                                                    {s.is_active ? t("active") : t("inactive")}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <CreatePOModal isOpen={isCreatePOOpen} onClose={() => setIsCreatePOOpen(false)} onSuccess={fetchData} suppliers={suppliers} />
            <SupplierModal isOpen={isSupplierOpen} onClose={() => setIsSupplierOpen(false)} onSuccess={fetchData} />
        </div>
    );
}

function MetricCard({ title, value, icon, color, subtitle, trend, trendColor }: any) {
    const colors: any = {
        violet: "bg-violet-600 text-white shadow-violet-100",
        amber: "bg-white text-slate-900 border-slate-200 shadow-sm",
        emerald: "bg-emerald-500 text-white shadow-emerald-100",
        slate: "bg-white text-slate-900 border-slate-200 shadow-sm",
    };
    const iconColors: any = {
        violet: "bg-white/20 text-white",
        amber: "bg-amber-50 text-amber-600",
        emerald: "bg-white/20 text-white",
        slate: "bg-slate-100 text-slate-600",
    };

    return (
        <div className={`${colors[color]} p-6 rounded-[32px] border flex flex-col justify-between min-h-[160px] group hover:-translate-y-1 transition-all duration-300`}>
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${iconColors[color]} group-hover:scale-110 transition-transform`}>{icon}</div>
                {trend && <span className={`text-[10px] font-black uppercase tracking-widest ${trendColor}`}>{trend}</span>}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{title}</p>
                <p className="text-2xl font-black mt-1">{value}</p>
                {subtitle && <p className="text-[10px] font-bold opacity-40 mt-1">{subtitle}</p>}
            </div>
        </div>
    );
}
