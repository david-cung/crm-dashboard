"use client";

import { useEffect, useState } from "react";
import { 
    Truck, AlertTriangle, MapPin, Search, Calendar, ChevronRight, 
    Loader2, Plus, X, Ship, Clock, CheckCircle2, Car, Users, ClipboardList, Map 
} from "lucide-react";

export default function LogisticsPage() {
    const [activeTab, setActiveTab] = useState<"shipments" | "dispatch" | "fleet">("dispatch");
    const [isLoading, setIsLoading] = useState(true);

    const [shipments, setShipments] = useState<any[]>([]);
    const [trips, setTrips] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Modals
    const [modalType, setModalType] = useState<"shipment" | "trip" | "vehicle" | "driver" | null>(null);

    // Forms
    const [newShipment, setNewShipment] = useState({ tracking_number: "", origin: "", destination: "", estimated_arrival: "" });
    const [newTrip, setNewTrip] = useState({ trip_number: "", vehicle_id: "", driver_id: "", route_summary: "" });
    const [newVehicle, setNewVehicle] = useState({ license_plate: "", vehicle_type: "", capacity_weight: 0 });
    const [newDriver, setNewDriver] = useState({ name: "", phone: "", license_type: "" });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [resS, resT, resV, resD] = await Promise.all([
                fetch(`${API_URL}/logistics/`),
                fetch(`${API_URL}/logistics/trips`),
                fetch(`${API_URL}/logistics/vehicles`),
                fetch(`${API_URL}/logistics/drivers`)
            ]);
            
            if(resS.ok) setShipments(await resS.json());
            if(resT.ok) setTrips(await resT.json());
            if(resV.ok) setVehicles(await resV.json());
            if(resD.ok) setDrivers(await resD.json());
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
        let payload = {};

        if (modalType === "shipment") {
            endpoint = "/logistics/";
            payload = { ...newShipment, estimated_arrival: newShipment.estimated_arrival || null };
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
                setNewShipment({ tracking_number: "", origin: "", destination: "", estimated_arrival: "" });
                setNewTrip({ trip_number: "", vehicle_id: "", driver_id: "", route_summary: "" });
                setNewVehicle({ license_plate: "", vehicle_type: "", capacity_weight: 0 });
                setNewDriver({ name: "", phone: "", license_type: "" });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
                            <Map className="w-8 h-8" />
                        </div>
                        TMS & Logistics
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        Fleet dispatching and real-time shipment monitoring
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm">
                    <button onClick={() => setModalType("trip")} className="px-5 py-2.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Dispatch
                    </button>
                    <div className="h-8 w-px bg-slate-100 mx-1"></div>
                    <button onClick={() => setModalType("shipment")} className="px-5 py-2.5 bg-white text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Shipment
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Active Trips</h3>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Truck className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-slate-900">{trips.filter(t => t.status === "IN_PROGRESS").length}</span>
                        <span className="text-sm font-semibold text-slate-500 ml-2">/ {trips.length} Total</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Available Vehicles</h3>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Car className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-slate-900">{vehicles.filter(v => v.status === "AVAILABLE").length}</span>
                        <span className="text-sm font-semibold text-slate-500 ml-2">/ {vehicles.length} Total</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Available Drivers</h3>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-slate-900">{drivers.filter(d => d.status === "AVAILABLE").length}</span>
                        <span className="text-sm font-semibold text-slate-500 ml-2">/ {drivers.length} Total</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Pending Shipments</h3>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                            <Ship className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-slate-900">{shipments.filter(s => s.status === "PENDING").length}</span>
                        <span className="text-sm font-semibold text-slate-500 ml-2">Require Dispatch</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-1 overflow-x-auto">
                <button onClick={() => setActiveTab("dispatch")} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "dispatch" ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>
                    <Map className="w-4 h-4" /> Dispatch Board
                </button>
                <button onClick={() => setActiveTab("fleet")} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "fleet" ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>
                    <Car className="w-4 h-4" /> Fleet & Drivers
                </button>
                <button onClick={() => setActiveTab("shipments")} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "shipments" ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>
                    <Ship className="w-4 h-4" /> All Shipments
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                
                {/* DISPATCH BOARD */}
                {activeTab === "dispatch" && (
                    <div>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900">Active Trips & Loads</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trip No.</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Driver & Vehicle</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Route</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" /></td></tr>
                                    ) : trips.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold text-sm">No active trips</td></tr>
                                    ) : trips.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-8 py-5 font-bold text-slate-900">{t.trip_number}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">{t.driver?.name || "Unassigned"}</span>
                                                    <span className="text-xs text-slate-500 font-medium">{t.vehicle?.license_plate || "Unassigned"} ({t.vehicle?.vehicle_type})</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-medium text-slate-600">{t.route_summary || "To be planned"}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    t.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                    {t.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 shadow-sm">
                                                    Manage Load
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* FLEET MANAGEMENT */}
                {activeTab === "fleet" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                        {/* Vehicles */}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Car className="w-5 h-5 text-emerald-500" /> Corporate Fleet
                                </h3>
                                <button onClick={() => setModalType("vehicle")} className="text-xs font-bold text-emerald-600 hover:underline">Add Vehicle</button>
                            </div>
                            <div className="space-y-3">
                                {vehicles.length === 0 ? <p className="text-sm text-slate-400">No vehicles added.</p> : 
                                vehicles.map(v => (
                                    <div key={v.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between bg-white hover:border-emerald-200 transition-colors">
                                        <div>
                                            <p className="font-bold text-slate-900">{v.license_plate}</p>
                                            <p className="text-xs text-slate-500 font-medium">Type: {v.vehicle_type} | Cap: {v.capacity_weight}kg</p>
                                        </div>
                                        <span className={`px-2 py-1 text-[10px] font-black uppercase rounded bg-slate-100 ${v.status === 'AVAILABLE' ? 'text-emerald-600' : 'text-slate-500'}`}>
                                            {v.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Drivers */}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-amber-500" /> Drivers Roster
                                </h3>
                                <button onClick={() => setModalType("driver")} className="text-xs font-bold text-amber-600 hover:underline">Add Driver</button>
                            </div>
                            <div className="space-y-3">
                                {drivers.length === 0 ? <p className="text-sm text-slate-400">No drivers added.</p> :
                                drivers.map(d => (
                                    <div key={d.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between bg-white hover:border-amber-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                                                {d.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{d.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">{d.phone} | Lic: {d.license_type}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-[10px] font-black uppercase rounded bg-slate-100 ${d.status === 'AVAILABLE' ? 'text-emerald-600' : 'text-slate-500'}`}>
                                            {d.status.replace("_", " ")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ALL SHIPMENTS */}
                {activeTab === "shipments" && (
                    <div>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900">Shipments Tracking</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tracking No.</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Route</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ETA</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trip Info</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" /></td></tr>
                                    ) : shipments.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold text-sm">No shipments found</td></tr>
                                    ) : shipments.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-8 py-5 font-bold text-slate-900">{s.tracking_number}</td>
                                            <td className="px-8 py-5 text-sm font-medium text-slate-600">
                                                {s.origin} → {s.destination}
                                            </td>
                                            <td className="px-8 py-5 text-xs text-slate-500 font-medium">
                                                {s.estimated_arrival ? new Date(s.estimated_arrival).toLocaleDateString() : "TBD"}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    s.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    s.status === 'IN_TRANSIT' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                    'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                    {s.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-xs font-bold text-indigo-600">
                                                {s.trip_id ? `Assigned (Trip #${s.trip_id})` : "Unassigned"}
                                            </td>
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
                            <button onClick={() => setModalType(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            
                            {modalType === "shipment" && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Tracking Number</label>
                                        <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900" 
                                            value={newShipment.tracking_number} onChange={e => setNewShipment({...newShipment, tracking_number: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Origin</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={newShipment.origin} onChange={e=>setNewShipment({...newShipment, origin: e.target.value})} /></div>
                                        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Destination</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={newShipment.destination} onChange={e=>setNewShipment({...newShipment, destination: e.target.value})} /></div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Est. Arrival</label>
                                        <input type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" 
                                            value={newShipment.estimated_arrival} onChange={e => setNewShipment({...newShipment, estimated_arrival: e.target.value})} />
                                    </div>
                                </>
                            )}

                            {modalType === "trip" && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Trip Number (Manifest)</label>
                                        <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" 
                                            value={newTrip.trip_number} onChange={e => setNewTrip({...newTrip, trip_number: e.target.value})} placeholder="TRIP-2026-X" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Route Summary</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" 
                                            value={newTrip.route_summary} onChange={e => setNewTrip({...newTrip, route_summary: e.target.value})} placeholder="e.g. WH1 -> District 2 -> District 7" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Vehicle</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={newTrip.vehicle_id} onChange={e => setNewTrip({...newTrip, vehicle_id: e.target.value})}>
                                                <option value="">Select Vehicle...</option>
                                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Driver</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={newTrip.driver_id} onChange={e => setNewTrip({...newTrip, driver_id: e.target.value})}>
                                                <option value="">Select Driver...</option>
                                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            {modalType === "vehicle" && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">License Plate</label>
                                        <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" 
                                            value={newVehicle.license_plate} onChange={e => setNewVehicle({...newVehicle, license_plate: e.target.value})} placeholder="29C-123.45" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Vehicle Type</label>
                                        <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" 
                                            value={newVehicle.vehicle_type} onChange={e => setNewVehicle({...newVehicle, vehicle_type: e.target.value})} placeholder="e.g. Van 1.5T" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Weight Capacity (kg)</label>
                                        <input type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" 
                                            value={newVehicle.capacity_weight} onChange={e => setNewVehicle({...newVehicle, capacity_weight: parseFloat(e.target.value)})} />
                                    </div>
                                </>
                            )}

                            {modalType === "driver" && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                        <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" 
                                            value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                                        <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" 
                                            value={newDriver.phone} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} placeholder="+1 234 567 890" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase">License Type</label>
                                        <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" 
                                            value={newDriver.license_type} onChange={e => setNewDriver({...newDriver, license_type: e.target.value})} placeholder="e.g. C, D, E" />
                                    </div>
                                </>
                            )}

                            <button type="submit" className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-200 transition-all mt-4">
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
