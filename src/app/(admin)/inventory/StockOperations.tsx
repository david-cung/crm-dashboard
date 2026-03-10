"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Package, Warehouse, QrCode, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Info, Search, CheckCircle2 } from "lucide-react";

const API_ROOT = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface StockOperationModalProps {
    type: "IN" | "OUT" | "TRANSFER" | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function StockOperationModal({ type, onClose, onSuccess }: StockOperationModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        item_id: "",
        warehouse_id: "",
        from_warehouse_id: "",
        to_warehouse_id: "",
        quantity: 1,
        reference: "",
        notes: ""
    });

    useEffect(() => {
        if (type) {
            fetchData();
        }
    }, [type]);

    const fetchData = async () => {
        try {
            const [itemsRes, whRes] = await Promise.all([
                fetch(`${API_ROOT}/inventory/items`),
                fetch(`${API_ROOT}/inventory/warehouses`)
            ]);
            setItems(await itemsRes.json());
            const whData = await whRes.json();
            setWarehouses(whData);

            if (whData.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    warehouse_id: whData[0].id.toString(),
                    from_warehouse_id: whData[0].id.toString(),
                    to_warehouse_id: whData.length > 1 ? whData[1].id.toString() : whData[0].id.toString()
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!type) return null;

    const opConfig = {
        IN: { title: "Nhập sản phẩm", icon: ArrowDownLeft, color: "bg-emerald-600", text: "Tăng tồn kho thực tế cho sản phẩm được chọn." },
        OUT: { title: "Xuất sản phẩm", icon: ArrowUpRight, color: "bg-rose-600", text: "Giảm lượng tồn kho khi xuất bán hoặc hủy hàng." },
        TRANSFER: { title: "Điều chuyển kho", icon: ArrowRightLeft, color: "bg-indigo-600", text: "Di chuyển hàng hóa giữa các kho nội bộ." }
    }[type];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const endpoint = type === "TRANSFER" ? "/inventory/transfers" : "/inventory/transactions";
            const payload = type === "TRANSFER" ? {
                item_id: Number(formData.item_id),
                from_warehouse_id: Number(formData.from_warehouse_id),
                to_warehouse_id: Number(formData.to_warehouse_id),
                quantity: Number(formData.quantity)
            } : {
                item_id: Number(formData.item_id),
                warehouse_id: Number(formData.warehouse_id),
                transaction_type: type,
                quantity: type === "OUT" ? -Math.abs(Number(formData.quantity)) : Math.abs(Number(formData.quantity)),
                reference: formData.reference,
                notes: formData.notes
            };

            const res = await fetch(`${API_ROOT}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Giao dịch thất bại");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredItems = items.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                <div className={`p-8 border-b border-white/10 flex items-center justify-between text-white ${opConfig.color}`}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <opConfig.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight">{opConfig.title}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-0.5">Thực hiện giao dịch kho</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
                        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{opConfig.text}</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-2xl flex items-center gap-3">
                            <Info className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Chọn sản phẩm *</label>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <select
                                    required
                                    value={formData.item_id}
                                    onChange={e => setFormData({ ...formData, item_id: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">-- Chọn sản phẩm trong kho --</option>
                                    {items.map(item => (
                                        <option key={item.id} value={item.id.toString()}>
                                            {item.sku} - {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {type !== "TRANSFER" ? (
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Nhà kho thực hiện</label>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-slate-100 rounded-2xl">
                                        <Warehouse className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <select
                                        value={formData.warehouse_id}
                                        onChange={e => setFormData({ ...formData, warehouse_id: e.target.value })}
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold text-slate-700"
                                    >
                                        {warehouses.map(wh => (
                                            <option key={wh.id} value={wh.id.toString()}>{wh.name} ({wh.code})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Từ kho</label>
                                    <select
                                        value={formData.from_warehouse_id}
                                        onChange={e => setFormData({ ...formData, from_warehouse_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        {warehouses.map(wh => (
                                            <option key={wh.id} value={wh.id.toString()}>{wh.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Đến kho</label>
                                    <select
                                        value={formData.to_warehouse_id}
                                        onChange={e => setFormData({ ...formData, to_warehouse_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        {warehouses.map(wh => (
                                            <option key={wh.id} value={wh.id.toString()}>{wh.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Số lượng *</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Tham chiếu</label>
                                <input
                                    type="text"
                                    placeholder="Mã PO, SO, GRN..."
                                    value={formData.reference}
                                    onChange={e => setFormData({ ...formData, reference: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Ghi chú</label>
                            <input
                                type="text"
                                placeholder="..."
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-[2] py-4 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${opConfig.color} hover:brightness-110`}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác nhận giao dịch"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
