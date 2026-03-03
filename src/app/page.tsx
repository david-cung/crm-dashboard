import AdminLayout from "./(admin)/layout";

export default function Home() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back. Here is the operational summary.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI Cards */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Active Projects</h3>
            <p className="text-2xl font-bold mt-2 text-slate-900">12</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Pending Inventory</h3>
            <p className="text-2xl font-bold mt-2 text-slate-900">84</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">In Transit</h3>
            <p className="text-2xl font-bold mt-2 text-slate-900">5</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">System Alerts</h3>
            <p className="text-2xl font-bold mt-2 text-red-600">2</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
