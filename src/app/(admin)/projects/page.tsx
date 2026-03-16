"use client";

import { useEffect, useState } from "react";
import {
    Sun,
    Calendar,
    MapPin,
    Plus,
    Search,
    Truck,
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreVertical,
    Zap,
    Users,
    Loader2,
    X,
    Filter
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/projects`;

interface Project {
    id: number;
    title: string;
    customer_name: string;
    status: "DRAFT" | "APPROVED" | "IN_PROGRESS" | "DONE" | "CANCELLED";
    created_at: string;
    scheduled_date?: string;
    location?: string;
    system_size_kwp: number;
    panel_count: number;
    inverter_type?: string;
    total_value: number;
}

const emptyForm = {
    title: "",
    customer_name: "",
    location: "",
    system_size_kwp: 0,
    panel_count: 0,
    inverter_type: "Standard Inverter",
    total_value: 0,
    status: "DRAFT"
};

export default function ProjectsPage() {
    const { t } = useI18n();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newProject, setNewProject] = useState({ ...emptyForm });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_BASE}/`);
            const data = await res.json();
            setProjects(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleUpdateStatus = async (projectId: number, newStatus: string) => {
        try {
            const res = await fetch(`${API_BASE}/${projectId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                await fetchProjects();
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProject),
            });
            if (res.ok) {
                setIsCreateOpen(false);
                setNewProject({ ...emptyForm });
                await fetchProjects();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "DONE": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "IN_PROGRESS": return "bg-blue-50 text-blue-600 border-blue-100";
            case "CANCELLED": return "bg-rose-50 text-rose-600 border-rose-100";
            case "APPROVED": return "bg-indigo-50 text-indigo-600 border-indigo-100";
            default: return "bg-slate-50 text-slate-600 border-slate-100";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "DONE": return <CheckCircle2 className="w-3 h-3 mr-1" />;
            case "IN_PROGRESS": return <Clock className="w-3 h-3 animate-pulse mr-1" />;
            case "APPROVED": return <Zap className="w-3 h-3 mr-1" />;
            default: return <AlertCircle className="w-3 h-3 mr-1" />;
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("projects")}</h1>
                    <p className="text-sm text-slate-500 mt-1">{t("projects_desc")}</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-indigo-100"
                >
                    <Plus className="w-4 h-4" />
                    <span className="font-semibold text-sm">{t("create_project")}</span>
                </button>
            </div>

            {/* Quick Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                        <Sun className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("total_capacity")}</p>
                        <h3 className="text-xl font-bold text-slate-900">{projects.reduce((sum, p) => sum + p.system_size_kwp, 0).toFixed(1)} kWp</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("running_projects")}</p>
                        <h3 className="text-xl font-bold text-slate-900">{projects.filter(p => p.status === "IN_PROGRESS").length} Projects</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("completed_systems")}</p>
                        <h3 className="text-xl font-bold text-slate-900">{projects.filter(p => p.status === "DONE").length} Systems</h3>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex space-x-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t("search_projects")}
                        className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
                    />
                </div>
                <button className="px-4 py-2 bg-slate-50 rounded-xl text-slate-600 text-sm font-semibold flex items-center space-x-2 border border-slate-100">
                    <Filter className="w-4 h-4" />
                    <span>{t("filter")}</span>
                </button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-400" />
                        <p className="text-slate-400 mt-4 font-medium">{t("loading_projects")}</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="col-span-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                        <Sun className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">{t("no_projects")}</h3>
                        <p className="text-slate-500 mt-1">{t("start_first_project")}</p>
                    </div>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col space-y-2">
                                        <div className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border w-fit ${getStatusStyle(project.status)}`}>
                                            {getStatusIcon(project.status)}
                                            {project.status}
                                        </div>
                                        <select
                                            className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 text-slate-900 outline-none"
                                            value={project.status}
                                            onChange={(e) => handleUpdateStatus(project.id, e.target.value)}
                                        >
                                            <option value="DRAFT">Draft</option>
                                            <option value="APPROVED">Approved</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="DONE">Done</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase leading-tight">
                                    {project.title}
                                </h3>

                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Users className="w-4 h-4 mr-3 text-slate-400" />
                                        <span className="font-semibold">{project.customer_name}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-500">
                                        <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                                        {project.location || "Chưa xác định"}
                                    </div>
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                                        {project.scheduled_date ? new Date(project.scheduled_date).toLocaleDateString() : "Chưa lên lịch"}
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t("capacity")}</p>
                                        <p className="text-sm font-black text-slate-900">{project.system_size_kwp} kWp</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t("value_label")}</p>
                                        <p className="text-sm font-black text-indigo-600">${project.total_value.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Project Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-2xl text-slate-900">{t("setup_project")}</h3>
                                <p className="text-sm text-slate-500 mt-1">{t("project_specs")}</p>
                            </div>
                            <button onClick={() => setIsCreateOpen(false)} className="bg-white p-2 rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t("project_title")}</label>
                                    <input
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                        placeholder="VD: Solar Home A1"
                                        value={newProject.title}
                                        onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t("customer_name_label")}</label>
                                    <input
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                        placeholder="Nguyễn Văn A"
                                        value={newProject.customer_name}
                                        onChange={e => setNewProject({ ...newProject, customer_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t("install_location")}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Địa chỉ hoặc Tọa độ GPS"
                                        value={newProject.location}
                                        onChange={e => setNewProject({ ...newProject, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase px-1">Công suất (kWp)</label>
                                    <input
                                        type="number" step="0.1"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                        value={newProject.system_size_kwp}
                                        onChange={e => setNewProject({ ...newProject, system_size_kwp: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase px-1">Tấm pin (Pcs)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newProject.panel_count}
                                        onChange={e => setNewProject({ ...newProject, panel_count: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1 space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase px-1">Tổng giá trị ($)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newProject.total_value}
                                        onChange={e => setNewProject({ ...newProject, total_value: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl mt-4 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2 disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        <span>{t("init_project")}</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
