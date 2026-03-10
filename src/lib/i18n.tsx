"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "vi" | "en";

const dictionaries = {
    en: {
        dashboard: "Dashboard",
        inventory: "Inventory",
        logistics: "Logistics",
        projects: "Projects",
        kpi: "KPI & Ranking",
        users: "User Management",
        settings: "Settings",
        welcome: "Operational Command Center",
        welcome_msg: "System is stable. Here is today's business summary.",
        revenue_vs_target: "Revenue vs Target",
        operating_costs: "Operating Costs",
        gross_profit: "Gross Profit",
        pending_orders: "Pending Orders",
        delivery_rate: "Delivery Rate",
        cash_flow: "Financial Cash Flow",
        cash_flow_sub: "Monthly Inflow vs Outflow",
        inflow: "Inflow",
        outflow: "Outflow",
        overdue_invoices: "Overdue Invoices",
        dept_spending: "Department Spending",
        total_headcount: "Total Headcount",
        payroll_budget: "Payroll Budget",
        monthly_payroll: "Monthly Payroll",
        attendance: "Operational Attendance",
        attendance_rate: "Attendance Rate",
        leave_rate: "Leave Rate",
        export_report: "Export Report",
        generate_invoice: "Generate Invoice",
        overdue: "Overdue",
        recruitment_target: "Recruitment Target",
        view_hr: "View HR Dashboard",
        monthly_expenses: "Monthly expenses",
        net_margin: "Net margin",
        in_production: "In production",
        on_time_delivery: "On-time delivery",
        avg_salary: "Avg Salary",
        overtime: "Overtime",
        of_target: "of target",
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
        procurement: "Procurement",
    },
    vi: {
        dashboard: "Tổng quan",
        inventory: "Kho hàng",
        logistics: "Vận chuyển",
        projects: "Dự án",
        kpi: "KPI & Xếp hạng",
        users: "Quân lý nhân sự",
        settings: "Cài đặt",
        welcome: "Trung tâm Điều hành Nghiệp vụ",
        welcome_msg: "Hệ thống đang hoạt động ổn định. Đây là tóm tắt tình hình kinh doanh hôm nay.",
        revenue_vs_target: "Doanh thu vs Kế hoạch",
        operating_costs: "Chi phí vận hành",
        gross_profit: "Lợi nhuận gộp",
        pending_orders: "Đơn hàng đang xử lý",
        delivery_rate: "Tỷ lệ giao hàng đúng hạn",
        cash_flow: "Biểu đồ dòng tiền",
        cash_flow_sub: "Dòng tiền vào và ra theo tháng",
        inflow: "Dòng tiền vào",
        outflow: "Dòng tiền ra",
        overdue_invoices: "Hóa đơn quá hạn",
        dept_spending: "Tỷ lệ chi tiêu theo bộ phận",
        total_headcount: "Tổng nhân sự",
        payroll_budget: "Tổng quỹ lương",
        monthly_payroll: "Quỹ lương tháng",
        attendance: "Tỷ lệ chuyên cần",
        attendance_rate: "Tỷ lệ hiện diện",
        leave_rate: "Tỷ lệ nghỉ phép",
        export_report: "Xuất báo cáo",
        generate_invoice: "Tạo hóa đơn",
        overdue: "Quá hạn",
        recruitment_target: "Chỉ tiêu tuyển dụng",
        view_hr: "Xem chi tiết Nhân sự",
        monthly_expenses: "Chi phí hàng tháng",
        net_margin: "Biên lợi nhuận ròng",
        in_production: "Đang sản xuất",
        on_time_delivery: "Giao hàng đúng hạn",
        avg_salary: "Lương trung bình",
        overtime: "Lương tăng ca",
        of_target: "so với kế hoạch",
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
        procurement: "Mua hàng",
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
