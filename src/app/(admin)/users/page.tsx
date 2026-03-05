"use client";

import { useEffect, useState } from "react";
import {
    Users,
    UserPlus,
    Search,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    MoreVertical,
    Filter,
    Loader2,
    X,
    CheckCircle2,
    ShieldCheck
} from "lucide-react";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/users`;

interface Employee {
    id: number;
    email: string;
    full_name: string;
    is_active: boolean;
    is_superuser: boolean;
    phone_number?: string;
    department?: string;
    position?: string;
    join_date?: string;
    avatar_url?: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        email: "",
        full_name: "",
        password: "",
        phone_number: "",
        department: "Operations",
        position: "Staff",
        user_type: "MOBILE_APP"
    });

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/`);
            const data = await res.json();
            setEmployees(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(emp =>
        emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmployee.phone_number) {
            alert("Số điện thoại là bắt buộc!");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEmployee)
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                setNewEmployee({
                    email: "",
                    full_name: "",
                    password: "",
                    phone_number: "",
                    department: "Operations",
                    position: "Staff",
                    user_type: "MOBILE_APP"
                });
                fetchEmployees();
            } else {
                const error = await res.json();
                alert(error.detail || "Có lỗi xảy ra");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto relative">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Nhân sự</h1>
                    <p className="text-sm text-slate-500 mt-1">Danh bạ nhân viên và quản lý hồ sơ nội bộ.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-indigo-100"
                >
                    <UserPlus className="w-4 h-4" />
                    <span className="font-semibold text-sm">Thêm Nhân viên</span>
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng nhân sự</p>
                    <h3 className="text-2xl font-black text-slate-900">{employees.length}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Đang hoạt động</p>
                    <h3 className="text-2xl font-black text-emerald-600">{employees.filter(e => e.is_active).length}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bộ phận</p>
                    <h3 className="text-2xl font-black text-indigo-600">{new Set(employees.map(e => e.department)).size}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Quản trị viên</p>
                    <h3 className="text-2xl font-black text-orange-600">{employees.filter(e => e.is_superuser).length}</h3>
                </div>
            </div>

            {/* toolbar */}
            <div className="flex space-x-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email hoặc phòng ban..."
                        className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-4 py-2 bg-slate-50 rounded-xl text-slate-600 text-sm font-semibold flex items-center space-x-2 border border-slate-100">
                    <Filter className="w-4 h-4" />
                    <span>Bộ lọc</span>
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-400" />
                    </div>
                ) : filteredEmployees.map((employee) => (
                    <div key={employee.id} className="bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-100 relative">
                                    {employee.full_name?.charAt(0) || "U"}
                                    {employee.is_active && (
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    {employee.is_superuser && (
                                        <div className="bg-orange-50 text-orange-600 p-1.5 rounded-lg border border-orange-100" title="Superuser">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                    )}
                                    <button className="text-slate-400 hover:text-slate-600">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {employee.full_name || "Chưa cập nhật tên"}
                                </h3>
                                <p className="text-sm font-medium text-slate-400 flex items-center">
                                    <Briefcase className="w-3.5 h-3.5 mr-2" />
                                    {employee.position || "Nhân viên"} • {employee.department || "Operations"}
                                </p>
                            </div>

                            <div className="mt-6 space-y-3 pt-6 border-t border-slate-50">
                                <div className="flex items-center text-sm text-slate-600">
                                    <Mail className="w-4 h-4 mr-3 text-slate-400" />
                                    <span className="truncate">{employee.email}</span>
                                </div>
                                <div className="flex items-center text-sm text-slate-600">
                                    <Phone className="w-4 h-4 mr-3 text-slate-400" />
                                    {employee.phone_number || "Chưa cập nhật SĐT"}
                                </div>
                                <div className="flex items-center text-sm text-slate-400">
                                    <Calendar className="w-4 h-4 mr-3 text-slate-300" />
                                    Gia nhập: {employee.join_date ? new Date(employee.join_date).toLocaleDateString() : "Chưa rõ"}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Employee Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Thêm Nhân viên mới</h2>
                                <p className="text-xs text-slate-500 font-medium">Tạo tài khoản và phân quyền hệ thống.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors shadow-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddEmployee} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">Họ và tên</label>
                                    <input
                                        required
                                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900"
                                        placeholder="Nguyễn Văn A"
                                        value={newEmployee.full_name}
                                        onChange={e => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">Số điện thoại *</label>
                                    <input
                                        required
                                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900"
                                        placeholder="09xxx..."
                                        value={newEmployee.phone_number}
                                        onChange={e => setNewEmployee({ ...newEmployee, phone_number: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">Email đăng nhập</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900"
                                    placeholder="email@company.com"
                                    value={newEmployee.email}
                                    onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">Mật khẩu tạm thời</label>
                                <input
                                    required
                                    type="password"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900"
                                    placeholder="••••••••"
                                    value={newEmployee.password}
                                    onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">Phòng ban</label>
                                    <select
                                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900"
                                        value={newEmployee.department}
                                        onChange={e => setNewEmployee({ ...newEmployee, department: e.target.value })}
                                    >
                                        <option value="Operations">Vận hành (Operations)</option>
                                        <option value="Engineering">Kỹ thuật (Engineering)</option>
                                        <option value="Sales">Kinh doanh (Sales)</option>
                                        <option value="Warehouse">Kho bãi (Warehouse)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">Phân quyền</label>
                                    <select
                                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900"
                                        value={newEmployee.user_type}
                                        onChange={e => setNewEmployee({ ...newEmployee, user_type: e.target.value as any })}
                                    >
                                        <option value="WEB_ADMIN">Quản trị Web (Web Admin)</option>
                                        <option value="MOBILE_APP">Nhân viên App (Mobile App)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                                    <span>Tạo tài khoản</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
