"use client";

import { useEffect, useState } from "react";
import {
    Boxes,
    Package,
    AlertTriangle,
    Plus,
    Search,
    Filter,
    Loader2,
    X,
    Pencil,
    Trash2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/inventory`;

interface InventoryItem {
    id: number;
    sku: string;
    name: string;
    description?: string;
    quantity: number;
    min_quantity: number;
    unit_price: number;
    category?: string;
}

const emptyForm = {
    sku: "",
    name: "",
    quantity: 0,
    min_quantity: 0,
    category: "",
    unit_price: 0,
};

export default function InventoryPage() {
    const { t } = useI18n();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Create modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newItem, setNewItem] = useState({ ...emptyForm });
    const [isCreating, setIsCreating] = useState(false);

    // Edit modal
    const [editItem, setEditItem] = useState<InventoryItem | null>(null);
    const [editForm, setEditForm] = useState({ ...emptyForm });
    const [isEditing, setIsEditing] = useState(false);

    // Delete confirm
    const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Error / success toast
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchItems = async () => {
        try {
            const res = await fetch(`${API_BASE}/`);
            const data = await res.json();
            setItems(data);
            setFilteredItems(data);
        } catch (err) {
            console.error(err);
            showToast("error", "Không thể tải dữ liệu kho hàng.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        const q = searchQuery.toLowerCase();
        setFilteredItems(
            q
                ? items.filter(
                    (i) =>
                        i.sku.toLowerCase().includes(q) ||
                        i.name.toLowerCase().includes(q)
                )
                : items
        );
    }, [searchQuery, items]);

    /* ── CREATE ── */
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await fetch(`${API_BASE}/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newItem),
            });
            if (res.ok) {
                setIsCreateOpen(false);
                setNewItem({ ...emptyForm });
                await fetchItems();
                showToast("success", "Thêm sản phẩm thành công!");
            } else {
                const err = await res.json();
                showToast("error", err.detail ?? "Tạo thất bại.");
            }
        } catch {
            showToast("error", "Lỗi kết nối server.");
        } finally {
            setIsCreating(false);
        }
    };

    /* ── EDIT ── */
    const openEdit = (item: InventoryItem) => {
        setEditItem(item);
        setEditForm({
            sku: item.sku,
            name: item.name,
            quantity: item.quantity,
            min_quantity: item.min_quantity,
            category: item.category ?? "",
            unit_price: item.unit_price,
        });
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editItem) return;
        setIsEditing(true);
        try {
            const res = await fetch(`${API_BASE}/${editItem.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                setEditItem(null);
                await fetchItems();
                showToast("success", "Cập nhật thành công!");
            } else {
                const err = await res.json();
                showToast("error", err.detail ?? "Cập nhật thất bại.");
            }
        } catch {
            showToast("error", "Lỗi kết nối server.");
        } finally {
            setIsEditing(false);
        }
    };

    /* ── DELETE ── */
    const handleDelete = async () => {
        if (!deleteItem) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`${API_BASE}/${deleteItem.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setDeleteItem(null);
                await fetchItems();
                showToast("success", "Đã xóa sản phẩm!");
            } else {
                showToast("error", "Xóa thất bại.");
            }
        } catch {
            showToast("error", "Lỗi kết nối server.");
        } finally {
            setIsDeleting(false);
        }
    };

    /* ── FORM FIELDS helper ── */
    const FormField = ({
        label,
        children,
    }: {
        label: string;
        children: React.ReactNode;
    }) => (
        <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">
                {label}
            </label>
            {children}
        </div>
    );

    const inputCls =
        "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all ${toast.type === "success"
                            ? "bg-emerald-600 text-white"
                            : "bg-rose-600 text-white"
                        }`}
                >
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {t("inventory")}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Theo dõi và quản lý tồn kho của bạn.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-lg shadow-indigo-100"
                >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium text-sm">{t("add_item")}</span>
                </button>
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Search & Filter bar */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between space-x-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm theo SKU hoặc tên sản phẩm..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                    <button className="flex items-center space-x-2 text-slate-600 text-sm font-medium px-4 py-2 hover:bg-slate-50 rounded-lg">
                        <Filter className="w-4 h-4" />
                        <span>Bộ lọc</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                <th className="px-6 py-4">SKU & Sản phẩm</th>
                                <th className="px-6 py-4">Danh mục</th>
                                <th className="px-6 py-4">Tồn kho</th>
                                <th className="px-6 py-4">Đơn giá</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center text-slate-400"
                                    >
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center text-slate-400"
                                    >
                                        Không tìm thấy sản phẩm nào.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        {/* SKU & Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">
                                                        {item.sku}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {item.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Category */}
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {item.category ?? "—"}
                                        </td>
                                        {/* Stock */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-bold text-slate-900">
                                                    {item.quantity}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    / {item.min_quantity} min
                                                </span>
                                            </div>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.quantity <
                                                            item.min_quantity
                                                            ? "bg-rose-500"
                                                            : "bg-emerald-500"
                                                        }`}
                                                    style={{
                                                        width: `${Math.min(
                                                            (item.quantity /
                                                                (item.min_quantity ||
                                                                    1)) *
                                                            100,
                                                            100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        {/* Unit price */}
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            ${item.unit_price.toLocaleString()}
                                        </td>
                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            {item.quantity < item.min_quantity ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wider">
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    Sắp hết
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                                                    Đủ hàng
                                                </span>
                                            )}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    title="Sửa"
                                                    className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setDeleteItem(item)
                                                    }
                                                    title="Xóa"
                                                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── CREATE MODAL ── */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-xl text-slate-900">
                                Thêm sản phẩm mới
                            </h3>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="SKU Code">
                                    <input
                                        required
                                        value={newItem.sku}
                                        onChange={(e) =>
                                            setNewItem({
                                                ...newItem,
                                                sku: e.target.value,
                                            })
                                        }
                                        className={inputCls}
                                        placeholder="SKU-001"
                                    />
                                </FormField>
                                <FormField label="Tên sản phẩm">
                                    <input
                                        required
                                        value={newItem.name}
                                        onChange={(e) =>
                                            setNewItem({
                                                ...newItem,
                                                name: e.target.value,
                                            })
                                        }
                                        className={inputCls}
                                        placeholder="Tên sản phẩm"
                                    />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Tồn kho hiện tại">
                                    <input
                                        type="number"
                                        required
                                        value={newItem.quantity}
                                        onChange={(e) =>
                                            setNewItem({
                                                ...newItem,
                                                quantity: parseInt(e.target.value),
                                            })
                                        }
                                        className={inputCls}
                                    />
                                </FormField>
                                <FormField label="Mức cảnh báo tối thiểu">
                                    <input
                                        type="number"
                                        required
                                        value={newItem.min_quantity}
                                        onChange={(e) =>
                                            setNewItem({
                                                ...newItem,
                                                min_quantity: parseInt(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className={inputCls}
                                    />
                                </FormField>
                            </div>
                            <FormField label="Danh mục">
                                <input
                                    required
                                    value={newItem.category}
                                    onChange={(e) =>
                                        setNewItem({
                                            ...newItem,
                                            category: e.target.value,
                                        })
                                    }
                                    className={inputCls}
                                    placeholder="VD: Năng lượng, Camera..."
                                />
                            </FormField>
                            <FormField label="Đơn giá ($)">
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={newItem.unit_price}
                                    onChange={(e) =>
                                        setNewItem({
                                            ...newItem,
                                            unit_price: parseFloat(e.target.value),
                                        })
                                    }
                                    className={inputCls}
                                />
                            </FormField>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl mt-2 hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
                            >
                                {isCreating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Lưu sản phẩm"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── EDIT MODAL ── */}
            {editItem && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-xl text-slate-900">
                                    Chỉnh sửa sản phẩm
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    ID: #{editItem.id}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditItem(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="SKU Code">
                                    <input
                                        required
                                        value={editForm.sku}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                sku: e.target.value,
                                            })
                                        }
                                        className={inputCls}
                                    />
                                </FormField>
                                <FormField label="Tên sản phẩm">
                                    <input
                                        required
                                        value={editForm.name}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                name: e.target.value,
                                            })
                                        }
                                        className={inputCls}
                                    />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Tồn kho">
                                    <input
                                        type="number"
                                        required
                                        value={editForm.quantity}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                quantity: parseInt(e.target.value),
                                            })
                                        }
                                        className={inputCls}
                                    />
                                </FormField>
                                <FormField label="Mức cảnh báo tối thiểu">
                                    <input
                                        type="number"
                                        required
                                        value={editForm.min_quantity}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                min_quantity: parseInt(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className={inputCls}
                                    />
                                </FormField>
                            </div>
                            <FormField label="Danh mục">
                                <input
                                    value={editForm.category}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            category: e.target.value,
                                        })
                                    }
                                    className={inputCls}
                                />
                            </FormField>
                            <FormField label="Đơn giá ($)">
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={editForm.unit_price}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            unit_price: parseFloat(e.target.value),
                                        })
                                    }
                                    className={inputCls}
                                />
                            </FormField>
                            <div className="flex space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditItem(null)}
                                    className="flex-1 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isEditing}
                                    className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-60"
                                >
                                    {isEditing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Lưu thay đổi"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── DELETE CONFIRM DIALOG ── */}
            {deleteItem && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 flex flex-col items-center text-center space-y-4">
                            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
                                <Trash2 className="w-7 h-7 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-slate-900">
                                    Xác nhận xóa
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Bạn có chắc muốn xóa sản phẩm{" "}
                                    <span className="font-bold text-slate-800">
                                        {deleteItem.name}
                                    </span>{" "}
                                    ({deleteItem.sku})?
                                    <br />
                                    Hành động này không thể hoàn tác.
                                </p>
                            </div>
                            <div className="flex w-full space-x-3 pt-2">
                                <button
                                    onClick={() => setDeleteItem(null)}
                                    className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 bg-rose-600 text-white font-bold py-2.5 rounded-xl hover:bg-rose-700 transition-colors flex items-center justify-center disabled:opacity-60"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Xóa"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
