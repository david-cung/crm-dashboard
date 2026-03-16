"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Boxes,
    Truck,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight,
    TrendingDown,
    DollarSign,
    Briefcase,
    Activity,
    Clock,
    Zap,
    HelpCircle
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts";
import { useI18n } from "@/lib/i18n";

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const { t, lang } = useI18n();

    useEffect(() => {
        setMounted(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/dashboard/summary`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    }, []);

    if (!mounted) return null;

    const formatCurrency = (val: number) => {
        if (lang === 'vi') {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val * 25000); // Simple conversion for demo
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Executive Welcome & Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">{t("welcome")} 👋</h1>
                    <p className="text-slate-500 font-medium mt-1">{t("welcome_msg")}</p>
                </div>
                <div className="flex items-center space-x-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    <button className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all">{t("export_report")}</button>
                    <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">{t("generate_invoice")}</button>
                </div>
            </div>

            {/* KPI Cards (Top Row) */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <MetricCard
                    title={t("revenue_vs_target")}
                    mainValue={formatCurrency(stats?.revenue)}
                    subValue={`${((stats?.revenue / (stats?.target_revenue || 1)) * 100).toFixed(0)}% ${t("of_target")}`}
                    icon={<DollarSign className="w-5 h-5" />}
                    color="indigo"
                />
                <MetricCard
                    title={t("operating_costs")}
                    mainValue={formatCurrency(stats?.operating_costs)}
                    subValue={t("monthly_expenses")}
                    icon={<Activity className="w-5 h-5" />}
                    color="rose"
                />
                <MetricCard
                    title={t("gross_profit")}
                    mainValue={formatCurrency(stats?.gross_profit)}
                    subValue={t("net_margin")}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="emerald"
                />
                <MetricCard
                    title={t("pending_orders")}
                    mainValue={stats?.pending_orders || "0"}
                    subValue={t("in_production")}
                    icon={<Briefcase className="w-5 h-5" />}
                    color="amber"
                />
                <MetricCard
                    title={t("delivery_rate")}
                    mainValue={stats?.delivery_rate || "100%"}
                    subValue={t("on_time_delivery")}
                    icon={<Truck className="w-5 h-5" />}
                    color="blue"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Finance & Cash Flow Module */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm overflow-hidden relative group">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{t("cash_flow")}</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{t("cash_flow_sub")}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="flex items-center text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span> {t("inflow")}
                                </span>
                                <span className="flex items-center text-[10px] font-black uppercase text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span> {t("outflow")}
                                </span>
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.cash_flow || []}>
                                    <defs>
                                        <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} tickFormatter={(value) => lang === 'vi' ? `${value/1000}M` : `$${value / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                                    />
                                    <Area type="monotone" dataKey="inflow" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorInflow)" />
                                    <Area type="monotone" dataKey="outflow" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorOutflow)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Finance Sub-cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Overdue Invoices */}
                        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                            <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-3 text-rose-500" />
                                {t("overdue_invoices")}
                            </h4>
                            <div className="space-y-4">
                                {(stats?.overdue_invoices || []).length === 0 ? (
                                    <div className="text-center py-10">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-20" />
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center">{t("no_po")}</p>
                                    </div>
                                ) : stats.overdue_invoices.map((inv: any) => (
                                    <div key={inv.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-rose-200 transition-all">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{inv.id}</p>
                                            <p className="text-sm font-bold text-slate-800">{inv.client}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-rose-600">{formatCurrency(inv.amount)}</p>
                                            <p className="text-[10px] items-center flex justify-end font-bold text-rose-400">
                                                <Clock className="w-3 h-3 mr-1" /> {t("overdue")} {inv.days}d
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dept Spending */}
                        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                            <h4 className="text-lg font-black text-slate-900 mb-6">{t("dept_spending")}</h4>
                            <div className="flex items-center">
                                <div className="w-1/2 h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats?.dept_spending || []}
                                                innerRadius={45}
                                                outerRadius={65}
                                                paddingAngle={8}
                                                dataKey="value"
                                            >
                                                {(stats?.dept_spending || []).map((entry: any, index: any) => (
                                                    <Cell key={`cell-${index}`} fill={
                                                        entry.name === 'logistics' ? "#6366f1" : 
                                                        entry.name === 'inventory' ? "#f59e0b" : 
                                                        "#10b981"
                                                    } />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-1/2 space-y-3">
                                    {(stats?.dept_spending || []).map((item: any) => (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: 
                                                    item.name === 'logistics' ? "#6366f1" : 
                                                    item.name === 'inventory' ? "#f59e0b" : 
                                                    "#10b981" 
                                                }}></div>
                                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{t(item.name)}</span>
                                            </div>
                                            <span className="text-xs font-black text-slate-900">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: HR & Operations Module */}
                <div className="space-y-8">
                    {/* Headcount Card */}
                    <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-2xl shadow-indigo-100 flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Users className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">{t("total_headcount")}</p>
                            <h3 className="text-5xl font-black mt-2 tracking-tighter">{stats?.total_personnel || "0"}</h3>
                            <p className="text-sm font-medium mt-4 text-indigo-100 flex items-center">
                                <ArrowUpRight className="w-4 h-4 mr-1 text-emerald-400" />
                                <span className="font-black text-emerald-400">+2</span> and growing this month
                            </p>
                        </div>
                        <div className="pt-6 relative z-10">
                            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-white w-[75%] h-full rounded-full shadow-sm"></div>
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-black uppercase text-indigo-200">
                                <span>{t("recruitment_target")}</span>
                                <span>75%</span>
                            </div>
                        </div>
                    </div>

                    {/* Payroll Overview */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm group">
                        <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center justify-between">
                            {t("payroll_budget")}
                            <HelpCircle className="w-4 h-4 text-slate-300" />
                        </h4>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase">{t("monthly_payroll")}</p>
                                    <p className="text-lg font-black text-indigo-600">{formatCurrency(stats?.payroll_budget)}</p>
                                </div>
                                <div className="w-full bg-slate-50 h-3 rounded-xl overflow-hidden border border-slate-100">
                                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">{t("avg_salary")}</p>
                                    <p className="text-sm font-black text-slate-900">$3.0k</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">{t("overtime")}</p>
                                    <p className="text-sm font-black text-amber-600">$1.2k</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance/Leave Rates */}
                    <div className="bg-slate-900 p-8 rounded-[32px] text-white overflow-hidden relative shadow-2xl shadow-indigo-50">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent"></div>
                        <h4 className="text-lg font-black mb-6 relative z-10">{t("attendance")}</h4>
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mr-4 backdrop-blur-md">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">{t("attendance_rate")}</p>
                                        <p className="text-lg font-black">94.8%</p>
                                    </div>
                                </div>
                                <TrendingUp className="w-8 h-8 text-emerald-500/30" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mr-4 backdrop-blur-md">
                                        <Zap className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">{t("leave_rate")}</p>
                                        <p className="text-lg font-black">3.2%</p>
                                    </div>
                                </div>
                                <TrendingDown className="w-8 h-8 text-amber-500/30" />
                            </div>
                        </div>
                        <button className="w-full mt-8 py-4 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl shadow-white/5">
                            {t("view_hr")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, mainValue, subValue, icon, color, trend, trendDown }: any) {
    const colorVariants: any = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
    };

    return (
        <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-5">
                <div className={`p-3 rounded-2xl ${colorVariants[color]} border shadow-sm group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center text-[10px] font-black px-2 py-1 rounded-lg ${trendDown ? 'text-rose-600 bg-rose-50 border border-rose-100' : 'text-emerald-600 bg-emerald-50 border border-emerald-100'}`}>
                        {trendDown ? <ArrowDownRight className="w-3 h-3 mr-0.5" /> : <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                <h4 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{mainValue}</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-1">{subValue}</p>
            </div>
        </div>
    );
}
