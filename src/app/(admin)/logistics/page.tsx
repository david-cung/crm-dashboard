"use client";

import { useEffect, useState } from "react";
import { Truck, AlertTriangle, MapPin, Search, Calendar, ChevronRight, Loader2, Plus, X, Ship, Clock, CheckCircle2 } from "lucide-react";

export default function LogisticsPage() {
    const [shipments, setShipments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<any>(null);

    // Form States
    const [newShipment, setNewShipment] = useState({
        tracking_number: "",
        origin: "",
        destination: "",
        status: "PENDING",
        estimated_arrival: ""
    });

    const [newIncident, setNewIncident] = useState({
        description: "",
        incident_type: "Delay"
    });

    const fetchShipments = () => {
        setIsLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/logistics/`)
            .then(res => res.json())
            .then(data => {
                setShipments(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchShipments();
    }, []);

    const handleCreateShipment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/logistics/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newShipment)
            });
            if (res.ok) {
                setIsCreateModalOpen(false);
                fetchShipments();
                setNewShipment({ tracking_number: "", origin: "", destination: "", status: "PENDING", estimated_arrival: "" });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/logistics/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchShipments();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReportIncident = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShipment) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/logistics/incidents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newIncident, shipment_id: selectedShipment.id })
            });
            if (res.ok) {
                setIsIncidentModalOpen(false);
                fetchShipments();
                setNewIncident({ description: "", incident_type: "Delay" });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-slate-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-950">Logistics Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Real-time tracking and incident management for your global supply chain.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-all text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-indigo-200"
                >
                    <Plus className="w-5 h-5" />
                    New Shipment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tracking List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Tracking Number, Origin, or Destination..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 text-sm"
                        />
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Ship className="w-4 h-4 text-indigo-500" />
                                Active Shipments
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {isLoading ? (
                                <div className="p-12 text-center text-slate-400">
                                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-indigo-500" />
                                    <p className="font-medium">Syncing with logistics data...</p>
                                </div>
                            ) : shipments.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="font-medium text-slate-500">No active shipments found</p>
                                    <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="mt-4 text-indigo-600 text-sm font-semibold hover:underline"
                                    >
                                        Create your first shipment
                                    </button>
                                </div>
                            ) : shipments.map((s) => (
                                <div key={s.id} className="p-6 hover:bg-indigo-50/30 transition-all group">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className={`p-3 rounded-2xl shadow-sm ${s.status === "DELIVERED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                s.status === "PICKED_UP" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                    "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                                }`}>
                                                <Truck className="w-7 h-7" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-bold text-slate-900 text-lg">{s.tracking_number}</h4>
                                                    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${s.status === "DELIVERED" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                                        s.status === "CUSTOMS_CLEARANCE" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                            "bg-indigo-100 text-indigo-700 border-indigo-200"
                                                        }`}>
                                                        {s.status.replace("_", " ")}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm text-slate-500 mt-2 font-medium">
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{s.origin}</span>
                                                    <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{s.destination}</span>
                                                </div>
                                                {s.incidents?.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {s.incidents.map((inc: any) => (
                                                            <div key={inc.id} className="flex items-center gap-1.5 bg-red-50 text-red-700 text-[11px] font-bold px-2 py-1 rounded-lg border border-red-100">
                                                                <AlertTriangle className="w-3 h-3" />
                                                                {inc.incident_type}: {inc.description}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400 flex items-center justify-end font-medium">
                                                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                                                    ETA: {s.estimated_arrival ? new Date(s.estimated_arrival).toLocaleDateString() : "TBD"}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 text-slate-900"
                                                    value={s.status}
                                                    onChange={(e) => handleUpdateStatus(s.id, e.target.value)}
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="PICKED_UP">Picked Up</option>
                                                    <option value="IN_TRANSIT">In Transit</option>
                                                    <option value="CUSTOMS_CLEARANCE">Customs</option>
                                                    <option value="DELIVERED">Delivered</option>
                                                </select>
                                                <button
                                                    onClick={() => { setSelectedShipment(s); setIsIncidentModalOpen(true); }}
                                                    className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                                    title="Report Incident"
                                                >
                                                    <AlertTriangle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info - Incidents */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <AlertTriangle className="w-20 h-20 text-red-600" />
                        </div>
                        <div className="flex items-center space-x-2 text-red-600 mb-6 relative">
                            <AlertTriangle className="w-5 h-5" />
                            <h3 className="font-bold text-lg">Active Incidents</h3>
                        </div>
                        <div className="space-y-4 relative">
                            {shipments.filter(s => s.incidents?.length > 0).length === 0 ? (
                                <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-50" />
                                    <p className="text-xs font-semibold">No active incidents</p>
                                </div>
                            ) : shipments.flatMap(s => s.incidents.map((inc: any) => ({ ...inc, tracking: s.tracking_number }))).map((inc: any) => (
                                <div key={inc.id} className="bg-red-50/50 p-3 rounded-xl border border-red-100">
                                    <p className="text-xs font-bold text-slate-900">{inc.incident_type} - {inc.tracking}</p>
                                    <p className="text-[11px] text-slate-600 mt-1">{inc.description}</p>
                                    <p className="text-[10px] text-red-500 mt-2 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Reported: {new Date(inc.reported_at).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-950 p-7 rounded-3xl text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl group-hover:bg-indigo-600/30 transition-all"></div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-400" />
                            Geospatial Map
                        </h3>
                        <div className="aspect-square bg-slate-900 rounded-2xl flex flex-col items-center justify-center border border-slate-800 shadow-inner relative group cursor-crosshair">
                            <div className="absolute inset-0 bg-[radial-gradient(#2d3748_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
                            <MapPin className="w-10 h-10 text-indigo-400 animate-bounce relative z-10" />
                            <span className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest relative z-10">Real-time Data Stream</span>
                        </div>
                        <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all">
                            Expand Global Monitoring
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900">New Shipment</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateShipment} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Tracking Number</label>
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
                                    required
                                    value={newShipment.tracking_number}
                                    onChange={e => setNewShipment({ ...newShipment, tracking_number: e.target.value })}
                                    placeholder="e.g. SHIP-8822-HK"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Origin</label>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
                                        required
                                        value={newShipment.origin}
                                        onChange={e => setNewShipment({ ...newShipment, origin: e.target.value })}
                                        placeholder="City/Port"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Destination</label>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
                                        required
                                        value={newShipment.destination}
                                        onChange={e => setNewShipment({ ...newShipment, destination: e.target.value })}
                                        placeholder="City/Port"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Est. Arrival Date</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900"
                                    value={newShipment.estimated_arrival}
                                    onChange={e => setNewShipment({ ...newShipment, estimated_arrival: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all mt-4">
                                Create Shipment
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isIncidentModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-red-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-red-700">Report Incident</h3>
                                <p className="text-xs text-red-600/70 font-medium">Tracking: {selectedShipment?.tracking_number}</p>
                            </div>
                            <button onClick={() => setIsIncidentModalOpen(false)} className="p-2 hover:bg-red-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-red-500" />
                            </button>
                        </div>
                        <form onSubmit={handleReportIncident} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Incident Type</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 text-slate-900"
                                    value={newIncident.incident_type}
                                    onChange={e => setNewIncident({ ...newIncident, incident_type: e.target.value })}
                                >
                                    <option value="Delay">Delay</option>
                                    <option value="Damage">Damage</option>
                                    <option value="Customs Hold">Customs Hold</option>
                                    <option value="Missing Items">Missing Items</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 text-slate-900 placeholder:text-slate-400"
                                    rows={3}
                                    required
                                    value={newIncident.description}
                                    onChange={e => setNewIncident({ ...newIncident, description: e.target.value })}
                                    placeholder="Provide details about the issue..."
                                />
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-100 transition-all mt-4">
                                Report Incident
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
