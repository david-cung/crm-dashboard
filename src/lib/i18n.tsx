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
        procurement: "Procurement",
        personnel: "Personnel",
        
        // Dashboard
        welcome: "Overview",
        welcome_msg: "Welcome back! Here's an overview of today's operations.",
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
        attendance: "Attendance",
        attendance_rate: "Attendance Rate",
        leave_rate: "Leave Rate",
        export_report: "Export Report",
        generate_invoice: "Generate Invoice",
        overdue: "Overdue",
        recruitment_target: "Recruitment Target",
        view_hr: "View HR Details",
        monthly_expenses: "Monthly expenses",
        net_margin: "Net margin",
        in_production: "In production",
        on_time_delivery: "On-time delivery",
        avg_salary: "Avg Salary",
        overtime: "Overtime",
        of_target: "of target",
        
        // Common
        status: "Status",
        action: "Action",
        
        // Inventory
        inventory_desc: "Real-time stock monitoring & Warehouse Operations",
        add_product: "Add Product",
        stock_in: "Stock In",
        stock_out: "Stock Out",
        transfer: "Transfer",
        total_items: "Total Items",
        product_catalog: "Product Catalog",
        stock_alert: "Low Stock Alert",
        needs_attention: "Needs Attention",
        safe: "Safe",
        active_transfers: "Active Transfers",
        stock_value: "Inventory Value",
        working_capital: "Working Capital",
        products: "Products",
        history: "History",
        warehouses: "Warehouses",
        audits: "Audits",
        search_product: "Search product / SKU / Barcode...",
        advanced_filter: "Advanced Filter",
        actual_stock: "On Hand",
        available: "Available",
        loading: "Loading data...",
        no_products: "No products found",
        add_first_product: "Add your first product",
        need_restock: "Restock Needed",
        safety_level: "Safety Level",
        page_under_construction: "Page under construction",
        data_available_soon: "Real data for this section will be available soon.",
        warehouse_status: "Warehouse Status",
        stock_turnover: "Stock Turnover",
        warehouse_space: "Warehouse Space",
        receiving_time: "Receiving Time",
        view_detailed_report: "View Detailed Report",
        recent_activity: "Recent Activity",
        
        // Projects
        projects_desc: "Installation Management & Solar Systems",
        create_project: "Create Project",
        total_capacity: "Total Capacity",
        running_projects: "Running Projects",
        completed_systems: "Completed Systems",
        search_projects: "Search by customer or project name...",
        filter: "Filter",
        loading_projects: "Loading projects...",
        no_projects: "No projects yet",
        start_first_project: "Start by creating a new energy project.",
        capacity: "Capacity",
        value_label: "Value",
        setup_project: "Setup New Project",
        project_specs: "Enter technical specifications for the system.",
        project_title: "Project Name",
        customer_name_label: "Customer Name",
        install_location: "Installation Location",
        init_project: "Initialize Project",
        
        // Procurement
        procurement_desc: "Purchase Orders & Supplier Management",
        create_po: "Create PO",
        add_supplier: "Add Supplier",
        total_pos: "Total POs",
        pending_approval: "Pending Approval",
        none: "None",
        active_suppliers: "Active Suppliers",
        monthly_value: "Monthly Value",
        current_month: "Current Month",
        purchase_orders: "Purchase Orders",
        search_po: "Search PO / Supplier...",
        order: "Order",
        supplier: "Supplier",
        value: "Value",
        receive_progress: "Receive Progress",
        no_po: "No purchase orders",
        create_first_po: "Create your first PO",
        approve: "Approve",
        receive_goods: "Receive Goods",
        contact: "Contact",
        tax_code: "Tax Code",
        no_suppliers: "No suppliers yet",
        active: "Active",
        inactive: "Inactive",
        
        // PO Status
        draft: "Draft",
        sent: "Sent to Supplier",
        partially_received: "Partially Received",
        completed: "Completed",
        cancelled: "Cancelled",

        // Logistics
        logistics_desc: "Fleet dispatching and real-time shipment monitoring",
        new_dispatch: "New Dispatch",
        new_shipment: "New Shipment",
        active_trips: "Active Trips",
        avail_vehicles: "Available Vehicles",
        avail_drivers: "Available Drivers",
        pending_shipments: "Pending Shipments",
        dispatch_board: "Dispatch Board",
        fleet_drivers: "Fleet & Drivers",
        all_shipments: "All Shipments",
        active_trips_loads: "Active Trips & Loads",
        trip_no: "Trip No.",
        driver_vehicle: "Driver & Vehicle",
        route: "Route",
        no_active_trips: "No active trips",
        manage_load: "Manage Load",
        corp_fleet: "Corporate Fleet",
        drivers_roster: "Drivers Roster",
        tracking: "Shipments Tracking",
        tracking_no: "Tracking No.",
        link_info: "Link Info",
        trip_info: "Trip Info",
        no_shipments: "No shipments found",
        origin: "Origin",
        destination: "Destination",
        project: "Project",
        select_project: "Select Project...",
        select_po: "Select PO...",
        eta: "Est. Arrival",
    },
    vi: {
        dashboard: "Tổng quan",
        inventory: "Kho hàng",
        logistics: "Vận chuyển",
        projects: "Dự án",
        kpi: "Hiệu suất",
        users: "Cán bộ nhân sự",
        settings: "Cài đặt",
        procurement: "Mua hàng",
        personnel: "Nhân sự",
        
        // Dashboard
        welcome: "Tổng quan hệ thống",
        welcome_msg: "Chào mừng trở lại! Dưới đây là tình hình hoạt động kinh doanh hôm nay.",
        revenue_vs_target: "Doanh thu vs Kế hoạch",
        operating_costs: "Chi phí hoạt động",
        gross_profit: "Lợi nhuận gộp",
        pending_orders: "Đơn hàng đang chờ",
        delivery_rate: "Tỷ lệ giao hàng đúng hạn",
        cash_flow: "Dòng tiền",
        cash_flow_sub: "Tiền vào và Tiền ra hàng tháng",
        inflow: "Tiền vào",
        outflow: "Tiền ra",
        overdue_invoices: "Hóa đơn quá hạn",
        dept_spending: "Chi tiêu theo bộ phận",
        total_headcount: "Tổng nhân sự",
        payroll_budget: "Quỹ lương",
        monthly_payroll: "Lương hàng tháng",
        attendance: "Chuyên cần",
        attendance_rate: "Tỷ lệ đi làm",
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
        overtime: "Tăng ca",
        of_target: "so với kế hoạch",
        
        // Common
        status: "Trạng thái",
        action: "Thao tác",
        
        // Inventory
        inventory_desc: "Giám sát tồn kho thực tế & Vận hành kho",
        add_product: "Thêm sản phẩm",
        stock_in: "Nhập kho",
        stock_out: "Xuất kho",
        transfer: "Điều chuyển",
        total_items: "Tổng mặt hàng",
        product_catalog: "Danh mục sản phẩm",
        stock_alert: "Cảnh báo tồn kho",
        needs_attention: "Cần xử lý",
        safe: "An toàn",
        active_transfers: "Đang điều chuyển",
        stock_value: "Giá trị tồn kho",
        working_capital: "Vốn lưu động",
        products: "Sản phẩm",
        history: "Lịch sử",
        warehouses: "Nhà kho",
        audits: "Kiểm kho",
        search_product: "Tìm sản phẩm / SKU / Barcode...",
        advanced_filter: "Lọc nâng cao",
        actual_stock: "Tồn thực",
        available: "Khả dụng",
        loading: "Đang tải dữ liệu...",
        no_products: "Chưa có sản phẩm nào",
        add_first_product: "Tạo sản phẩm đầu tiên",
        need_restock: "Cần nhập hàng",
        safety_level: "Hệ số an toàn",
        page_under_construction: "Trang đang được nâng cấp",
        data_available_soon: "Dữ liệu thực tế cho phần này sẽ sớm khả dụng.",
        warehouse_status: "Tình trạng Kho",
        stock_turnover: "Luân chuyển hàng",
        warehouse_space: "Không gian kho",
        receiving_time: "Thời gian nhập",
        view_detailed_report: "Xem báo cáo chi tiết",
        recent_activity: "Hoạt động gần đây",
        
        // Projects
        projects_desc: "Quản lý lắp đặt & Hệ thống năng lượng",
        create_project: "Tạo Dự án",
        total_capacity: "Tổng công suất",
        running_projects: "Dự án đang chạy",
        completed_systems: "Hệ thống hoàn tất",
        search_projects: "Tìm khách hàng hoặc tên dự án...",
        filter: "Bộ lọc",
        loading_projects: "Đang tải dự án...",
        no_projects: "Chưa có dự án nào",
        start_first_project: "Bắt đầu bằng cách tạo dự án mới.",
        capacity: "Công suất",
        value_label: "Giá trị",
        setup_project: "Thiết lập dự án mới",
        project_specs: "Nhập thông số kỹ thuật cho hệ thống.",
        project_title: "Tên dự án",
        customer_name_label: "Tên khách hàng",
        install_location: "Địa điểm lắp đặt",
        init_project: "Khởi tạo Dự án",
        
        // Procurement
        procurement_desc: "Quản lý Đơn mua hàng & Nhà cung cấp",
        create_po: "Tạo PO",
        add_supplier: "Thêm NCC",
        total_pos: "Tổng đơn PO",
        pending_approval: "Chờ phê duyệt",
        none: "Không có",
        active_suppliers: "Nhà cung cấp",
        monthly_value: "Giá trị tháng",
        current_month: "Tháng hiện tại",
        purchase_orders: "Đơn mua hàng",
        search_po: "Tìm PO / Nhà cung cấp...",
        order: "Đơn hàng",
        supplier: "Nhà cung cấp",
        value: "Giá trị",
        receive_progress: "Tiến độ nhận",
        no_po: "Chưa có đơn mua hàng",
        create_first_po: "Tạo đơn mua hàng đầu tiên",
        approve: "Duyệt",
        receive_goods: "Nhận hàng",
        contact: "Liên hệ",
        tax_code: "Mã số thuế",
        no_suppliers: "Chưa có nhà cung cấp nào",
        active: "Hoạt động",
        inactive: "Dừng",
        
        // PO Status
        draft: "Bản nháp",
        sent: "Đã gửi NCC",
        partially_received: "Nhận 1 phần",
        completed: "Hoàn tất",
        cancelled: "Đã hủy",

        // Logistics
        logistics_desc: "Quản lý vận hành vận tải và theo dõi lô hàng thời gian thực",
        new_dispatch: "Điều phối mới",
        new_shipment: "Lô hàng mới",
        active_trips: "Chuyến đang chạy",
        avail_vehicles: "Xe sẵn sàng",
        avail_drivers: "Tài xế sẵn sàng",
        pending_shipments: "Lô hàng chờ xử lý",
        dispatch_board: "Bảng điều phối",
        fleet_drivers: "Đội xe & Tài xế",
        all_shipments: "Tất cả lô hàng",
        active_trips_loads: "Chuyến hàng & Tải trọng đang hoạt động",
        trip_no: "Số chuyến",
        driver_vehicle: "Tài xế & Xe",
        route: "Lộ trình",
        no_active_trips: "Không có chuyến hàng nào đang hoạt động",
        manage_load: "Quản lý tải trọng",
        corp_fleet: "Đội xe công ty",
        drivers_roster: "Danh sách tài xế",
        tracking: "Theo dõi lô hàng",
        tracking_no: "Số vận đơn",
        link_info: "Thông tin liên kết",
        trip_info: "Thông tin chuyến",
        no_shipments: "Không tìm thấy lô hàng nào",
        origin: "Điểm đi",
        destination: "Điểm đến",
        project: "Dự án",
        select_project: "Chọn dự án...",
        select_po: "Chọn đơn mua...",
        eta: "Thời gian đến dự kiến",
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
        // eslint-disable-next-line
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
