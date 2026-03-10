"use client";

import { useState, useEffect } from "react";
import { X, Loader2, FileText, Plus, Trash2, Search, Package, DollarSign } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface CreatePOModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    suppliers: any[];
}

export function CreatePOModal({ isOpen, onClose, onSuccess, suppliers }: CreatePOModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);

    const [supplierId, setSupplierId] = useState("");
    const [warehouseId, setWarehouseId] = useState("");
    const [notes, setNotes] = useState("");
    const [lineItems, setLineItems] = useState<{ item_id: string; quantity: number; unit_price: number }[]>([
        { item_id: "", quantity: 1, unit_price: 0 },
    ]);

    useEffect(() => {
        if (isOpen) {
            Promise.all([
                fetch(`${API}/inventory/items`).then(r => r.json()),
                fetch(`${API}/inventory/warehouses`).then(r => r.json()),
            ]).then(([items, whs]) => {
                setInventoryItems(items);
                setWarehouses(whs);
                if (whs.length > 0) setWarehouseId(whs[0].id.toString());
                if (suppliers.length > 0) setSupplierId(suppliers[0].id.toString());
            }).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const addLine = () => setLineItems([...lineItems, { item_id: "", quantity: 1, unit_price: 0 }]);
    const removeLine = (idx: number) => setLineItems(lineItems.filter((_, i) => i !== idx));
    const updateLine = (idx: number, field: string, value: any) => {
        const updated = [...lineItems];
        (updated[idx] as any)[field] = value;

        // Auto-populate unit price from inventory item
        if (field === "item_id" && value) {
            const item = inventoryItems.find((i: any) => i.id.toString() === value);
            if (item) updated[idx].unit_price = item.unit_price;
        }

        setLineItems(updated);
    };

    const total = lineItems.reduce((a, l) => a + l.quantity * l.unit_price, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API}/procurement/purchase-orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supplier_id: Number(supplierId),
                    warehouse_id: Number(warehouseId),
                    notes,
                    items: lineItems.filter(l => l.item_id).map(l => ({
                        item_id: Number(l.item_id),
                        quantity: l.quantity,
                        unit_price: l.unit_price,
                    })),
                }),
            });
            if (!res.ok) throw new Error((await res.json()).detail || "Failed");
            onSuccess();
            onClose();
            setLineItems([{ item_id: "", quantity: 1, unit_price: 0 }]);
            setNotes("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-violet-600 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight">Tạo đơn mua hàng (PO)</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-0.5">Đặt hàng từ nhà cung cấp</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-2xl">{error}</div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Nhà cung cấp *</label>
                            <select required value={supplierId} onChange={e => setSupplierId(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-violet-500 outline-none font-bold text-slate-700">
                                <option value="">-- Chọn NCC --</option>
                                {suppliers.map(s => <option key={s.id} value={s.id.toString()}>{s.name} ({s.code})</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Nhận tại kho *</label>
                            <select required value={warehouseId} onChange={e => setWarehouseId(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-violet-500 outline-none font-bold text-slate-700">
                                {warehouses.map(w => <option key={w.id} value={w.id.toString()}>{w.name} ({w.code})</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Danh sách sản phẩm</label>
                            <button type="button" onClick={addLine}
                                className="flex items-center gap-1 text-violet-600 text-[10px] font-black uppercase hover:underline">
                                <Plus className="w-3 h-3" /> Thêm dòng
                            </button>
                        </div>

                        <div className="border border-slate-200 rounded-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Sản phẩm</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center w-24">SL</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right w-32">Đơn giá</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right w-32">Thành tiền</th>
                                        <th className="w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lineItems.map((line, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3">
                                                <select value={line.item_id} onChange={e => updateLine(idx, "item_id", e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-violet-500">
                                                    <option value="">Chọn SP...</option>
                                                    {inventoryItems.map((i: any) => (
                                                        <option key={i.id} value={i.id.toString()}>{i.sku} — {i.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input type="number" min="1" value={line.quantity} onChange={e => updateLine(idx, "quantity", Number(e.target.value))}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center font-bold outline-none focus:ring-1 focus:ring-violet-500" />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input type="number" step="0.01" value={line.unit_price} onChange={e => updateLine(idx, "unit_price", Number(e.target.value))}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-right font-bold outline-none focus:ring-1 focus:ring-violet-500" />
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-black text-slate-700">
                                                ${(line.quantity * line.unit_price).toLocaleString()}
                                            </td>
                                            <td className="px-2 py-3">
                                                {lineItems.length > 1 && (
                                                    <button type="button" onClick={() => removeLine(idx)} className="p-1 text-slate-300 hover:text-rose-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="px-4 py-4 bg-slate-50 flex justify-end border-t border-slate-100">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng giá trị PO</p>
                                    <p className="text-xl font-black text-violet-600 mt-1">${total.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Ghi chú</label>
                        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Yêu cầu thêm..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-violet-500" />
                    </div>

                    <div className="pt-6 flex gap-3">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                            Hủy bỏ
                        </button>
                        <button type="submit" disabled={isLoading}
                            className="flex-[2] py-4 bg-violet-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-100 flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tạo đơn mua hàng"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
