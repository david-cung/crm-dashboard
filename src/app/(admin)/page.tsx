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
    TrendingDown
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
    Cell
} from "recharts";
import { useI18n } from "@/lib/i18n";

const INVENTORY_DATA = [
    { name: "Mon", stock: 400 },
    { name: "Tue", stock: 300 },
    { name: "Wed", stock: 500 },
    { name: "Thu", stock: 280 },
    { name: "Fri", stock: 590 },
    { name: "Sat", stock: 320 },
    { name: "Sun", stock: 480 },
];

const PROJECT_STATUS = [
    { name: "Completed", value: 45, color: "#10b981" },
    { name: "Ongoing", value: 30, color: "#3b82f6" },
    { name: "Delayed", value: 15, color: "#f59e0b" },
    { name: "Cancelled", value: 10, color: "#ef4444" },
];

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        fetch("http://localhost:8000/api/v1/dashboard/summary")
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    }, []);

    const { t } = useI18n();

    if (!mounted) return null;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-indigo-700 to-violet-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">{t("welcome")}</h1>
                    <p className="text-indigo-100 max-w-md">{t("welcome_msg")}</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Personnel" value={stats?.total_personnel || "..."} change="+0%" trend="up" icon={<Users className="w-6 h-6" />} color="indigo" />
                <StatCard title="Inventory SKU" value={stats?.total_inventory_sku || "..."} change="+0%" trend="up" icon={<Boxes className="w-6 h-6" />} color="emerald" />
                <StatCard title="Active Shipments" value={stats?.active_shipments || "..."} change="+0%" trend="up" icon={<Truck className="w-6 h-6" />} color="blue" />
                <StatCard title="Incident Rate" value={stats?.incident_rate || "..."} change="+0%" trend="up" icon={<AlertCircle className="w-6 h-6" />} color="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inventory Analytics */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-900">Stock Movements</h3>
                        <select className="text-sm border-none bg-slate-100 rounded-lg px-3 py-1 outline-none text-slate-900">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={INVENTORY_DATA}>
                                <defs>
                                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                                />
                                <Area type="monotone" dataKey="stock" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorStock)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Project Pipeline */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">Project Pipeline</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={PROJECT_STATUS}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {PROJECT_STATUS.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                        {PROJECT_STATUS.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-slate-600">{item.name}</span>
                                </div>
                                <span className="font-bold text-slate-900">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, trend, icon, color }: any) {
    const colorMap: any = {
        indigo: "text-indigo-600 bg-indigo-50",
        emerald: "text-emerald-600 bg-emerald-50",
        blue: "text-blue-600 bg-blue-50",
        rose: "text-rose-600 bg-rose-50",
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorMap[color]}`}>{icon}</div>
                <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{change}</span>
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
            </div>
        </div>
    );
}
