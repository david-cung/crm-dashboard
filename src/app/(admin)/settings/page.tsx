"use client";

import { useState, useEffect } from "react";
import {
    Settings,
    Save,
    Bell,
    Shield,
    Building2,
    Target,
    Smartphone,
    Database,
    Globe,
    AlertTriangle,
    CheckCircle2,
    Loader2
} from "lucide-react";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/settings`;

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [settings, setSettings] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const tabs = [
        { id: "general", name: "Cấu hình chung", icon: Building2 },
        { id: "rules", name: "Quy tắc nghiệp vụ", icon: Target },
        { id: "notifications", name: "Thông báo", icon: Bell },
        { id: "system", name: "Hệ thống", icon: Database },
    ];

    useEffect(() => {
        fetchSettings();
    }, [activeTab]);

    const fetchSettings = async () => {
        try {
            const categoryMap: Record<string, string> = {
                general: "general",
                rules: "kpi",
                notifications: "notification",
                system: "system"
            };
            const res = await fetch(`${API_BASE}/?category=${categoryMap[activeTab]}`);
            const data = await res.json();
            setSettings(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (key: string, value: any) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    };

    const saveSettings = async () => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });
        try {
            // In a real app, we might send them one by one or have a bulk update
            const body: Record<string, string> = {};
            settings.forEach(s => body[s.key] = s.value);

            const res = await fetch(`${API_BASE}/batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setMessage({ type: "success", text: "Đã lưu cấu hình thành công!" });
            } else {
                setMessage({ type: "error", text: "Có lỗi xảy ra khi lưu." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Lỗi kết nối máy chủ." });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Settings className="w-8 h-8 text-indigo-600" />
                        Cài đặt hệ thống
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Cấu hình tham số vận hành và quy tắc ERP.</p>
                </div>
                <button
                    onClick={saveSettings}
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>Lưu cấu hình</span>
                </button>
            </div>

            {/* Status Message */}
            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center space-x-3 border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span className="font-bold text-sm">{message.text}</span>
                </div>
            )}

            <div className="flex gap-8">
                {/* Tabs Sidebar */}
                <div className="w-72 space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === tab.id
                                ? "bg-white text-indigo-600 shadow-lg shadow-indigo-50 border border-indigo-50"
                                : "text-slate-500 hover:bg-white/50"
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400"}`} />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm min-h-[600px]">
                    <div className="mb-8">
                        <h2 className="text-xl font-black text-slate-900">{tabs.find(t => t.id === activeTab)?.name}</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">Điều chỉnh các tham số dưới đây để thay đổi hành vi hệ thống.</p>
                    </div>

                    <div className="space-y-8">
                        {activeTab === "general" && (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Tên công ty hiển thị</label>
                                    <input
                                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Tên công ty..."
                                        value={settings.find(s => s.key === "company_name")?.value || "Antigravity ERP Solution"}
                                        onChange={(e) => handleUpdate("company_name", e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Ngôn ngữ mặc định</label>
                                        <select className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500">
                                            <option>Tiếng Việt</option>
                                            <option>English</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Tiền tệ</label>
                                        <select className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500">
                                            <option>VND (₫)</option>
                                            <option>USD ($)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "rules" && (
                            <div className="space-y-10">
                                <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex items-start space-x-4">
                                    <Target className="w-6 h-6 text-indigo-600 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-indigo-900">Quy tắc tính điểm KPI</h4>
                                        <p className="text-xs text-indigo-700/70 mt-0.5 font-medium">Các chỉ số này sẽ áp dụng ngay lập tức cho các hành động trên hệ thống.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl group hover:bg-slate-100 transition-colors">
                                        <div>
                                            <h5 className="font-bold text-slate-900">Điểm hoàn thành Dự án</h5>
                                            <p className="text-xs text-slate-400 font-medium">Tự động cộng khi trạng thái dự án chuyển sang DONE.</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="number"
                                                className="w-24 bg-white border-2 border-slate-100 rounded-xl px-4 py-2 text-center font-black text-indigo-600 focus:border-indigo-500 outline-none"
                                                value={settings.find(s => s.key === "kpi_project_done_points")?.value || "100"}
                                                onChange={(e) => handleUpdate("kpi_project_done_points", e.target.value)}
                                            />
                                            <span className="text-xs font-bold text-slate-400 uppercase">Pts</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl group hover:bg-slate-100 transition-colors">
                                        <div>
                                            <h5 className="font-bold text-slate-900">Điểm giao hàng thành công</h5>
                                            <p className="text-xs text-slate-400 font-medium">Cộng cho nhân viên vận chuyển khi đơn hàng DELIVERED.</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="number"
                                                className="w-24 bg-white border-2 border-slate-100 rounded-xl px-4 py-2 text-center font-black text-indigo-600 focus:border-indigo-500 outline-none"
                                                value={settings.find(s => s.key === "kpi_shipment_delivered_points")?.value || "50"}
                                                onChange={(e) => handleUpdate("kpi_shipment_delivered_points", e.target.value)}
                                            />
                                            <span className="text-xs font-bold text-slate-400 uppercase">Pts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 active:scale-95 transition-transform">
                                            <Smartphone className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-900">Push Notification (Mobile)</h5>
                                            <p className="text-xs text-slate-400 font-medium">Gửi thông báo tới app khi có dự án mới.</p>
                                        </div>
                                    </div>
                                    <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 active:scale-95 transition-transform">
                                            <Globe className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-900">Email Alerts</h5>
                                            <p className="text-xs text-slate-400 font-medium">Thông báo qua email cho Admin khi tồn kho thấp.</p>
                                        </div>
                                    </div>
                                    <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-pointer transition-colors">
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "system" && (
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-8 bg-slate-900 rounded-[32px] text-white flex flex-col justify-between min-h-[240px] shadow-2xl shadow-indigo-100">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <Database className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black tracking-tight">Cơ sở dữ liệu</h4>
                                        <p className="text-xs text-slate-400 font-medium mt-1">Kết nối: PostgreSQL 15 (erp-db)</p>
                                        <div className="mt-4 flex space-x-2">
                                            <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">Connected</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 bg-indigo-600 rounded-[32px] text-white flex flex-col justify-between min-h-[240px] shadow-2xl shadow-indigo-100">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <Shield className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black tracking-tight">MinIO Storage</h4>
                                        <p className="text-xs text-indigo-200 font-medium mt-1">Dung lượng sử dụng: 24.5 GB / 100 GB</p>
                                        <div className="mt-4 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-white w-[25%] h-full rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
