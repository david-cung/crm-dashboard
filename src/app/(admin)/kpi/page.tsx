"use client";

import { useEffect, useState } from "react";
import { Award, TrendingUp, AlertCircle, CheckCircle2, History, Loader2 } from "lucide-react";

export default function KPIPage() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = () => {
        setIsLoading(true);
        Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/kpi/leaderboard`).then(res => res.json()),
            fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/kpi/events`).then(res => res.json())
        ])
            .then(([leaderData, eventData]) => {
                setLeaderboard(leaderData);
                setEvents(eventData);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Performance & KPIs</h1>
                    <p className="text-sm text-slate-500 mt-1">Automatic scoring based on operational events.</p>
                </div>
                <div className="flex space-x-2">
                    <button className="bg-white border text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Export Report</button>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200">System Rules</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Leaderboard */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-amber-500" /> Top Performers
                        </h3>
                        <span className="text-xs text-slate-500 font-medium tracking-wider uppercase">This Month</span>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-100">
                                    <th className="px-6 py-3">Rank</th>
                                    <th className="px-6 py-3">Employee</th>
                                    <th className="px-6 py-3">Department</th>
                                    <th className="px-6 py-3 text-right">Points</th>
                                    <th className="px-6 py-3 text-right">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                            Loading leaderboard...
                                        </td>
                                    </tr>
                                ) : leaderboard.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No data available yet.</td>
                                    </tr>
                                ) : leaderboard.map((p, index) => (
                                    <tr key={index} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? "bg-amber-100 text-amber-600" :
                                                index === 1 ? "bg-slate-200 text-slate-600" : "bg-orange-100 text-orange-600"
                                                }`}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {/* In this implementation, we show user_id as name placeholder if user object missing */}
                                            User #{p.user_id}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">Operations</td>
                                        <td className="px-6 py-4 text-right font-black text-indigo-600">{p.total_score}</td>
                                        <td className={`px-6 py-4 text-right font-medium text-emerald-500`}>
                                            +0%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Recent Activity Log */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center">
                            <History className="w-5 h-5 mr-2 text-indigo-400" /> Scoring Log
                        </h3>
                    </div>
                    <div className="flex-1 p-6 space-y-6 overflow-auto max-h-[500px]">
                        {isLoading ? (
                            <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" /></div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">No recent activity.</div>
                        ) : events.map((ev, index) => (
                            <div key={index} className="flex space-x-4">
                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${ev.points >= 0 ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"}`} />
                                <div className="space-y-1 flex-1">
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-xs font-bold text-slate-900">{ev.event_type}</span>
                                        <span className="text-[10px] text-slate-400">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-600">{ev.description}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-slate-400">Ref: #{ev.reference_id || "N/A"}</span>
                                        <span className={`text-[10px] font-black ${ev.points >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                            {ev.points >= 0 ? "+" : ""}{ev.points} pts
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-100">
                        <button className="w-full py-2 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors" onClick={fetchData}>Refresh Data</button>
                    </div>
                </div>

            </div>
        </div>
    );
}
