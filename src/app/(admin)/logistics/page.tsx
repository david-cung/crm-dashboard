"use client";

import { useEffect, useState, useContext, createContext } from "react";
import { 
    Truck, AlertTriangle, MapPin, Search, Calendar, ChevronRight, 
    Loader2, Plus, X, Ship, Clock, CheckCircle2, Car, Users, ClipboardList, Map 
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function LogisticsPage() {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<"shipments" | "dispatch" | "fleet">("dispatch");
    const [isLoading, setIsLoading] = useState(true);

    const [shipments, setShipments] = useState<any[]>([]);
    const [trips, setTrips] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [pos, setPOs] = useState<any[]>([]);

    // Modals
    const [modalType, setModalType] = useState<"shipment" | "trip" | "vehicle" | "driver" | null>(null);

    // Forms
    const [newShipment, setNewShipment] = useState({ 
        tracking_number: "", 
        origin: "", 
        destination: "", 
        estimated_arrival: "",
        project_id: "",
        po_id: ""
    });
    const [newTrip, setNewTrip] = useState({ trip_number: "", vehicle_id: "", driver_id: "", route_summary: "" });
    const [newVehicle, setNewVehicle] = useState({ license_plate: "", vehicle_type: "", capacity_weight: 0 });
    const [newDriver, setNewDriver] = useState({ name: "", phone: "", license_type: "" });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [resS, resT, resV, resD, resP, resPO] = await Promise.all([
                fetch(`${API_URL}/logistics/`),
                fetch(`${API_URL}/logistics/trips`),
                fetch(`${API_URL}/logistics/vehicles`),
                fetch(`${API_URL}/logistics/drivers`),
                fetch(`${API_URL}/projects/`),
                fetch(`${API_URL}/procurement/purchase-orders`)
            ]);
            
            if(resS.ok) setShipments(await resS.json());
            if(resT.ok) setTrips(await resT.json());
            if(resV.ok) setVehicles(await resV.json());
            if(resD.ok) setDrivers(await resD.json());
            if(resP.ok) setProjects(await resP.json());
            if(resPO.ok) setPOs(await resPO.json());
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        let endpoint = "";
        let payload: any = {};

        if (modalType === "shipment") {
            endpoint = "/logistics/";
            payload = { 
                ...newShipment, 
                estimated_arrival: newShipment.estimated_arrival || null,
                project_id: newShipment.project_id ? parseInt(newShipment.project_id) : null,
                po_id: newShipment.po_id ? parseInt(newShipment.po_id) : null
            };
        } else if (modalType === "trip") {
            endpoint = "/logistics/trips";
            payload = { 
                ...newTrip, 
                vehicle_id: newTrip.vehicle_id ? parseInt(newTrip.vehicle_id) : null,
                driver_id: newTrip.driver_id ? parseInt(newTrip.driver_id) : null
            };
        } else if (modalType === "vehicle") {
            endpoint = "/logistics/vehicles";
            payload = newVehicle;
        } else if (modalType === "driver") {
            endpoint = "/logistics/drivers";
            payload = newDriver;
        }

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setModalType(null);
                fetchAllData();
                setNewShipment({ tracking_number: "", origin: "", destination: "", estimated_arrival: "", project_id: "", po_id: "" });
                setNewTrip({ trip_number: "", vehicle_id: "", driver_id: "", route_summary: "" });
                setNewVehicle({ license_plate: "", vehicle_type: "", capacity_weight: 0 });
                setNewDriver({ name: "", phone: "", license_type: "" });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-transparent">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
                            <Map className="w-8 h-8" />
                        </div>
                        {t("logistics")}
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        {t("logistics_desc") || "Fleet dispatching and real-time shipment monitoring"}
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm">
                    <button onClick={() => setModalType("trip")} className="px-5 py-2.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> {t("new_dispatch") || "New Dispatch"}
                    </button>
                    <div className="h-8 w-px bg-slate-100 mx-1"></div>
                    <button onClick={() => setModalType("shipment")} className="px-5 py-2.5 bg-white text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> {t("new_shipment") || "New Shipment"}
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: t("active_trips") || "Active Trips", val: trips.filter(t => t.status === "IN_PROGRESS").length, total: trips.length, icon: Truck, color: "blue" },
                    { label: t("avail_vehicles") || "Available Vehicles", val: vehicles.filter(v => v.status === "AVAILABLE").length, total: vehicles.length, icon: Car, color: "emerald" },
                    { label: t("avail_drivers") || "Available Drivers", val: drivers.filter(d => d.status === "AVAILABLE").length, total: drivers.length, icon: Users, color: "amber" },
                    { label: t("pending_shipments") || "Pending Shipments", val: shipments.filter(s => s.status === "PENDING").length, total: shipments.length, icon: Ship, color: "slate" },
                ].map((m, i) => (
                    <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{m.label}</h3>
                            <div className={`w-10 h-10 rounded-xl bg-${m.color}-50 text-${m.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <m.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <span className="text-3xl font-black text-slate-900">{m.val}</span>
                            <span className="text-sm font-semibold text-slate-500 ml-2">/ {m.total} Total</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-1 overflow-x-auto">
                {[
                    { id: "dispatch", label: t("dispatch_board") || "Dispatch Board", icon: Map },
                    { id: "fleet", label: t("fleet_drivers") || "Fleet & Drivers", icon: Car },
                    { id: "shipments", label: t("all_shipments") || "All Shipments", icon: Ship },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                
                {activeTab === "dispatch" && (
                    <div>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900">{t("active_trips_loads") || "Active Trips & Loads"}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("trip_no") || "Trip No."}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("driver_vehicle") || "Driver & Vehicle"}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("route") || "Route"}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("status")}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">{t("action")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" /></td></tr>
                                    ) : trips.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold text-sm">{t("no_active_trips") || "No active trips"}</td></tr>
                                    ) : trips.map(t_obj => (
                                        <tr key={t_obj.id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-8 py-5 font-bold text-slate-900">{t_obj.trip_number}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">{t_obj.driver?.name || "Unassigned"}</span>
                                                    <span className="text-xs text-slate-500 font-medium">{t_obj.vehicle?.license_plate || "Unassigned"}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-medium text-slate-600">{t_obj.route_summary}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    t_obj.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                    {t_obj.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50">{t("manage_load") || "Manage Load"}</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "fleet" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                        <div className="p-6">
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                <Car className="w-5 h-5 text-emerald-500" /> {t("corp_fleet") || "Corporate Fleet"}
                            </h3>
                            <div className="space-y-3">
                                {vehicles.map(v => (
                                    <div key={v.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between bg-white hover:border-emerald-200 transition-colors">
                                        <div>
                                            <p className="font-bold text-slate-900">{v.license_plate}</p>
                                            <p className="text-xs text-slate-500 font-medium">{v.vehicle_type} | {v.capacity_weight}kg</p>
                                        </div>
                                        <span className="px-2 py-1 text-[10px] font-black uppercase rounded bg-slate-100">{v.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5 text-amber-500" /> {t("drivers_roster") || "Drivers Roster"}
                            </h3>
                            <div className="space-y-3">
                                {drivers.map(d => (
                                    <div key={d.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between bg-white hover:border-amber-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black">{d.name.charAt(0)}</div>
                                            <div>
                                                <p className="font-bold text-slate-900">{d.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">{d.phone}</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 text-[10px] font-black uppercase rounded bg-slate-100">{d.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "shipments" && (
                    <div>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900">{t("tracking") || "Shipments Tracking"}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("tracking_no") || "Tracking No."}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("route") || "Route"}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("link_info") || "Link Info"}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("status")}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("trip_info") || "Trip Info"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" /></td></tr>
                                    ) : shipments.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold text-sm">{t("no_shipments") || "No shipments found"}</td></tr>
                                    ) : shipments.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-8 py-5 font-bold text-slate-900">{s.tracking_number}</td>
                                            <td className="px-8 py-5 text-sm font-medium text-slate-600">{s.origin} → {s.destination}</td>
                                            <td className="px-8 py-5">
                                                {s.project_id && <span className="block text-[10px] font-black text-indigo-600 uppercase">PRJ: {projects.find(p=>p.id===s.project_id)?.title || s.project_id}</span>}
                                                {s.po_id && <span className="block text-[10px] font-black text-violet-600 uppercase">PO: {pos.find(p=>p.id===s.po_id)?.po_number || s.po_id}</span>}
                                                {!s.project_id && !s.po_id && <span className="text-slate-300 text-[10px]">None</span>}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    s.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-xs font-bold text-slate-400">{s.trip_id ? `Assigned Trip #${s.trip_id}` : "Unassigned"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* General Purpose Modal Form */}
            {modalType && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900 capitalize">Create {modalType}</h3>
                            <button onClick={() => setModalType(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            
                            {modalType === "shipment" && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">{t("tracking_no") || "Tracking Number"}</label>
                                        <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={newShipment.tracking_number} onChange={e => setNewShipment({...newShipment, tracking_number: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">{t("origin") || "Origin"}</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={newShipment.origin} onChange={e=>setNewShipment({...newShipment, origin: e.target.value})} /></div>
                                        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">{t("destination") || "Destination"}</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={newShipment.destination} onChange={e=>setNewShipment({...newShipment, destination: e.target.value})} /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase">{t("project") || "Project"}</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={newShipment.project_id} onChange={e => setNewShipment({...newShipment, project_id: e.target.value})}>
                                                <option value="">{t("select_project") || "Select Project..."}</option>
                                                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase">PO</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={newShipment.po_id} onChange={e => setNewShipment({...newShipment, po_id: e.target.value})}>
                                                <option value="">{t("select_po") || "Select PO..."}</option>
                                                {pos.map(po => <option key={po.id} value={po.id}>{po.po_number}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">{t("eta") || "Est. Arrival"}</label>
                                        <input type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={newShipment.estimated_arrival} onChange={e => setNewShipment({...newShipment, estimated_arrival: e.target.value})} />
                                    </div>
                                </>
                            )}

                            {modalType === "trip" && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Trip Number</label>
                                        <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={newTrip.trip_number} onChange={e => setNewTrip({...newTrip, trip_number: e.target.value})} placeholder="TRIP-2026-X" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Route Summary</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={newTrip.route_summary} onChange={e => setNewTrip({...newTrip, route_summary: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Vehicle</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={newTrip.vehicle_id} onChange={e => setNewTrip({...newTrip, vehicle_id: e.target.value})}>
                                                <option value="">Select...</option>
                                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Driver</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={newTrip.driver_id} onChange={e => setNewTrip({...newTrip, driver_id: e.target.value})}>
                                                <option value="">Select...</option>
                                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl transition-all mt-4 hover:bg-slate-800">Save</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
