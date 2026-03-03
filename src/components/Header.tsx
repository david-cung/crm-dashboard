"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";

export function Header() {
    const { user, logout } = useAuthStore();

    return (
        <header className="bg-white border-b h-16 flex items-center justify-between px-6">
            <div className="flex-1">
                {/* Breadcrumbs or Search could go here */}
            </div>
            <div className="flex items-center space-x-4">
                {user ? (
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-slate-600">
                            <UserIcon className="w-5 h-5" />
                            <span className="font-medium">{user.fullName || "User"}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="text-slate-500 hover:text-red-600 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        Sign in
                    </Link>
                )}
            </div>
        </header>
    );
}
