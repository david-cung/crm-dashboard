"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "vi" | "en";

const dictionaries = {
    en: {
        dashboard: "Dashboard",
        inventory: "Inventory",
        logistics: "Logistics",
        projects: "Projects (Energy)",
        kpi: "KPI & Ranking",
        users: "User Management",
        settings: "Settings",
        welcome: "Operational Command Center",
        welcome_msg: "Real-time overview of your ERP ecosystem across Inventory, Logistics, and Projects.",
        add_item: "Add New Item",
        sku: "SKU",
        name: "Name",
        quantity: "Quantity",
        price: "Price",
        status: "Status",
        low_stock: "Low Stock",
        healthy: "Healthy",
        login: "Sign In",
        register: "Register",
        logout: "Sign Out",
    },
    vi: {
        dashboard: "Tổng quan",
        inventory: "Kho hàng",
        logistics: "Vận chuyển",
        projects: "Dự án (Năng lượng)",
        kpi: "KPI & Xếp hạng",
        users: "Quản lý nhân sự",
        settings: "Cài đặt",
        welcome: "Trung tâm Điều hành Nghiệp vụ",
        welcome_msg: "Cái nhìn toàn diện về hệ thống ERP: Tồn kho, Vận chuyển và Dự án.",
        add_item: "Thêm mặt hàng mới",
        sku: "Mã kho",
        name: "Tên sản phẩm",
        quantity: "Số lượng",
        price: "Giá đơn vị",
        status: "Trạng thái",
        low_stock: "Sắp hết hàng",
        healthy: "An toàn",
        login: "Đăng nhập",
        register: "Đăng ký",
        logout: "Đăng xuất",
    }
};

type Dictionary = typeof dictionaries.en;

interface I18nContextType {
    lang: Language;
    t: (key: keyof Dictionary) => string;
    setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Language>("en");

    useEffect(() => {
        const saved = localStorage.getItem("lang") as Language;
        if (saved) setLang(saved);
    }, []);

    const handleSetLang = (newLang: Language) => {
        setLang(newLang);
        localStorage.setItem("lang", newLang);
    };

    const t = (key: keyof Dictionary) => {
        return dictionaries[lang][key] || key;
    };

    return (
        <I18nContext.Provider value={{ lang, t, setLang: handleSetLang }}>
            {children}
        </I18nContext.Provider>
    );
}

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) throw new Error("useI18n must be used within I18nProvider");
    return context;
};
