import React, { useEffect, useMemo, useState } from "react";
import LoginPage from "./LoginPage";
import AdminPage from "./AdminPage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";

/* =====================================================
   MAIN APP
===================================================== */

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [rfqHistoryRefresh, setRfqHistoryRefresh] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [rfqRequest, setRfqRequest] = useState(null);
  const [rfqSupplier, setRfqSupplier] = useState("");

  if (!currentUser) {
  return (
    <LoginPage
      onLogin={(user) => setCurrentUser(user)}
    />
  );
}

if (currentUser.role === "admin") {
  return (
    <AdminPage
      currentUser={currentUser}
      onOpenRFQ={(request, supplier) => {
        setRfqRequest(request);
        setRfqSupplier(supplier);
        setCurrentUser({
          username: "procurement",
          role: "user",
        });
        setSelectedSupplier(supplier);
        setActivePage("RFQ Generator");
      }}
    />
  );
}

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard />;
      case "Sourcing Center":
  return (
    <SourcingCenter
      setActivePage={setActivePage}
      setSelectedSupplier={setSelectedSupplier}
    />
  );  
      case "Search & Filter":
        return <SearchAndFilter />;  
      case "AI Assistant":
        return <AIAssistant />;
      case "Purchase Orders":
        return <PurchaseOrders />;
      case "Suppliers":
        return (
          <Suppliers setActivePage={setActivePage}
          setSelectedSupplier={setSelectedSupplier} />);
      case "Quality Analysis":
        return <QualityAnalysis />;
      case "Analytics":
        return <Analytics />;
      case "Compliance":
        return <Compliance />;
      case "RFQ Generator":
        return(
        <RFQGenerator 
          selectedSupplier={selectedSupplier}
          rfqRequest={rfqRequest}
          setRfqHistoryRefresh={setRfqHistoryRefresh}
        />
        );
      case "RFQ History":
        return (
          <RFQHistory
            refresh={rfqHistoryRefresh}
          />
        );  
      case "Products":
        return <Products />;  
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* DESKTOP SIDEBAR */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* MAIN AREA */}
        <div className="flex-1 min-w-0">

          <TopBar
            activePage={activePage}
            setMobileMenu={setMobileMenu}
          />

          {mobileMenu && (
            <MobileNav
              activePage={activePage}
              setActivePage={setActivePage}
              setMobileMenu={setMobileMenu}
            />
          )}

          <main className="p-4 md:p-6 lg:p-8">
            {renderPage()}
          </main>

        </div>
      </div>
    </div>
  );
}

/* =====================================================
   SIDEBAR
===================================================== */

function Sidebar({ activePage, setActivePage }) {
  const items = [
    "Dashboard",
    "Search & Filter",
    "AI Assistant",
    "Purchase Orders",
    "Suppliers",
    "Quality Analysis",
    "Analytics",
    "Compliance",
    "RFQ Generator",
    "RFQ History",
    "Products",
    "Sourcing Center"
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-slate-900 text-white min-h-screen flex-col sticky top-0 h-screen">

      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-bold">
            PB
          </div>

          <div>
            <h1 className="font-bold text-lg">
              Procure Bot
            </h1>

            <p className="text-xs text-slate-400">
              Procurement Intelligence
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavItem
            key={item}
            name={item}
            active={activePage === item}
            onClick={() => setActivePage(item)}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">
            AI Procurement Assistant
          </p>

          <p className="text-sm font-semibold mt-1">
            RAG Engine Active
          </p>

          <div className="flex items-center gap-2 mt-3">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            <span className="text-xs text-slate-400">
              System operational
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}


/* =====================================================
   MOBILE NAV
===================================================== */

function MobileNav({
  activePage,
  setActivePage,
  setMobileMenu,
}) {
  const items = [
    "Dashboard",
    "AI Assistant",
    "Purchase Orders",
    "Suppliers",
    "Quality Analysis",
    "Analytics",
    "Compliance",
    "RFQ Generator",
  ];

  return (
    <div className="lg:hidden bg-slate-900 text-white p-4">
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => {
              setActivePage(item);
              setMobileMenu(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium ${
              activePage === item
                ? "bg-indigo-600"
                : "hover:bg-slate-800"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   TOP BAR
===================================================== */

function TopBar({
  activePage,
  setMobileMenu,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenu(true)}
            className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"
          >
            â˜°
          </button>

          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">
              Procurement Intelligence
            </p>

            <p className="font-bold text-slate-900">
              {activePage}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Backend Live
          </span>

          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            AI
          </div>
        </div>

      </div>
    </header>
  );
}

/* =====================================================
   NAV ITEM
===================================================== */

function NavItem({ name, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${
        active
          ? "bg-indigo-600 text-white"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {name}
    </button>
  );
}

/* =====================================================
   DASHBOARD
===================================================== */

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [quality, setQuality] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        supplierResponse,
        qualityResponse,
        poResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/dashboard/summary`),
        fetch(`${API_BASE_URL}/api/dashboard/suppliers`),
        fetch(`${API_BASE_URL}/api/dashboard/quality`),
        fetch(`${API_BASE_URL}/api/purchase-orders`),
      ]);

      if (
        !summaryResponse.ok ||
        !supplierResponse.ok ||
        !qualityResponse.ok ||
        !poResponse.ok
      ) {
        throw new Error("Unable to load dashboard data");
      }

      const summaryData = await summaryResponse.json();
      const supplierData = await supplierResponse.json();
      const qualityData = await qualityResponse.json();
      const poData = await poResponse.json();

      setSummary(
        summaryData.success
          ? summaryData.data || summaryData
          : summaryData
      );

      setSuppliers(
        supplierData.suppliers ||
          supplierData.data ||
          []
      );

      setQuality(
        qualityData.data ||
          qualityData
      );

      setPurchaseOrders(
        poData.purchase_orders ||
          poData.orders ||
          poData.data ||
          []
      );

    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        "Unable to load dashboard data. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `Rs. ${Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value.includes("complete") ||
      value.includes("delivered") ||
      value === "yes"
    ) {
      return "bg-green-100 text-green-700";
    }

    if (
      value.includes("pending") ||
      value.includes("progress")
    ) {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  const getComplianceClass = (value) => {
    const rate = Number(value || 0);

    if (rate >= 90) {
      return "bg-green-100 text-green-700";
    }

    if (rate >= 75) {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  };

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Procurement Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Overview of procurement operations, suppliers,
            quality and compliance.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500">
            Loading procurement dashboard...
          </p>
        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Procurement Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Overview of procurement operations, suppliers,
            quality and compliance.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">

          <h2 className="font-semibold text-red-700">
            Dashboard Error
          </h2>

          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
          >
            Retry
          </button>

        </div>

      </div>
    );
  }

  const totalProcurementValue =
    summary?.total_procurement_value || 0;

  const totalSavings =
    summary?.total_savings || 0;

  const totalOrders =
    summary?.total_orders || 0;

  const totalDefectiveUnits =
    summary?.total_defective_units || 0;

  const complianceRate =
    summary?.compliance_rate || 0;

  const compliantOrders =
    summary?.compliant_orders || 0;

  const nonCompliantOrders =
    summary?.non_compliant_orders || 0;

  const highestSupplier =
    quality?.highest_supplier_defect || null;

  const lowestSupplier =
    quality?.lowest_supplier_defect || null;

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Procurement Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Monitor procurement spend, supplier performance,
            quality and compliance.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Refresh Data
        </button>

      </div>


      {/* KPI CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">

        {/* Procurement Value */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <span className="text-indigo-600 font-bold">
                PV
              </span>
            </div>

          </div>

          <p className="text-sm text-gray-500 mt-4">
            Procurement Value
          </p>

          <p className="text-xl font-bold text-gray-900 mt-1">
            {formatCurrency(totalProcurementValue)}
          </p>

        </div>


        {/* Savings */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <span className="text-green-600 font-bold">
              SV
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Total Savings
          </p>

          <p className="text-xl font-bold text-green-600 mt-1">
            {formatCurrency(totalSavings)}
          </p>

        </div>


        {/* Orders */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="text-blue-600 font-bold">
              PO
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Total Orders
          </p>

          <p className="text-xl font-bold text-gray-900 mt-1">
            {formatNumber(totalOrders)}
          </p>

        </div>


        {/* Compliance */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <span className="text-purple-600 font-bold">
              CR
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Compliance Rate
          </p>

          <p className="text-xl font-bold text-gray-900 mt-1">
            {Number(complianceRate).toFixed(2)}%
          </p>

        </div>


        {/* Defects */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <span className="text-red-600 font-bold">
              Q
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Defective Units
          </p>

          <p className="text-xl font-bold text-red-600 mt-1">
            {formatNumber(totalDefectiveUnits)}
          </p>

        </div>

      </div>


      {/* COMPLIANCE + SUPPLIER QUALITY */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Compliance Overview */}

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-bold text-gray-900">
                Compliance Overview
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Current purchase order compliance
              </p>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getComplianceClass(
                complianceRate
              )}`}
            >
              {Number(complianceRate).toFixed(2)}%
            </div>

          </div>

          <div className="mt-6 space-y-5">

            <div>

              <div className="flex justify-between text-sm mb-2">

                <span className="text-gray-600">
                  Compliant Orders
                </span>

                <span className="font-semibold text-gray-900">
                  {formatNumber(compliantOrders)}
                </span>

              </div>

              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      Number(complianceRate),
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>


            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">

              <div>
                <p className="text-xs text-green-600">
                  Compliant
                </p>

                <p className="text-lg font-bold text-green-700">
                  {formatNumber(compliantOrders)}
                </p>
              </div>

              <span className="text-green-600 font-semibold">
                OK
              </span>

            </div>


            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">

              <div>
                <p className="text-xs text-red-600">
                  Non-Compliant
                </p>

                <p className="text-lg font-bold text-red-700">
                  {formatNumber(nonCompliantOrders)}
                </p>
              </div>

              <span className="text-red-600 font-semibold">
                Review
              </span>

            </div>

          </div>

        </div>


        {/* Supplier Quality */}

        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-bold text-gray-900">
                Supplier Quality Overview
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Supplier defect-rate monitoring
              </p>
            </div>

            <span className="text-xs font-semibold text-gray-500">
              {suppliers.length} Suppliers
            </span>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

            {highestSupplier && (
              <div className="border border-red-200 bg-red-50 rounded-xl p-5">

                <p className="text-xs font-semibold text-red-600 uppercase">
                  Highest Recorded Supplier Defect Rate
                </p>

                <p className="text-lg font-bold text-gray-900 mt-2">
                  {highestSupplier.supplier}
                </p>

                <p className="text-2xl font-bold text-red-600 mt-1">
                  {Number(
                    highestSupplier.overall_defect_rate || 0
                  ).toFixed(2)}
                  %
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  {formatNumber(
                    highestSupplier.total_orders
                  )}{" "}
                  orders
                </p>

              </div>
            )}


            {lowestSupplier && (
              <div className="border border-green-200 bg-green-50 rounded-xl p-5">

                <p className="text-xs font-semibold text-green-600 uppercase">
                  Lowest Recorded Supplier Defect Rate
                </p>

                <p className="text-lg font-bold text-gray-900 mt-2">
                  {lowestSupplier.supplier}
                </p>

                <p className="text-2xl font-bold text-green-600 mt-1">
                  {Number(
                    lowestSupplier.overall_defect_rate || 0
                  ).toFixed(2)}
                  %
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  {formatNumber(
                    lowestSupplier.total_orders
                  )}{" "}
                  orders
                </p>

              </div>
            )}

          </div>


          {/* SUPPLIER TABLE */}

          <div className="mt-5 overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="border-b border-gray-200">

                <tr>

                  <th className="text-left py-3 pr-4 font-semibold text-gray-600">
                    Supplier
                  </th>

                  <th className="text-center px-3 py-3 font-semibold text-gray-600">
                    Orders
                  </th>

                  <th className="text-center px-3 py-3 font-semibold text-gray-600">
                    Defect Rate
                  </th>

                  <th className="text-center px-3 py-3 font-semibold text-gray-600">
                    Compliance
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {suppliers.slice(0, 5).map(
                  (supplier) => (
                    <tr
                      key={supplier.supplier}
                      className="hover:bg-gray-50"
                    >

                      <td className="py-3 pr-4 font-semibold text-gray-800">
                        {supplier.supplier}
                      </td>

                      <td className="px-3 py-3 text-center">
                        {formatNumber(
                          supplier.total_orders
                        )}
                      </td>

                      <td className="px-3 py-3 text-center">

                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            Number(
                              supplier.defect_rate || 0
                            ) <= 2
                              ? "bg-green-100 text-green-700"
                              : Number(
                                  supplier.defect_rate || 0
                                ) <= 5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {Number(
                            supplier.defect_rate || 0
                          ).toFixed(2)}
                          %
                        </span>

                      </td>

                      <td className="px-3 py-3 text-center">

                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getComplianceClass(
                            supplier.compliance_rate
                          )}`}
                        >
                          {Number(
                            supplier.compliance_rate || 0
                          ).toFixed(2)}
                          %
                        </span>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>


      {/* RECENT PURCHASE ORDERS */}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          <div>

            <h2 className="font-bold text-gray-900">
              Recent Purchase Orders
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Latest procurement transactions
            </p>

          </div>

          <div className="text-xs text-gray-500">
            Showing latest available records
          </div>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="text-left px-6 py-3 font-semibold text-gray-600">
                  PO ID
                </th>

                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Supplier
                </th>

                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Item
                </th>

                <th className="text-right px-4 py-3 font-semibold text-gray-600">
                  Quantity
                </th>

                <th className="text-right px-4 py-3 font-semibold text-gray-600">
                  Amount
                </th>

                <th className="text-center px-4 py-3 font-semibold text-gray-600">
                  Status
                </th>

                <th className="text-center px-6 py-3 font-semibold text-gray-600">
                  Compliance
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-100">

              {purchaseOrders
                .slice(0, 8)
                .map((order) => {

                  const quantity =
                    Number(order.quantity || 0);

                  const negotiatedPrice =
                    Number(
                      order.negotiated_price ||
                        order.Negotiated_Price ||
                        order.unit_price ||
                        order.Unit_Price ||
                        0
                    );

                  const amount =
                    Number(
                      order.procurement_value ||
                        order.total_value ||
                        0
                    ) ||
                    quantity * negotiatedPrice;

                  return (
                    <tr
                      key={
                        order.po_id ||
                        order.PO_ID
                      }
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {order.po_id ||
                          order.PO_ID ||
                          "-"}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {order.supplier ||
                          order.Supplier ||
                          "-"}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {order.product ||
                          order.item_category ||
                          order.Item_Category ||
                          "-"}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {formatNumber(quantity)}
                      </td>

                      <td className="px-4 py-4 text-right font-semibold">
                        {formatCurrency(amount)}
                      </td>

                      <td className="px-4 py-4 text-center">

                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                            order.order_status ||
                              order.status ||
                              order.Order_Status
                          )}`}
                        >
                          {order.order_status ||
                            order.status ||
                            order.Order_Status ||
                            "Unknown"}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-center">

                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            String(
                              order.compliance ||
                                order.Compliance ||
                                ""
                            ).toLowerCase() === "yes"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {String(
                            order.compliance ||
                              order.Compliance ||
                              ""
                          ).toLowerCase() === "yes"
                            ? "Compliant"
                            : "Non-Compliant"}
                        </span>

                      </td>

                    </tr>
                  );
                })}

            </tbody>

          </table>

        </div>


        {purchaseOrders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No recent purchase orders available.
          </div>
        )}

      </div>


      {/* FOOTER INFORMATION */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <p className="text-xs text-gray-500">
            Average Supplier Defect Rate
          </p>

          <p className="text-xl font-bold text-gray-900 mt-2">
            {suppliers.length > 0
              ? (
                  suppliers.reduce(
                    (sum, supplier) =>
                      sum +
                      Number(
                        supplier.defect_rate || 0
                      ),
                    0
                  ) / suppliers.length
                ).toFixed(2)
              : "0.00"}
            %
          </p>

        </div>


        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <p className="text-xs text-gray-500">
            Compliant Order Share
          </p>

          <p className="text-xl font-bold text-green-600 mt-2">
            {Number(complianceRate).toFixed(2)}%
          </p>

        </div>


        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <p className="text-xs text-gray-500">
            Supplier Coverage
          </p>

          <p className="text-xl font-bold text-gray-900 mt-2">
            {suppliers.length}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Suppliers represented in procurement data
          </p>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   SOURCING CENTER
===================================================== */

function SourcingCenter({ setActivePage, setSelectedSupplier }) {
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedSupplierData, setSelectedSupplierData] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [requestForm, setRequestForm] = useState({
    item: "",
    category: "",
    quantity: "",
    requiredDate: "",
    notes: "",
  });

  const loadSourcingData = async () => {
    try {
      setLoading(true);
      setError("");

      const [supplierResponse, poResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/suppliers`),
        fetch(`${API_BASE_URL}/api/purchase-orders`),
      ]);

      if (!supplierResponse.ok || !poResponse.ok) {
        throw new Error("Unable to load sourcing data");
      }

      const supplierData = await supplierResponse.json();
      const poData = await poResponse.json();

      setSuppliers(
        Array.isArray(supplierData.suppliers)
          ? supplierData.suppliers
          : []
      );

      setPurchaseOrders(
        Array.isArray(poData.purchase_orders)
          ? poData.purchase_orders
          : Array.isArray(poData.orders)
          ? poData.orders
          : []
      );
    } catch (err) {
      console.error("Sourcing Center error:", err);
      setError(
        "Unable to load sourcing data. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSourcingData();
  }, []);

  const handleRequestChange = (e) => {
    const { name, value } = e.target;

    setRequestForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

    const createRequest = async () => {
    if (!requestForm.item.trim()) {
      alert("Please enter the item name.");
      return;
    }

    if (!requestForm.quantity || Number(requestForm.quantity) <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/procurement-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item: requestForm.item.trim(),
            category: requestForm.category.trim(),
            quantity: Number(requestForm.quantity),
            required_date: requestForm.requiredDate,
            notes: requestForm.notes.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to create procurement request."
        );
      }

      setShowRequestModal(false);

      setRequestForm({
        item: "",
        category: "",
        quantity: "",
        requiredDate: "",
        notes: "",
      });

      alert(
        `Procurement request #${data.request_id} created successfully.`
      );

    } catch (err) {
      console.error("Create procurement request error:", err);

      alert(
        err.message ||
        "Unable to create procurement request."
      );

    } finally {
      setLoading(false);
    }
  };

  const openSupplier = (supplier) => {
    setSelectedSupplierData(supplier);
    setShowSupplierModal(true);
  };

  const useSupplier = (supplierName) => {
    setSelectedSupplier(supplierName);
    setShowSupplierModal(false);
    setActivePage("RFQ Generator");
  };

  const openOrder = async (order) => {
    try {
      const poId =
        order.po_id ||
        order.PO_ID ||
        order.po_number ||
        order.PO_Number;

      if (!poId) {
        setSelectedOrder(order);
        setShowOrderModal(true);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/purchase-orders/${encodeURIComponent(poId)}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data) {
          setSelectedOrder(data.data);
        } else if (data.success && data.order) {
          setSelectedOrder(data.order);
        } else {
          setSelectedOrder(order);
        }
      } else {
        setSelectedOrder(order);
      }

      setShowOrderModal(true);
    } catch (err) {
      console.error("Unable to load PO details:", err);
      setSelectedOrder(order);
      setShowOrderModal(true);
    }
  };

  const getOrderId = (order) =>
    order.po_id ||
    order.PO_ID ||
    order.po_number ||
    order.PO_Number ||
    "-";

  const getSupplierName = (order) =>
    order.supplier ||
    order.Supplier ||
    "-";

  const getProductName = (order) =>
    order.product ||
    order.item_category ||
    order.Item_Category ||
    "-";

  const getStatus = (order) =>
    order.order_status ||
    order.Order_Status ||
    order.status ||
    "Unknown";

  const getCompliance = (order) =>
    order.compliance ||
    order.Compliance ||
    "Unknown";

  const getQuantity = (order) =>
    order.quantity ||
    order.Quantity ||
    0;

  const getDate = (order) =>
    order.order_date ||
    order.Order_Date ||
    "-";

  const formatCurrency = (value) => {
    const number = Number(value || 0);

    return `Rs. ${number.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const activeOrders = purchaseOrders.slice(0, 8);

  const totalSuppliers = suppliers.length;

  const compliantOrders = purchaseOrders.filter(
    (order) =>
      String(getCompliance(order)).toLowerCase() === "yes" ||
      String(getCompliance(order)).toLowerCase() === "compliant"
  ).length;

  const pendingOrders = purchaseOrders.filter((order) => {
    const status = String(getStatus(order)).toLowerCase();

    return (
      status.includes("pending") ||
      status.includes("processing") ||
      status.includes("open")
    );
  }).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Sourcing Center
          </h1>

          <p className="text-gray-500 mt-1">
            Manage sourcing activities, suppliers, RFQs and procurement orders.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={loadSourcingData}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50"
          >
            Refresh
          </button>

          <button
            onClick={() => setShowRequestModal(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm"
          >
            + New Request
          </button>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Supplier Network
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : totalSuppliers}
              </h2>

              <p className="text-xs text-gray-400 mt-2">
                Available suppliers
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">
              ðŸ¢
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Procurement Orders
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : purchaseOrders.length}
              </h2>

              <p className="text-xs text-gray-400 mt-2">
                Loaded from procurement records
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
              ðŸ“¦
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Pending Orders
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : pendingOrders}
              </h2>

              <p className="text-xs text-gray-400 mt-2">
                Requires monitoring
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-xl">
              â³
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Compliant Orders
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : compliantOrders}
              </h2>

              <p className="text-xs text-gray-400 mt-2">
                Based on procurement records
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-xl">
              âœ“
            </div>
          </div>
        </div>

      </div>

      {/* Procurement Workflow */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">

        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Sourcing Workflow
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Follow the procurement lifecycle from request to purchase order.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">

          {[
            ["01", "Request", "ðŸ“"],
            ["02", "Source Suppliers", "ðŸ¢"],
            ["03", "Generate RFQ", "ðŸ“„"],
            ["04", "Compliance", "âœ“"],
            ["05", "Approval", "ðŸ”"],
            ["06", "Purchase Order", "ðŸ“¦"],
            ["07", "Complete", "âœ“"],
          ].map(([number, title, icon], index) => (

            <div
              key={number}
              className="relative"
            >

              <div className="border border-gray-200 rounded-xl p-4 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition">

                <div className="text-2xl mb-2">
                  {icon}
                </div>

                <p className="text-[10px] font-bold text-indigo-600">
                  STEP {number}
                </p>

                <p className="text-sm font-semibold text-gray-800 mt-1">
                  {title}
                </p>

              </div>

              {index < 6 && (
                <div className="hidden xl:block absolute top-1/2 -right-2 text-gray-300">
                  â†’
                </div>
              )}

            </div>

          ))}

        </div>

      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <button
          onClick={() => setShowRequestModal(true)}
          className="text-left bg-indigo-600 text-white rounded-2xl p-6 hover:bg-indigo-700 transition shadow-sm"
        >
          <div className="text-2xl mb-3">
            ðŸ“
          </div>

          <h3 className="text-lg font-bold">
            Create Procurement Request
          </h3>

          <p className="text-sm text-indigo-100 mt-1">
            Start a new sourcing requirement.
          </p>
        </button>

        <button
          onClick={() => setActivePage("RFQ Generator")}
          className="text-left bg-white border border-gray-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-sm transition"
        >
          <div className="text-2xl mb-3">
            ðŸ“„
          </div>

          <h3 className="text-lg font-bold text-gray-900">
            Generate RFQ
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Create a supplier quotation request.
          </p>
        </button>

        <button
          onClick={() => setActivePage("RFQ History")}
          className="text-left bg-white border border-gray-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-sm transition"
        >
          <div className="text-2xl mb-3">
            ðŸ—‚ï¸
          </div>

          <h3 className="text-lg font-bold text-gray-900">
            RFQ History
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Review previously generated RFQs.
          </p>
        </button>

      </div>

      {/* Supplier Network */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">

        <div className="p-6 border-b border-gray-100 flex items-center justify-between">

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Supplier Network
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Select a supplier to continue sourcing.
            </p>
          </div>

          <button
            onClick={() => setActivePage("Suppliers")}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View All
          </button>

        </div>

        <div className="p-6">

          {loading ? (

            <div className="text-center py-10 text-gray-500">
              Loading suppliers...
            </div>

          ) : suppliers.length === 0 ? (

            <div className="text-center py-10 text-gray-500">
              No suppliers available.
            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

              {suppliers.slice(0, 6).map((supplier, index) => {

                const supplierName =
                  supplier.supplier ||
                  supplier.name ||
                  `Supplier ${index + 1}`;

                const defectRate =
                  supplier.overall_defect_rate ??
                  supplier.defect_rate ??
                  0;

                const complianceRate =
                  supplier.compliance_rate ?? 0;

                return (

                  <div
                    key={supplierName}
                    className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition"
                  >

                    <div className="flex items-start justify-between">

                      <div>
                        <h3 className="font-bold text-gray-900">
                          {supplierName}
                        </h3>

                        <p className="text-xs text-gray-500 mt-1">
                          {supplier.total_orders ?? 0} procurement orders
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        ðŸ¢
                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5">

                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[11px] text-gray-500">
                          Defect Rate
                        </p>

                        <p className="font-bold text-gray-900 mt-1">
                          {Number(defectRate).toFixed(2)}%
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[11px] text-gray-500">
                          Compliance
                        </p>

                        <p className="font-bold text-gray-900 mt-1">
                          {Number(complianceRate).toFixed(2)}%
                        </p>
                      </div>

                    </div>

                    <button
                      onClick={() => openSupplier(supplier)}
                      className="w-full mt-4 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      View Supplier
                    </button>

                  </div>

                );
              })}

            </div>

          )}

        </div>

      </div>

      {/* Recent Procurement Orders */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">

        <div className="p-6 border-b border-gray-100 flex items-center justify-between">

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Recent Procurement Orders
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Latest records available in the procurement database.
            </p>
          </div>

          <button
            onClick={() => setActivePage("Purchase Orders")}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View All
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  PO ID
                </th>

                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Item
                </th>

                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Supplier
                </th>

                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Quantity
                </th>

                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Date
                </th>

                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Status
                </th>

                <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (

                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-10 text-gray-500"
                  >
                    Loading procurement orders...
                  </td>
                </tr>

              ) : activeOrders.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-10 text-gray-500"
                  >
                    No procurement orders found.
                  </td>
                </tr>

              ) : (

                activeOrders.map((order, index) => {

                  const status = getStatus(order);

                  return (

                    <tr
                      key={`${getOrderId(order)}-${index}`}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">
                        <span className="font-semibold text-indigo-600">
                          {getOrderId(order)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {getProductName(order)}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {getSupplierName(order)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {Number(getQuantity(order)).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {getDate(order)}
                      </td>

                      <td className="px-6 py-4">

                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {status}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-right">

                        <button
                          onClick={() => openOrder(order)}
                          className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  );

                })

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* New Request Modal */}
      {showRequestModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl">

            <div className="p-6 border-b border-gray-100 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create Procurement Request
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Enter the requirement to begin the sourcing process.
                </p>
              </div>

              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                Ã—
              </button>

            </div>

            <div className="p-6 space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Item / Requirement
                  </label>

                  <input
                    name="item"
                    value={requestForm.item}
                    onChange={handleRequestChange}
                    placeholder="Example: Laptop"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>

                  <input
                    name="category"
                    value={requestForm.category}
                    onChange={handleRequestChange}
                    placeholder="Example: IT Equipment"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity
                  </label>

                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={requestForm.quantity}
                    onChange={handleRequestChange}
                    placeholder="Enter quantity"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Required Date
                  </label>

                  <input
                    name="requiredDate"
                    type="date"
                    value={requestForm.requiredDate}
                    onChange={handleRequestChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                  />
                </div>

              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Requirements
                </label>

                <textarea
                  name="notes"
                  value={requestForm.notes}
                  onChange={handleRequestChange}
                  rows="4"
                  placeholder="Enter specifications, delivery requirements or other notes..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">

              <button
                onClick={() => setShowRequestModal(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={createRequest}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                Create Request
              </button>

            </div>

          </div>

        </div>

      )}

      {/* Supplier Modal */}
      {showSupplierModal && selectedSupplierData && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl">

            <div className="p-6 border-b border-gray-100 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedSupplierData.supplier ||
                    selectedSupplierData.name ||
                    "Supplier"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Supplier sourcing information
                </p>
              </div>

              <button
                onClick={() => setShowSupplierModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                Ã—
              </button>

            </div>

            <div className="p-6 space-y-4">

              <div className="grid grid-cols-2 gap-4">

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Total Orders
                  </p>

                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {selectedSupplierData.total_orders ?? 0}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Compliance
                  </p>

                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {Number(
                      selectedSupplierData.compliance_rate ?? 0
                    ).toFixed(2)}
                    %
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Defect Rate
                  </p>

                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {Number(
                      selectedSupplierData.overall_defect_rate ??
                        selectedSupplierData.defect_rate ??
                        0
                    ).toFixed(2)}
                    %
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Defective Units
                  </p>

                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {Number(
                      selectedSupplierData.total_defective_units ??
                        selectedSupplierData.defective_units ??
                        0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

              </div>

            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">

              <button
                onClick={() => setShowSupplierModal(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold"
              >
                Close
              </button>

              <button
                onClick={() =>
                  useSupplier(
                    selectedSupplierData.supplier ||
                      selectedSupplierData.name
                  )
                }
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                Use for RFQ
              </button>

            </div>

          </div>

        </div>

      )}

      {/* Purchase Order Modal */}
      {showOrderModal && selectedOrder && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">

            <div className="p-6 border-b border-gray-100 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {getOrderId(selectedOrder)}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Purchase order details
                </p>
              </div>

              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                Ã—
              </button>

            </div>

            <div className="p-6 space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Supplier
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    {getSupplierName(selectedOrder)}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Product / Category
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    {getProductName(selectedOrder)}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Quantity
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    {Number(getQuantity(selectedOrder)).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Order Status
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    {getStatus(selectedOrder)}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Compliance
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    {getCompliance(selectedOrder)}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Order Date
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    {getDate(selectedOrder)}
                  </p>
                </div>

              </div>

              {(selectedOrder.negotiated_price ||
                selectedOrder.Negotiated_Price ||
                selectedOrder.unit_price ||
                selectedOrder.Unit_Price) && (

                <div className="border border-gray-200 rounded-xl p-5">

                  <h3 className="font-bold text-gray-900 mb-4">
                    Financial Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <p className="text-xs text-gray-500">
                        Unit Price
                      </p>

                      <p className="font-semibold text-gray-900 mt-1">
                        {formatCurrency(
                          selectedOrder.unit_price ||
                            selectedOrder.Unit_Price
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Negotiated Price
                      </p>

                      <p className="font-semibold text-gray-900 mt-1">
                        {formatCurrency(
                          selectedOrder.negotiated_price ||
                            selectedOrder.Negotiated_Price
                        )}
                      </p>
                    </div>

                  </div>

                </div>

              )}

            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end">

              <button
                onClick={() => setShowOrderModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/* =====================================================
   AI ASSISTANT
===================================================== */

function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const examples = [
    "What is the compliance status of PO-00056?",
    "What is the supplier for PO-00056?",
    "What is the total procurement value?",
    "Which supplier has the highest defect rate?",
    "How many compliant and non-compliant orders are there?",
    "What are the procurement risks?",
  ];

  const askQuestion = async (text = question) => {
    const finalQuestion = text.trim();

    if (!finalQuestion) return;

    try {
      setLoading(true);
      setAnswer("");

      const response = await fetch(
        `${API_BASE_URL}/api/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: finalQuestion,
          }),
        }
      );

      const data = await response.json();

      const result =
        data.answer ??
        data.response ??
        data.result ??
        data.message ??
        "No response received.";

      setAnswer(result);

      setHistory((prev) => [
        {
          question: finalQuestion,
          answer: result,
        },
        ...prev,
      ]);

      setQuestion("");

    } catch (error) {
      setAnswer(
        "Unable to connect to the Procure Bot AI service."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      <PageTitle
        title="AI Assistant"
        subtitle="Ask procurement questions using the RAG-powered Procure Bot."
      />

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            AI
          </div>

          <div>
            <h2 className="font-bold text-lg">
              Procurement Intelligence Assistant
            </h2>

            <p className="text-sm text-slate-500">
              Ask questions about purchase orders, suppliers, compliance and procurement data.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                askQuestion();
              }
            }}
            placeholder="Ask a procurement question..."
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={() => askQuestion()}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">
            Example Questions
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => askQuestion(example)}
                className="text-left"
              >
                <ExampleQuestion text={example} />
              </button>
            ))}
          </div>
        </div>

      </div>

      {answer && (
        <div className="bg-white border border-indigo-200 rounded-2xl shadow-sm p-6">

          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              AI
            </div>

            <h3 className="font-bold">
              Procure Bot Response
            </h3>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 text-sm text-slate-700 whitespace-pre-wrap leading-7">
            {answer}
          </div>

        </div>
      )}

      {history.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

          <h3 className="font-bold text-lg">
            Recent Questions
          </h3>

          <div className="mt-5 space-y-4">
            {history.slice(0, 5).map((item, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-xl p-4"
              >
                <p className="font-semibold text-sm">
                  {item.question}
                </p>

                <p className="text-sm text-slate-500 mt-2 whitespace-pre-wrap">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

/* =====================================================
   PURCHASE ORDERS
===================================================== */

function PurchaseOrders() {
  const [orders, setOrders] = useState([]);

  const [summary, setSummary] = useState({
    total_orders: 0,
    compliant_orders: 0,
    non_compliant_orders: 0,
    total_procurement_value: 0,
    total_savings: 0,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    const loadPurchaseOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const [ordersResponse, summaryResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/purchase-orders`),
          fetch(`${API_BASE_URL}/api/dashboard/summary`),
        ]);

        if (!ordersResponse.ok) {
          throw new Error("Failed to load purchase orders");
        }

        const ordersData = await ordersResponse.json();

        let summaryData = {};

        if (summaryResponse.ok) {
          summaryData = await summaryResponse.json();
        }

        const actualOrders = Array.isArray(ordersData)
          ? ordersData
          : ordersData.orders || [];

        setOrders(actualOrders);

        setSummary({
          total_orders: Number(summaryData.total_orders || 0),
          compliant_orders: Number(summaryData.compliant_orders || 0),
          non_compliant_orders: Number(
            summaryData.non_compliant_orders || 0
          ),
          total_procurement_value: Number(
            summaryData.total_procurement_value || 0
          ),
          total_savings: Number(summaryData.total_savings || 0),
        });
      } catch (err) {
        console.error("Purchase Orders Error:", err);

        setError(
          "Unable to load purchase orders. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPurchaseOrders();
  }, []);

  /* =====================================================
     GENERIC FIELD HELPER
  ===================================================== */

  const getField = (order, possibleNames) => {
    if (!order) {
      return null;
    }

    for (const name of possibleNames) {
      if (
        order[name] !== undefined &&
        order[name] !== null &&
        order[name] !== ""
      ) {
        return order[name];
      }
    }

    return null;
  };

  /* =====================================================
     FORMATTERS
  ===================================================== */

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "-";
    }

    return `â‚¹${number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return String(value);
    }

    return number.toLocaleString("en-IN");
  };

  /* =====================================================
     PO ID
  ===================================================== */

  const getPoId = (order, index = 0) => {
    return (
      getField(order, [
        "PO_ID",
        "po_id",
        "PO",
        "po",
        "PO_Number",
        "po_number",
      ]) || `PO-${String(index + 1).padStart(5, "0")}`
    );
  };

  /* =====================================================
     ORDER / ITEM NAME
  ===================================================== */

  const getOrderName = (order) => {
    return (
      getField(order, [
        "Item_Name",
        "item_name",
        "Item",
        "item",
        "Product",
        "product",
        "Product_Name",
        "product_name",
        "Order_Name",
        "order_name",
        "Description",
        "description",
        "Item_Category",
        "item_category",
        "Category",
        "category",
      ]) || "General Procurement"
    );
  };

  /* =====================================================
     SUPPLIER
  ===================================================== */

  const getSupplier = (order) => {
    return (
      getField(order, [
        "Supplier",
        "supplier",
        "Supplier_Name",
        "supplier_name",
      ]) || "-"
    );
  };

  /* =====================================================
     QUANTITY
  ===================================================== */

  const getQuantity = (order) => {
    return getField(order, [
      "Quantity",
      "quantity",
      "Qty",
      "qty",
    ]);
  };

  /* =====================================================
     UNIT PRICE
  ===================================================== */

  const getUnitPrice = (order) => {
    return getField(order, [
      "Unit_Price",
      "unit_price",
      "UnitPrice",
      "unitPrice",
    ]);
  };

  /* =====================================================
     NEGOTIATED PRICE
  ===================================================== */

  const getNegotiatedPrice = (order) => {
    return getField(order, [
      "Negotiated_Price",
      "negotiated_price",
      "NegotiatedPrice",
      "negotiatedPrice",
    ]);
  };

  /* =====================================================
     TOTAL ORDER AMOUNT
  ===================================================== */

  const getOrderAmount = (order) => {
    const directAmount = getField(order, [
      "Total_Amount",
      "total_amount",
      "Total_Value",
      "total_value",
      "Procurement_Value",
      "procurement_value",
      "PO_Value",
      "po_value",
      "Amount",
      "amount",
    ]);

    if (directAmount !== null) {
      return Number(directAmount);
    }

    const quantity = Number(getQuantity(order) || 0);

    const negotiatedPrice = Number(
      getNegotiatedPrice(order) ||
        getUnitPrice(order) ||
        0
    );

    if (quantity > 0 && negotiatedPrice > 0) {
      return quantity * negotiatedPrice;
    }

    return null;
  };

  /* =====================================================
     SAVINGS
  ===================================================== */

  const getSavings = (order) => {
    const directSavings = getField(order, [
      "Savings",
      "savings",
      "Total_Savings",
      "total_savings",
    ]);

    if (directSavings !== null) {
      return Number(directSavings);
    }

    const quantity = Number(getQuantity(order) || 0);
    const unitPrice = Number(getUnitPrice(order) || 0);
    const negotiatedPrice = Number(
      getNegotiatedPrice(order) || 0
    );

    if (
      quantity > 0 &&
      unitPrice > 0 &&
      negotiatedPrice > 0
    ) {
      return quantity * (unitPrice - negotiatedPrice);
    }

    return null;
  };

  /* =====================================================
     DEFECTIVE UNITS
  ===================================================== */

  const getDefectiveUnits = (order) => {
    return getField(order, [
      "Defective_Units",
      "defective_units",
      "DefectiveUnits",
      "defectiveUnits",
    ]);
  };

  /* =====================================================
     DEFECT RATE
  ===================================================== */

  const getDefectRate = (order) => {
    const directRate = getField(order, [
      "Defect_Rate",
      "defect_rate",
      "DefectRate",
      "defectRate",
    ]);

    if (directRate !== null) {
      return Number(directRate);
    }

    const quantity = Number(getQuantity(order) || 0);
    const defectiveUnits = Number(
      getDefectiveUnits(order) || 0
    );

    if (quantity > 0) {
      return (defectiveUnits / quantity) * 100;
    }

    return 0;
  };

  /* =====================================================
     COMPLIANCE
  ===================================================== */

  const getComplianceStatus = (order) => {
    const value = getField(order, [
      "Compliance_Status",
      "compliance_status",
      "Compliance",
      "compliance",
      "ComplianceStatus",
      "complianceStatus",
      "Status",
      "status",
    ]);

    if (value === true) {
      return "Compliant";
    }

    if (value === false) {
      return "Non-Compliant";
    }

    if (value === null) {
      return "Unknown";
    }

    const text = String(value).trim().toLowerCase();

    if (
      text === "yes" ||
      text === "true" ||
      text === "compliant" ||
      text === "1"
    ) {
      return "Compliant";
    }

    if (
      text === "no" ||
      text === "false" ||
      text === "non-compliant" ||
      text === "non compliant" ||
      text === "0"
    ) {
      return "Non-Compliant";
    }

    return String(value);
  };

  /* =====================================================
     ORDER STATUS
  ===================================================== */

  const getOrderStatus = (order) => {
    return (
      getField(order, [
        "Order_Status",
        "order_status",
        "OrderStatus",
        "orderStatus",
      ]) || "Unknown"
    );
  };

  /* =====================================================
     DATES
  ===================================================== */

  const getOrderDate = (order) => {
    return getField(order, [
      "Order_Date",
      "order_date",
      "OrderDate",
      "orderDate",
      "Date",
      "date",
    ]);
  };

  const getDeliveryDate = (order) => {
    return getField(order, [
      "Delivery_Date",
      "delivery_date",
      "DeliveryDate",
      "deliveryDate",
    ]);
  };

  /* =====================================================
     STATUS COLOR
  ===================================================== */

  const getStatusStyle = (status) => {
    const text = String(status).toLowerCase();

    if (
      text.includes("deliver") ||
      text.includes("complete")
    ) {
      return "bg-green-100 text-green-700";
    }

    if (
      text.includes("pending") ||
      text.includes("process") ||
      text.includes("progress")
    ) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (
      text.includes("delay") ||
      text.includes("cancel")
    ) {
      return "bg-red-100 text-red-700";
    }

    if (text.includes("ship")) {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-gray-100 text-gray-600";
  };

  /* =====================================================
     OPEN PO DETAILS
  ===================================================== */

  const openOrderDetails = async (order) => {
    setDetailsError("");
    setDetailsLoading(true);

    const poId = getPoId(order);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/purchase-orders/${encodeURIComponent(
          poId
        )}`
      );

      if (response.ok) {
        const data = await response.json();

        const detailOrder =
          data.data ||
          data.order ||
          data.purchase_order ||
          data;

        if (
          detailOrder &&
          typeof detailOrder === "object" &&
          !Array.isArray(detailOrder)
        ) {
          setSelectedOrder(detailOrder);
          return;
        }
      }

      setSelectedOrder(order);
    } catch (err) {
      console.error("PO Details Error:", err);

      setSelectedOrder(order);
      setDetailsError(
        "Detailed backend information was unavailable. Showing available PO data."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredOrders = orders.filter((order) => {
    const poId = String(getPoId(order)).toLowerCase();

    const orderName = String(
      getOrderName(order)
    ).toLowerCase();

    const supplier = String(
      getSupplier(order)
    ).toLowerCase();

    const status = String(
      getOrderStatus(order)
    ).toLowerCase();

    const compliance = String(
      getComplianceStatus(order)
    ).toLowerCase();

    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    return (
      poId.includes(searchText) ||
      orderName.includes(searchText) ||
      supplier.includes(searchText) ||
      status.includes(searchText) ||
      compliance.includes(searchText)
    );
  });

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Purchase Orders
        </h1>

        <p className="text-gray-500 mt-1">
          View, monitor and track procurement purchase orders
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* TOTAL ORDERS */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Orders
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-2">
                {summary.total_orders.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">
                PO
              </span>
            </div>
          </div>
        </div>

        {/* PROCUREMENT VALUE */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Procurement Value
              </p>

              <p className="text-xl font-bold text-gray-900 mt-2">
                {formatCurrency(
                  summary.total_procurement_value
                )}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg">
                Rs
              </span>
            </div>
          </div>
        </div>

        {/* SAVINGS */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Savings
              </p>

              <p className="text-xl font-bold text-gray-900 mt-2">
                {formatCurrency(
                  summary.total_savings
                )}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-purple-50 flex items-center justify-center">
              <span className="text-purple-600 font-bold text-lg">
                %
              </span>
            </div>
          </div>
        </div>

        {/* COMPLIANCE */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Compliance
              </p>

              <p className="text-2xl font-bold text-green-600 mt-2">
                {summary.total_orders > 0
                  ? (
                      (summary.compliant_orders /
                        summary.total_orders) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg">
                OK
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* COMPLIANCE MINI SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">
                Compliant Orders
              </p>

              <p className="text-xl font-bold text-green-800 mt-1">
                {formatNumber(
                  summary.compliant_orders
                )}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              COMPLIANT
            </span>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">
                Non-Compliant Orders
              </p>

              <p className="text-xl font-bold text-red-800 mt-1">
                {formatNumber(
                  summary.non_compliant_orders
                )}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
              REVIEW
            </span>
          </div>
        </div>

      </div>

      {/* SEARCH */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="flex-1">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by PO ID, order name, supplier, status or compliance..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <div className="text-sm text-gray-500">
            Showing {filteredOrders.length} of{" "}
            {orders.length} loaded records
          </div>

        </div>

      </div>

      {/* LOADING */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">

          <div className="text-blue-600 font-medium">
            Loading purchase orders...
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Fetching real procurement data from backend.
          </p>

        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">

          <p className="font-semibold text-red-700">
            Error
          </p>

          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>

        </div>
      )}

      {/* TABLE */}
      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-200">

            <h2 className="font-semibold text-gray-900">
              Purchase Order Records
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Live procurement data from Procure Bot backend
            </p>

          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-10 text-center">

              <p className="text-gray-600 font-medium">
                No purchase orders found
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Try a different search term.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-gray-50 border-b border-gray-200">

                  <tr>

                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      PO ID
                    </th>

                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Order / Item
                    </th>

                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Supplier
                    </th>

                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Quantity
                    </th>

                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Amount
                    </th>

                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Delivery
                    </th>

                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Compliance
                    </th>

                    <th className="text-center px-5 py-4 font-semibold text-gray-600">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredOrders.map((order, index) => {

                    const poId = getPoId(order, index);

                    const orderName =
                      getOrderName(order);

                    const supplier =
                      getSupplier(order);

                    const quantity =
                      getQuantity(order);

                    const amount =
                      getOrderAmount(order);

                    const deliveryDate =
                      getDeliveryDate(order);

                    const status =
                      getOrderStatus(order);

                    const compliance =
                      getComplianceStatus(order);

                    const isCompliant =
                      compliance
                        .toLowerCase()
                        .includes("compliant") &&
                      !compliance
                        .toLowerCase()
                        .includes("non");

                    const isNonCompliant =
                      compliance
                        .toLowerCase()
                        .includes("non");

                    return (
                      <tr
                        key={`${poId}-${index}`}
                        className="hover:bg-gray-50"
                      >

                        {/* PO ID */}
                        <td className="px-5 py-4">

                          <span className="font-semibold text-blue-600">
                            {poId}
                          </span>

                        </td>

                        {/* ORDER NAME */}
                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 text-xs font-bold">
                                PO
                              </span>
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800">
                                {orderName}
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                Procurement item
                              </p>
                            </div>

                          </div>

                        </td>

                        {/* SUPPLIER */}
                        <td className="px-5 py-4">

                          <span className="font-medium text-gray-800">
                            {supplier}
                          </span>

                        </td>

                        {/* QUANTITY */}
                        <td className="px-5 py-4 text-gray-700">
                          {formatNumber(quantity)}
                        </td>

                        {/* AMOUNT */}
                        <td className="px-5 py-4">

                          <div>
                            <p className="font-semibold text-gray-800">
                              {formatCurrency(amount)}
                            </p>

                            {getSavings(order) !== null && (
                              <p className="text-xs text-green-600 mt-1">
                                Save{" "}
                                {formatCurrency(
                                  getSavings(order)
                                )}
                              </p>
                            )}
                          </div>

                        </td>

                        {/* DELIVERY */}
                        <td className="px-5 py-4 text-gray-600">

                          {deliveryDate || "-"}

                        </td>

                        {/* ORDER STATUS */}
                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                              status
                            )}`}
                          >
                            {status}
                          </span>

                        </td>

                        {/* COMPLIANCE */}
                        <td className="px-5 py-4">

                          {isCompliant ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              Compliant
                            </span>
                          ) : isNonCompliant ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              Non-Compliant
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                              {compliance}
                            </span>
                          )}

                        </td>

                        {/* ACTION */}
                        <td className="px-5 py-4 text-center">

                          <button
                            onClick={() =>
                              openOrderDetails(order)
                            }
                            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                          >
                            View Details
                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>
      )}

      {/* BACKEND INFO */}
      {!loading && !error && orders.length > 0 && (
        <div className="text-xs text-gray-400 text-right">
          Backend API: /api/purchase-orders
        </div>
      )}

      {/* =====================================================
          PURCHASE ORDER DETAILS MODAL
      ===================================================== */}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  Purchase Order Details
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  {getPoId(selectedOrder)}
                </h2>

              </div>

              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setDetailsError("");
                }}
                className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold"
              >
                X
              </button>

            </div>

            {/* LOADING */}
            {detailsLoading && (
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 text-sm text-blue-700">
                Loading detailed purchase order information...
              </div>
            )}

            {/* DETAIL ERROR */}
            {detailsError && (
              <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-100 text-sm text-yellow-700">
                {detailsError}
              </div>
            )}

            <div className="p-6 space-y-6">

              {/* TOP INFO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="bg-blue-50 rounded-xl p-4">

                  <p className="text-xs text-blue-600 font-semibold uppercase">
                    Order / Item
                  </p>

                  <p className="text-lg font-bold text-gray-900 mt-2">
                    {getOrderName(selectedOrder)}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-xs text-gray-500 font-semibold uppercase">
                    Supplier
                  </p>

                  <p className="text-lg font-bold text-gray-900 mt-2">
                    {getSupplier(selectedOrder)}
                  </p>

                </div>

                <div className="bg-green-50 rounded-xl p-4">

                  <p className="text-xs text-green-600 font-semibold uppercase">
                    Total Amount
                  </p>

                  <p className="text-lg font-bold text-gray-900 mt-2">
                    {formatCurrency(
                      getOrderAmount(selectedOrder)
                    )}
                  </p>

                </div>

              </div>

              {/* ORDER INFORMATION */}
              <div>

                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  Order Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">
                      PO ID
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {getPoId(selectedOrder)}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">
                      Order Date
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {getOrderDate(selectedOrder) || "-"}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">
                      Delivery Date
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {getDeliveryDate(selectedOrder) || "-"}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">
                      Quantity
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {formatNumber(
                        getQuantity(selectedOrder)
                      )}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">
                      Unit Price
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {formatCurrency(
                        getUnitPrice(selectedOrder)
                      )}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">
                      Negotiated Price
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {formatCurrency(
                        getNegotiatedPrice(
                          selectedOrder
                        )
                      )}
                    </p>
                  </div>

                </div>

              </div>

              {/* FINANCIAL INFORMATION */}
              <div>

                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  Financial Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Unit Price
                    </p>

                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {formatCurrency(
                        getUnitPrice(selectedOrder)
                      )}
                    </p>

                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">

                    <p className="text-xs text-blue-600">
                      Negotiated Price
                    </p>

                    <p className="text-lg font-bold text-blue-800 mt-1">
                      {formatCurrency(
                        getNegotiatedPrice(
                          selectedOrder
                        )
                      )}
                    </p>

                  </div>

                  <div className="bg-green-50 rounded-xl p-4">

                    <p className="text-xs text-green-600">
                      Savings
                    </p>

                    <p className="text-lg font-bold text-green-700 mt-1">
                      {formatCurrency(
                        getSavings(selectedOrder)
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* QUALITY INFORMATION */}
              <div>

                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  Quality & Compliance
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="border border-gray-200 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Defective Units
                    </p>

                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {formatNumber(
                        getDefectiveUnits(
                          selectedOrder
                        )
                      )}
                    </p>

                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Defect Rate
                    </p>

                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {getDefectRate(
                        selectedOrder
                      ).toFixed(2)}
                      %
                    </p>

                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Compliance
                    </p>

                    <div className="mt-2">

                      {getComplianceStatus(
                        selectedOrder
                      )
                        .toLowerCase()
                        .includes("non") ? (
                        <span className="inline-flex px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                          Non-Compliant
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                          {getComplianceStatus(
                            selectedOrder
                          )}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

              </div>

              {/* ORDER TRACKING */}
              <div>

                <h3 className="text-sm font-bold text-gray-900 mb-4">
                  Order Tracking
                </h3>

                <div className="border border-gray-200 rounded-xl p-5">

                  <div className="flex items-center justify-between">

                    <div className="flex flex-col items-center">

                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        1
                      </div>

                      <p className="text-xs font-semibold text-gray-700 mt-2">
                        Ordered
                      </p>

                    </div>

                    <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

                    <div className="flex flex-col items-center">

                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        2
                      </div>

                      <p className="text-xs font-semibold text-gray-700 mt-2">
                        Processing
                      </p>

                    </div>

                    <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

                    <div className="flex flex-col items-center">

                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        3
                      </div>

                      <p className="text-xs font-semibold text-gray-700 mt-2">
                        Shipped
                      </p>

                    </div>

                    <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

                    <div className="flex flex-col items-center">

                      <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                        4
                      </div>

                      <p className="text-xs font-semibold text-gray-700 mt-2">
                        Delivered
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 text-center">

                    <span
                      className={`inline-flex px-4 py-2 rounded-full text-xs font-bold ${getStatusStyle(
                        getOrderStatus(
                          selectedOrder
                        )
                      )}`}
                    >
                      Current Status:{" "}
                      {getOrderStatus(
                        selectedOrder
                      )}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">

              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setDetailsError("");
                }}
                className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}


/* =====================================================
   SEARCH & FILTER
===================================================== */

function SearchAndFilter() {
  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");

  const [complianceFilter, setComplianceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [supplierFilter, setSupplierFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  /* =====================================================
     LOAD PURCHASE ORDERS
  ===================================================== */

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/purchase-orders`
        );

        if (!response.ok) {
          throw new Error("Failed to load procurement records");
        }

        const data = await response.json();

        const actualOrders = Array.isArray(data)
          ? data
          : data.orders || [];

        setOrders(actualOrders);
      } catch (err) {
        console.error("Search & Filter Error:", err);

        setError(
          "Unable to load procurement records. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  /* =====================================================
     GET FIELD
  ===================================================== */

  const getField = (order, possibleNames) => {
    if (!order) {
      return null;
    }

    for (const name of possibleNames) {
      if (
        order[name] !== undefined &&
        order[name] !== null &&
        order[name] !== ""
      ) {
        return order[name];
      }
    }

    return null;
  };

  /* =====================================================
     PO ID
  ===================================================== */

  const getPoId = (order, index = 0) => {
    return (
      getField(order, [
        "PO_ID",
        "po_id",
        "PO",
        "po",
        "PO_Number",
        "po_number",
      ]) || `PO-${String(index + 1).padStart(5, "0")}`
    );
  };

  /* =====================================================
     ORDER NAME
  ===================================================== */

  const getOrderName = (order) => {
    return (
      getField(order, [
        "Item_Name",
        "item_name",
        "Item",
        "item",
        "Product",
        "product",
        "Product_Name",
        "product_name",
        "Order_Name",
        "order_name",
        "Description",
        "description",
        "Item_Category",
        "item_category",
        "Category",
        "category",
      ]) || "General Procurement"
    );
  };

  /* =====================================================
     CATEGORY
  ===================================================== */

  const getCategory = (order) => {
    return (
      getField(order, [
        "Item_Category",
        "item_category",
        "Category",
        "category",
      ]) || "General"
    );
  };

  /* =====================================================
     SUPPLIER
  ===================================================== */

  const getSupplier = (order) => {
    return (
      getField(order, [
        "Supplier",
        "supplier",
        "Supplier_Name",
        "supplier_name",
      ]) || "-"
    );
  };

  /* =====================================================
     ORDER STATUS
  ===================================================== */

  const getOrderStatus = (order) => {
    return (
      getField(order, [
        "Order_Status",
        "order_status",
        "OrderStatus",
        "orderStatus",
      ]) || "Unknown"
    );
  };

  /* =====================================================
     COMPLIANCE
  ===================================================== */

  const getCompliance = (order) => {
    const value = getField(order, [
      "Compliance_Status",
      "compliance_status",
      "Compliance",
      "compliance",
      "ComplianceStatus",
      "complianceStatus",
    ]);

    if (value === true) {
      return "Compliant";
    }

    if (value === false) {
      return "Non-Compliant";
    }

    if (value === null) {
      return "Unknown";
    }

    const text = String(value).trim().toLowerCase();

    if (
      text === "yes" ||
      text === "true" ||
      text === "compliant" ||
      text === "1"
    ) {
      return "Compliant";
    }

    if (
      text === "no" ||
      text === "false" ||
      text === "non-compliant" ||
      text === "non compliant" ||
      text === "0"
    ) {
      return "Non-Compliant";
    }

    return String(value);
  };

  /* =====================================================
     QUANTITY
  ===================================================== */

  const getQuantity = (order) => {
    return getField(order, [
      "Quantity",
      "quantity",
      "Qty",
      "qty",
    ]);
  };

  /* =====================================================
     AMOUNT
  ===================================================== */

  const getAmount = (order) => {
    const directAmount = getField(order, [
      "Total_Amount",
      "total_amount",
      "Total_Value",
      "total_value",
      "Procurement_Value",
      "procurement_value",
      "PO_Value",
      "po_value",
      "Amount",
      "amount",
    ]);

    if (directAmount !== null) {
      return Number(directAmount);
    }

    const quantity = Number(getQuantity(order) || 0);

    const negotiatedPrice = Number(
      getField(order, [
        "Negotiated_Price",
        "negotiated_price",
        "NegotiatedPrice",
        "negotiatedPrice",
      ]) ||
        getField(order, [
          "Unit_Price",
          "unit_price",
        ]) ||
        0
    );

    if (quantity > 0 && negotiatedPrice > 0) {
      return quantity * negotiatedPrice;
    }

    return null;
  };

  /* =====================================================
     CURRENCY
  ===================================================== */

  const formatCurrency = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "-";
    }

    return `Rs. ${number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /* =====================================================
     FILTER OPTIONS
  ===================================================== */

  const suppliers = [
    "All",
    ...Array.from(
      new Set(
        orders
          .map((order) => getSupplier(order))
          .filter(Boolean)
      )
    ),
  ];

  const categories = [
    "All",
    ...Array.from(
      new Set(
        orders
          .map((order) => getCategory(order))
          .filter(Boolean)
      )
    ),
  ];

  const statuses = [
    "All",
    ...Array.from(
      new Set(
        orders
          .map((order) => getOrderStatus(order))
          .filter(Boolean)
      )
    ),
  ];

  /* =====================================================
     CHECK WHETHER USER IS FILTERING
  ===================================================== */

  const hasActiveFilter =
    search.trim() !== "" ||
    supplierFilter !== "All" ||
    categoryFilter !== "All" ||
    statusFilter !== "All" ||
    complianceFilter !== "All";

  /* =====================================================
     FILTER RECORDS
  ===================================================== */

  const filteredOrders = orders.filter((order, index) => {
    const poId = String(
      getPoId(order, index)
    ).toLowerCase();

    const orderName = String(
      getOrderName(order)
    ).toLowerCase();

    const supplier = String(
      getSupplier(order)
    ).toLowerCase();

    const category = String(
      getCategory(order)
    ).toLowerCase();

    const status = String(
      getOrderStatus(order)
    ).toLowerCase();

    const compliance = String(
      getCompliance(order)
    ).toLowerCase();

    const searchText = search
      .toLowerCase()
      .trim();

    const matchesSearch =
      !searchText ||
      poId.includes(searchText) ||
      orderName.includes(searchText) ||
      supplier.includes(searchText) ||
      category.includes(searchText) ||
      status.includes(searchText) ||
      compliance.includes(searchText);

    const matchesSupplier =
      supplierFilter === "All" ||
      getSupplier(order) === supplierFilter;

    const matchesCategory =
      categoryFilter === "All" ||
      getCategory(order) === categoryFilter;

    const matchesStatus =
      statusFilter === "All" ||
      getOrderStatus(order) === statusFilter;

    const matchesCompliance =
      complianceFilter === "All" ||
      getCompliance(order) === complianceFilter;

    return (
      matchesSearch &&
      matchesSupplier &&
      matchesCategory &&
      matchesStatus &&
      matchesCompliance
    );
  });

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const clearFilters = () => {
    setSearch("");
    setSupplierFilter("All");
    setCategoryFilter("All");
    setStatusFilter("All");
    setComplianceFilter("All");
  };

  /* =====================================================
     QUICK FILTER
  ===================================================== */

  const applyQuickFilter = (filter) => {
    setSearch("");
    setSupplierFilter("All");
    setCategoryFilter("All");
    setStatusFilter("All");
    setComplianceFilter("All");

    if (filter === "Compliant") {
      setComplianceFilter("Compliant");
    }

    if (filter === "Non-Compliant") {
      setComplianceFilter("Non-Compliant");
    }

    if (filter === "Pending") {
      setStatusFilter("Pending");
    }

    if (filter === "Delivered") {
      setStatusFilter("Delivered");
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Search & Filter
        </h1>

        <p className="text-gray-500 mt-1">
          Find procurement records using smart search and filters
        </p>
      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

        <div className="flex flex-col md:flex-row gap-3">

          <div className="flex-1">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search PO, supplier, product, category or status..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <button
            onClick={clearFilters}
            className="px-5 py-3 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
          >
            Clear All
          </button>

        </div>

      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

        <div className="mb-4">

          <h2 className="font-semibold text-gray-900">
            Procurement Filters
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Select a filter to view matching records
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* SUPPLIER */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier
            </label>

            <select
              value={supplierFilter}
              onChange={(e) =>
                setSupplierFilter(e.target.value)
              }
              className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >

              {suppliers.map((supplier) => (
                <option
                  key={supplier}
                  value={supplier}
                >
                  {supplier}
                </option>
              ))}

            </select>

          </div>

          {/* CATEGORY */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}

            </select>

          </div>

          {/* STATUS */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >

              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}

            </select>

          </div>

          {/* COMPLIANCE */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compliance
            </label>

            <select
              value={complianceFilter}
              onChange={(e) =>
                setComplianceFilter(e.target.value)
              }
              className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >

              <option value="All">
                All
              </option>

              <option value="Compliant">
                Compliant
              </option>

              <option value="Non-Compliant">
                Non-Compliant
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* =================================================
          QUICK FILTERS
      ================================================= */}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

        <h2 className="font-semibold text-gray-900 mb-4">
          Quick Filters
        </h2>

        <div className="flex flex-wrap gap-3">

          <button
            onClick={() =>
              applyQuickFilter("All")
            }
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200"
          >
            All Orders
          </button>

          <button
            onClick={() =>
              applyQuickFilter("Compliant")
            }
            className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-semibold hover:bg-green-200"
          >
            Compliant
          </button>

          <button
            onClick={() =>
              applyQuickFilter("Non-Compliant")
            }
            className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200"
          >
            Non-Compliant
          </button>

          <button
            onClick={() =>
              applyQuickFilter("Pending")
            }
            className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700 text-sm font-semibold hover:bg-yellow-200"
          >
            Pending
          </button>

          <button
            onClick={() =>
              applyQuickFilter("Delivered")
            }
            className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 text-sm font-semibold hover:bg-blue-200"
          >
            Delivered
          </button>

        </div>

      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">

          <p className="text-blue-600 font-medium">
            Loading procurement data...
          </p>

        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">

          <p className="font-semibold text-red-700">
            Unable to load data
          </p>

          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>

        </div>
      )}

      {/* =================================================
          INITIAL EMPTY STATE
      ================================================= */}

      {!loading &&
        !error &&
        !hasActiveFilter && (

          <div className="bg-white border border-gray-200 rounded-xl p-14 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center">

              <span className="text-blue-600 text-xl font-bold">
                S
              </span>

            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-5">
              Search your procurement data
            </h3>

            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Use the search box, select a filter, or choose a quick
              filter above to view procurement records.
            </p>

          </div>

        )}

      {/* =================================================
          RESULTS HEADER
      ================================================= */}

      {!loading &&
        !error &&
        hasActiveFilter && (

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Matching Procurement Records
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {filteredOrders.length} matching records
              </p>

            </div>

            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Reset
            </button>

          </div>

        )}

      {/* =================================================
          RESULTS
      ================================================= */}

      {!loading &&
        !error &&
        hasActiveFilter &&
        filteredOrders.length > 0 && (

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {filteredOrders.map((order, index) => {

              const poId = getPoId(
                order,
                index
              );

              const orderName =
                getOrderName(order);

              const supplier =
                getSupplier(order);

              const category =
                getCategory(order);

              const quantity =
                getQuantity(order);

              const amount =
                getAmount(order);

              const status =
                getOrderStatus(order);

              const compliance =
                getCompliance(order);

              const isNonCompliant =
                compliance
                  .toLowerCase()
                  .includes("non");

              return (

                <div
                  key={`${poId}-${index}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                >

                  {/* CARD HEADER */}

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-xs text-blue-600 font-semibold">
                        {poId}
                      </p>

                      <h3 className="font-bold text-gray-900 mt-1">
                        {orderName}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {supplier}
                      </p>

                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isNonCompliant
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {compliance}
                    </span>

                  </div>

                  {/* DETAILS */}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">

                    <div className="bg-gray-50 rounded-lg p-3">

                      <p className="text-xs text-gray-500">
                        Category
                      </p>

                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {category}
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">

                      <p className="text-xs text-gray-500">
                        Quantity
                      </p>

                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {quantity || "-"}
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">

                      <p className="text-xs text-gray-500">
                        Amount
                      </p>

                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {formatCurrency(amount)}
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">

                      <p className="text-xs text-gray-500">
                        Status
                      </p>

                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {status}
                      </p>

                    </div>

                  </div>

                  {/* ACTION */}

                  <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">

                    <button
                      onClick={() =>
                        setSelectedOrder(order)
                      }
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                    >
                      View Details
                    </button>

                  </div>

                </div>

              );
            })}

          </div>

        )}

      {/* =================================================
          NO RESULTS
      ================================================= */}

      {!loading &&
        !error &&
        hasActiveFilter &&
        filteredOrders.length === 0 && (

          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">

            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">

              <span className="text-red-500 font-bold">
                !
              </span>

            </div>

            <h3 className="text-lg font-semibold text-gray-800 mt-4">
              No matching records found
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Try another search term or change the selected filters.
            </p>

            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              Clear Filters
            </button>

          </div>

        )}

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedOrder && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            {/* HEADER */}

            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">

              <div>

                <p className="text-xs text-blue-600 font-semibold uppercase">
                  Procurement Record
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  {getPoId(selectedOrder)}
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold"
              >
                X
              </button>

            </div>

            {/* BODY */}

            <div className="p-6 space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="border border-gray-200 rounded-xl p-4">

                  <p className="text-xs text-gray-500">
                    Order / Product
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    {getOrderName(selectedOrder)}
                  </p>

                </div>

                <div className="border border-gray-200 rounded-xl p-4">

                  <p className="text-xs text-gray-500">
                    Supplier
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    {getSupplier(selectedOrder)}
                  </p>

                </div>

                <div className="border border-gray-200 rounded-xl p-4">

                  <p className="text-xs text-gray-500">
                    Category
                  </p>

                  <p className="font-semibold text-gray-900 mt-1">
                    {getCategory(selectedOrder)}
                  </p>

                </div>

                <div className="border border-gray-200 rounded-xl p-4">

                  <p className="text-xs text-gray-500">
                    Quantity
                  </p>

                  <p className="font-semibold text-gray-900 mt-1">
                    {getQuantity(selectedOrder) || "-"}
                  </p>

                </div>

                <div className="border border-gray-200 rounded-xl p-4">

                  <p className="text-xs text-gray-500">
                    Total Amount
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    {formatCurrency(
                      getAmount(selectedOrder)
                    )}
                  </p>

                </div>

                <div className="border border-gray-200 rounded-xl p-4">

                  <p className="text-xs text-gray-500">
                    Order Status
                  </p>

                  <p className="font-semibold text-gray-900 mt-1">
                    {getOrderStatus(selectedOrder)}
                  </p>

                </div>

              </div>

              {/* COMPLIANCE */}

              <div className="border border-gray-200 rounded-xl p-4">

                <p className="text-xs text-gray-500">
                  Compliance Status
                </p>

                <div className="mt-2">

                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                      getCompliance(selectedOrder)
                        .toLowerCase()
                        .includes("non")
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {getCompliance(selectedOrder)}
                  </span>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/* =====================================================
   PRODUCTS
===================================================== */

function Products() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // =====================================================
  // SEARCH PRODUCTS
  // =====================================================

  const searchProducts = async () => {
    const searchText = query.trim();

    if (!searchText) {
      setProducts([]);
      setSearched(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/products/search?q=${encodeURIComponent(
          searchText
        )}`
      );

      if (!response.ok) {
        throw new Error("Product search failed");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.error || "Unable to search products"
        );
      }

      setProducts(data.products || []);
    } catch (err) {
      console.error("Product Search Error:", err);

      setProducts([]);

      setError(
        "Unable to search products. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      searchProducts();
    }
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const clearSearch = () => {
    setQuery("");
    setProducts([]);
    setSearched(false);
    setError("");
    setSelectedProduct(null);
  };

  // =====================================================
  // CURRENCY
  // =====================================================

  const formatCurrency = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return "Rs. 0.00";
    }

    return `Rs. ${number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =====================================================
  // COMPLIANCE STYLE
  // =====================================================

  const getComplianceStyle = (value) => {
    const text = String(value || "")
      .trim()
      .toLowerCase();

    if (text === "compliant") {
      return "bg-green-100 text-green-700";
    }

    if (text === "non-compliant") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  // =====================================================
  // QUALITY STYLE
  // =====================================================

  const getQualityStyle = (value) => {
    const rate = Number(value || 0);

    if (rate <= 2) {
      return {
        label: "Good",
        style: "bg-green-100 text-green-700",
      };
    }

    if (rate <= 5) {
      return {
        label: "Moderate",
        style: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "Needs Attention",
      style: "bg-red-100 text-red-700",
    };
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

        <div>

          <p className="text-sm font-semibold text-blue-600">
            PROCUREMENT CATALOG
          </p>

          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Products
          </h1>

          <p className="text-gray-500 mt-1">
            Search grouped products and procurement records across suppliers
          </p>

        </div>

        {searched && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3">

            <p className="text-xs text-blue-600 font-semibold">
              PRODUCTS FOUND
            </p>

            <p className="text-xl font-bold text-blue-800">
              {products.length}
            </p>

          </div>
        )}

      </div>

      {/* =================================================
          SEARCH PANEL
      ================================================= */}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">

        <div className="flex flex-col lg:flex-row gap-3">

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search product, category, supplier or PO..."
            className="flex-1 px-4 py-3.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <button
            onClick={searchProducts}
            disabled={loading}
            className="px-7 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Searching..." : "Search"}
          </button>

          <button
            onClick={clearSearch}
            className="px-7 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
          >
            Clear
          </button>

        </div>

        {/* QUICK SEARCH */}

        <div className="mt-4 flex flex-wrap items-center gap-2">

          <span className="text-xs text-gray-500 mr-1">
            Quick search:
          </span>

          {["Laptop", "Cable", "Office", "Alpha"].map(
            (item) => (
              <button
                key={item}
                onClick={() => setQuery(item)}
                className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-600 hover:bg-gray-100"
              >
                {item}
              </button>
            )
          )}

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">

          <p className="font-semibold text-red-700">
            Search Error
          </p>

          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>

        </div>
      )}

      {/* =================================================
          INITIAL STATE
      ================================================= */}

      {!searched && !loading && !error && (
        <div className="bg-white border border-gray-200 rounded-2xl p-14 text-center shadow-sm">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center">

            <span className="text-blue-600 text-xl font-bold">
              P
            </span>

          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-5">
            Search the procurement catalog
          </h2>

          <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
            Search for a product, category, supplier or PO.
            Results are grouped by product and supplier to avoid
            duplicate procurement records.
          </p>

        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">

          <div className="text-blue-600 font-semibold">
            Searching procurement catalog...
          </div>

          <p className="text-sm text-gray-500 mt-1">
            Analyzing procurement records
          </p>

        </div>
      )}

      {/* =================================================
          RESULTS
      ================================================= */}

      {!loading &&
        searched &&
        products.length > 0 && (

          <div className="space-y-4">

            {products.map((product, index) => {

              const quality = getQualityStyle(
                product.defect_rate
              );

              return (
                <div
                  key={`${product.supplier}-${product.product}-${index}`}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
                >

                  <div className="p-5">

                    {/* TOP */}

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                      <div className="flex items-start gap-4">

                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">

                          <span className="text-blue-600 font-bold text-sm">
                            PR
                          </span>

                        </div>

                        <div>

                          <p className="text-xs font-semibold text-blue-600 uppercase">
                            Product
                          </p>

                          <h3 className="text-lg font-bold text-gray-900 mt-1">
                            {product.product}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            Supplier:{" "}
                            <span className="font-semibold text-gray-700">
                              {product.supplier}
                            </span>
                          </p>

                        </div>

                      </div>

                      {/* BADGES */}

                      <div className="flex flex-wrap gap-2">

                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getComplianceStyle(
                            product.compliance
                          )}`}
                        >
                          {product.compliance}
                        </span>

                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${quality.style}`}
                        >
                          {quality.label}
                        </span>

                      </div>

                    </div>

                    {/* METRICS */}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">

                      <div className="bg-gray-50 rounded-xl p-3">

                        <p className="text-xs text-gray-500">
                          Total Orders
                        </p>

                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {Number(
                            product.total_orders || 0
                          ).toLocaleString("en-IN")}
                        </p>

                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">

                        <p className="text-xs text-gray-500">
                          Total Quantity
                        </p>

                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {Number(
                            product.total_quantity || 0
                          ).toLocaleString("en-IN")}
                        </p>

                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">

                        <p className="text-xs text-gray-500">
                          Avg. Unit Price
                        </p>

                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {formatCurrency(
                            product.average_unit_price
                          )}
                        </p>

                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">

                        <p className="text-xs text-gray-500">
                          Avg. Negotiated
                        </p>

                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {formatCurrency(
                            product.average_negotiated_price
                          )}
                        </p>

                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">

                        <p className="text-xs text-gray-500">
                          Procurement Value
                        </p>

                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {formatCurrency(
                            product.procurement_value
                          )}
                        </p>

                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">

                        <p className="text-xs text-gray-500">
                          Defect Rate
                        </p>

                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {Number(
                            product.defect_rate || 0
                          ).toFixed(2)}
                          %
                        </p>

                      </div>

                    </div>

                    {/* FOOTER */}

                    <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                      <div className="text-sm text-gray-500">

                        <span>
                          Defective Units:
                        </span>

                        <span className="font-semibold text-gray-800 ml-1">
                          {Number(
                            product.total_defective_units || 0
                          ).toLocaleString("en-IN")}
                        </span>

                        <span className="mx-2 text-gray-300">
                          |
                        </span>

                        <span>
                          Status:
                        </span>

                        <span className="font-semibold text-gray-800 ml-1">
                          {product.order_status || "Unknown"}
                        </span>

                      </div>

                      <button
                        onClick={() =>
                          setSelectedProduct(product)
                        }
                        className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                      >
                        View Product Details
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      {/* =================================================
          NO RESULTS
      ================================================= */}

      {!loading &&
        searched &&
        products.length === 0 &&
        !error && (

          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">

            <div className="w-14 h-14 mx-auto rounded-full bg-yellow-50 flex items-center justify-center">

              <span className="text-yellow-600 text-xl font-bold">
                ?
              </span>

            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-4">
              No matching procurement record
            </h3>

            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              No verified procurement record was found for
              this search.
            </p>

            <p className="text-sm text-blue-600 mt-3 font-medium">
              You can create a new RFQ for this requirement.
            </p>

          </div>
        )}

      {/* =================================================
          PRODUCT DETAILS MODAL
      ================================================= */}

      {selectedProduct && (

        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold text-blue-600 uppercase">
                  Product Procurement Profile
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  {selectedProduct.product}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Supplier: {selectedProduct.supplier}
                </p>

              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold"
              >
                X
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="p-6 space-y-6">

              {/* OVERVIEW */}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">

                <p className="text-xs text-blue-600 font-semibold uppercase">
                  Product
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-1">
                  {selectedProduct.product}
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  Supplier: {selectedProduct.supplier}
                </p>

              </div>

              {/* PROCUREMENT */}

              <div>

                <h3 className="font-bold text-gray-900 mb-3">
                  Procurement Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Total Orders
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {Number(
                        selectedProduct.total_orders || 0
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Total Quantity
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {Number(
                        selectedProduct.total_quantity || 0
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Procurement Value
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {formatCurrency(
                        selectedProduct.procurement_value
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* FINANCIAL */}

              <div>

                <h3 className="font-bold text-gray-900 mb-3">
                  Financial Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="border border-gray-200 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Average Unit Price
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {formatCurrency(
                        selectedProduct.average_unit_price
                      )}
                    </p>

                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Average Negotiated Price
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {formatCurrency(
                        selectedProduct.average_negotiated_price
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* QUALITY */}

              <div>

                <h3 className="font-bold text-gray-900 mb-3">
                  Quality Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Defective Units
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {Number(
                        selectedProduct.total_defective_units || 0
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Defect Rate
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {Number(
                        selectedProduct.defect_rate || 0
                      ).toFixed(2)}
                      %
                    </p>

                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Quality Status
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {selectedProduct.quality_status}
                    </p>

                  </div>

                </div>

              </div>

              {/* STATUS */}

              <div>

                <h3 className="font-bold text-gray-900 mb-3">
                  Procurement Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="border border-gray-200 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Current Order Status
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {selectedProduct.order_status}
                    </p>

                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Compliance
                    </p>

                    <span
                      className={`inline-flex mt-2 px-3 py-1.5 rounded-full text-xs font-bold ${getComplianceStyle(
                        selectedProduct.compliance
                      )}`}
                    >
                      {selectedProduct.compliance}
                    </span>

                  </div>

                </div>

              </div>

              {/* PO RECORDS */}

              <div>

                <h3 className="font-bold text-gray-900 mb-3">
                  Procurement Records
                </h3>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

                  <p className="text-xs text-gray-500 mb-3">
                    Purchase Orders associated with this product
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {(selectedProduct.po_ids || []).map(
                      (po) => (
                        <span
                          key={po}
                          className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700"
                        >
                          {po}
                        </span>
                      )
                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">

              <button
                onClick={() => setSelectedProduct(null)}
                className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/* =====================================================
   SUPPLIERS
===================================================== */

function Suppliers({ setActivePage,  setSelectedSupplier }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/supplier-comparison`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load supplier comparison data.");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Unable to load supplier data.");
        }

        setSuppliers(data.suppliers || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const getPerformance = (supplier) => {
    if (supplier.compliance_rate >= 90 && supplier.defect_rate < 5) {
      return "Strong";
    }

    if (
      supplier.compliance_rate >= 75 &&
      supplier.defect_rate < 10
    ) {
      return "Moderate";
    }

    return "Needs Attention";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Supplier Comparison
          </h1>
          <p className="text-gray-500 mt-1">
            Compare supplier performance using procurement, quality and compliance data.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500">
            Loading supplier comparison data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Supplier Comparison
          </h1>
          <p className="text-gray-500 mt-1">
            Compare supplier performance using procurement, quality and compliance data.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="font-semibold text-red-700">
            Unable to load supplier data
          </p>
          <p className="text-red-600 mt-1">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const totalSuppliers = suppliers.length;

  const totalProcurementValue = suppliers.reduce(
    (sum, supplier) =>
      sum + Number(supplier.total_procurement_value || 0),
    0
  );

  const totalSavings = suppliers.reduce(
    (sum, supplier) =>
      sum + Number(supplier.total_savings || 0),
    0
  );

  const totalDefectiveUnits = suppliers.reduce(
    (sum, supplier) =>
      sum + Number(supplier.defective_units || 0),
    0
  );

  const averageCompliance =
    totalSuppliers > 0
      ? suppliers.reduce(
          (sum, supplier) =>
            sum + Number(supplier.compliance_rate || 0),
          0
        ) / totalSuppliers
      : 0;

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Supplier Comparison
        </h1>

        <p className="text-gray-500 mt-1">
          Compare suppliers across price, quality, savings and compliance.
        </p>
      </div>


      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">
            Total Suppliers
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            {totalSuppliers}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Active suppliers in dataset
          </p>
        </div>


        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">
            Procurement Value
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(totalProcurementValue)}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Total negotiated value
          </p>
        </div>


        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">
            Total Savings
          </p>

          <p className="text-2xl font-bold text-green-600 mt-2">
            {formatCurrency(totalSavings)}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Negotiated price savings
          </p>
        </div>


        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">
            Avg Compliance
          </p>

          <p className="text-2xl font-bold text-blue-600 mt-2">
            {averageCompliance.toFixed(2)}%
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Across all suppliers
          </p>
        </div>

      </div>


      {/* COMPARISON TABLE */}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Supplier Performance Comparison
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Compare procurement, quality and compliance indicators.
          </p>
        </div>


        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Supplier
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Orders
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Avg Unit Price
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Negotiated Price
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Defect Rate
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Compliance
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Savings
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>

              </tr>

            </thead>

            <th className="px-5 py-3 text-center">
               RFQ
            </th>

             
            <tbody className="divide-y divide-gray-100">

              {suppliers.map((supplier) => {

                const performance = getPerformance(supplier);

                return (
                  <tr
                    key={supplier.supplier}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-5 py-4">

                      <p className="font-semibold text-gray-900">
                        {supplier.supplier}
                      </p>

                      <p className="text-xs text-gray-400">
                        {supplier.total_quantity.toLocaleString()} units
                      </p>

                    </td>


                    <td className="px-5 py-4 text-right text-gray-700">
                      {supplier.total_orders}
                    </td>


                    <td className="px-5 py-4 text-right text-gray-700">
                      {formatCurrency(
                        supplier.average_unit_price
                      )}
                    </td>


                    <td className="px-5 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(
                        supplier.average_negotiated_price
                      )}
                    </td>


                    <td className="px-5 py-4 text-right">

                      <span
                        className={
                          Number(supplier.defect_rate) > 10
                            ? "text-red-600 font-semibold"
                            : "text-gray-700"
                        }
                      >
                        {Number(supplier.defect_rate).toFixed(2)}%
                      </span>

                    </td>


                    <td className="px-5 py-4 text-right">

                      <span
                        className={
                          Number(supplier.compliance_rate) >= 80
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {Number(supplier.compliance_rate).toFixed(2)}%
                      </span>

                    </td>


                    <td className="px-5 py-4 text-right font-semibold text-green-600">
                      {formatCurrency(
                        supplier.total_savings
                      )}
                    </td>


                    <td className="px-5 py-4 text-center">

                      <span
                        className={
                          performance === "Strong"
                            ? "inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"
                            : performance === "Moderate"
                            ? "inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"
                            : "inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700"
                        }
                      >
                        {performance}
                      </span>

                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedSupplier(supplier.supplier);
                          setActivePage("RFQ Generator");
                        }}
                        className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                      >
                        Generate RFQ
                      </button>
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>


      {/* SUPPLIER DETAIL CARDS */}

      <div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Supplier Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {suppliers.map((supplier) => (

            <div
              key={supplier.supplier}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >

              <div className="flex items-center justify-between">

                <h3 className="font-semibold text-gray-900">
                  {supplier.supplier}
                </h3>

                <span className="text-xs text-gray-500">
                  {supplier.total_orders} orders
                </span>

              </div>


              <div className="mt-5 space-y-4">

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">
                      Compliance
                    </span>

                    <span className="font-semibold">
                      {Number(
                        supplier.compliance_rate
                      ).toFixed(2)}%
                    </span>
                  </div>

                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          Number(supplier.compliance_rate || 0),
                          100
                        )}%`,
                      }}
                    />

                  </div>
                </div>


                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">
                      Defect Rate
                    </span>

                    <span className="font-semibold">
                      {Number(
                        supplier.defect_rate
                      ).toFixed(2)}%
                    </span>
                  </div>

                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-red-400 rounded-full"
                      style={{
                        width: `${Math.min(
                          Number(supplier.defect_rate || 0),
                          100
                        )}%`,
                      }}
                    />

                  </div>
                </div>


                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-gray-400">
                      Defective Units
                    </p>

                    <p className="font-semibold text-gray-900 mt-1">
                      {Number(
                        supplier.defective_units
                      ).toLocaleString()}
                    </p>
                  </div>


                  <div>
                    <p className="text-xs text-gray-400">
                      Savings
                    </p>

                    <p className="font-semibold text-green-600 mt-1">
                      {formatCurrency(
                        supplier.total_savings
                      )}
                    </p>
                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

/* =====================================================
   QUALITY ANALYSIS
===================================================== */

function QualityAnalysis() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [supplierLoading, setSupplierLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  // =====================================================
  // LOAD SUPPLIERS
  // =====================================================

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      `${API_BASE_URL}/api/suppliers`
    );

    if (!response.ok) {
      throw new Error("Unable to load suppliers");
    }

    const data = await response.json();

    // /api/suppliers returns:
    // {
    //   count: 5,
    //   suppliers: [...]
    // }

    if (!Array.isArray(data.suppliers)) {
      throw new Error(
        "Invalid supplier data received from backend"
      );
    }

    setSuppliers(data.suppliers);

  } catch (err) {

    console.error(
      "Quality Analysis supplier error:",
      err
    );

    setSuppliers([]);

    setError(
      "Unable to load supplier quality data. Please make sure the backend is running."
    );

  } finally {
    setLoading(false);
  }
};
  // =====================================================
  // LOAD SUPPLIER DETAILS
  // =====================================================

  const openSupplier = async (supplier) => {
    const supplierName =
      typeof supplier === "string"
        ? supplier
        : supplier.supplier;

    try {
      setSelectedSupplier(supplierName);
      setSupplierDetails(null);
      setSelectedProduct(null);
      setSupplierLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/quality/supplier/${encodeURIComponent(
          supplierName
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load supplier details"
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.error ||
            "Unable to load supplier details"
        );
      }

      setSupplierDetails(data);
    } catch (err) {
      console.error(
        "Supplier detail error:",
        err
      );

      setError(
        "Unable to load supplier details."
      );
    } finally {
      setSupplierLoading(false);
    }
  };

  // =====================================================
  // BACK TO SUPPLIERS
  // =====================================================

  const backToSuppliers = () => {
    setSelectedSupplier(null);
    setSupplierDetails(null);
    setSelectedProduct(null);
  };

  // =====================================================
  // CURRENCY
  // =====================================================

  const formatCurrency = (value) => {
    const number = Number(value || 0);

    return `Rs. ${number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =====================================================
  // NUMBER
  // =====================================================

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN"
    );
  };

  // =====================================================
  // QUALITY STYLE
  // =====================================================

  const getQualityStyle = (rate) => {
    const value = Number(rate || 0);

    if (value <= 2) {
      return {
        label: "Good",
        badge: "bg-green-100 text-green-700",
        bar: "bg-green-500",
      };
    }

    if (value <= 5) {
      return {
        label: "Moderate",
        badge: "bg-yellow-100 text-yellow-700",
        bar: "bg-yellow-500",
      };
    }

    return {
      label: "Needs Attention",
      badge: "bg-red-100 text-red-700",
      bar: "bg-red-500",
    };
  };

  // =====================================================
  // COMPLIANCE STYLE
  // =====================================================

  const getComplianceStyle = (value) => {
    const text = String(value || "")
      .toLowerCase()
      .trim();

    if (text === "compliant") {
      return "bg-green-100 text-green-700";
    }

    if (text === "non-compliant") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <p className="text-sm font-semibold text-blue-600">
            QUALITY & SUPPLIER INTELLIGENCE
          </p>

          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Quality Analysis
          </h1>

          <p className="text-gray-500 mt-1">
            Loading supplier quality performance...
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">

          <p className="text-blue-600 font-semibold">
            Loading quality data...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !supplierDetails) {
    return (
      <div className="space-y-6">

        <div>
          <p className="text-sm font-semibold text-blue-600">
            QUALITY & SUPPLIER INTELLIGENCE
          </p>

          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Quality Analysis
          </h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">

          <p className="font-semibold text-red-700">
            Quality Analysis Error
          </p>

          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>

          <button
            onClick={loadSuppliers}
            className="mt-4 px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
          >
            Retry
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // SUPPLIER DETAIL VIEW
  // =====================================================

  if (selectedSupplier) {
    return (
      <div className="space-y-6">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <button
              onClick={backToSuppliers}
              className="text-sm text-blue-600 font-semibold hover:text-blue-800 mb-3"
            >
              â† Back to Supplier Performance
            </button>

            <p className="text-sm font-semibold text-blue-600 uppercase">
              Supplier Quality Profile
            </p>

            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              {selectedSupplier}
            </h1>

            <p className="text-gray-500 mt-1">
              Product quality, procurement performance and PO history
            </p>

          </div>

        </div>

        {/* LOADING SUPPLIER */}

        {supplierLoading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">

            <p className="text-blue-600 font-semibold">
              Loading supplier intelligence...
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Fetching products and procurement history
            </p>

          </div>
        )}

        {/* SUPPLIER DATA */}

        {!supplierLoading && supplierDetails && (
          <>
            {/* SUMMARY CARDS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Total Orders
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatNumber(
                    supplierDetails.summary.total_orders
                  )}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Procurement transactions
                </p>

              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Procurement Value
                </p>

                <p className="text-xl font-bold text-gray-900 mt-2">
                  {formatCurrency(
                    supplierDetails.summary.procurement_value
                  )}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Total negotiated value
                </p>

              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Defect Rate
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {Number(
                    supplierDetails.summary.defect_rate || 0
                  ).toFixed(2)}
                  %
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(
                    supplierDetails.summary.total_defective_units
                  )}{" "}
                  defective units
                </p>

              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Compliance
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {Number(
                    supplierDetails.summary.compliance_rate || 0
                  ).toFixed(2)}
                  %
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(
                    supplierDetails.summary.compliant_orders
                  )}{" "}
                  compliant orders
                </p>

              </div>

            </div>

            {/* QUALITY OVERVIEW */}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>

                  <p className="text-xs font-semibold text-blue-600 uppercase">
                    Quality Overview
                  </p>

                  <h2 className="text-lg font-bold text-gray-900 mt-1">
                    Supplier quality performance
                  </h2>

                </div>

                {(() => {
                  const quality =
                    getQualityStyle(
                      supplierDetails.summary.defect_rate
                    );

                  return (
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${quality.badge}`}
                    >
                      {quality.label}
                    </span>
                  );
                })()}

              </div>

              <div className="mt-6">

                <div className="flex justify-between text-sm mb-2">

                  <span className="text-gray-500">
                    Defect Rate
                  </span>

                  <span className="font-semibold text-gray-800">
                    {Number(
                      supplierDetails.summary.defect_rate || 0
                    ).toFixed(2)}
                    %
                  </span>

                </div>

                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

                  <div
                    className={`h-full rounded-full ${
                      getQualityStyle(
                        supplierDetails.summary.defect_rate
                      ).bar
                    }`}
                    style={{
                      width: `${Math.min(
                        Number(
                          supplierDetails.summary.defect_rate || 0
                        ) * 5,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            {/* PRODUCTS */}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

              <div className="px-6 py-5 border-b border-gray-200">

                <p className="text-xs font-semibold text-blue-600 uppercase">
                  Product Performance
                </p>

                <h2 className="text-lg font-bold text-gray-900 mt-1">
                  Products procured from {selectedSupplier}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Click a product to inspect detailed quality and procurement records.
                </p>

              </div>

              <div className="p-5 space-y-4">

                {(supplierDetails.products || []).map(
                  (product, index) => {

                    const quality =
                      getQualityStyle(
                        product.defect_rate
                      );

                    return (
                      <button
                        key={`${product.product}-${index}`}
                        onClick={() =>
                          setSelectedProduct(product)
                        }
                        className="w-full text-left border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition"
                      >

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                          <div>

                            <p className="text-xs font-semibold text-blue-600 uppercase">
                              Product
                            </p>

                            <h3 className="text-lg font-bold text-gray-900 mt-1">
                              {product.product}
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                              {formatNumber(
                                product.total_orders
                              )}{" "}
                              orders
                            </p>

                          </div>

                          <div className="flex flex-wrap gap-2">

                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${quality.badge}`}
                            >
                              {quality.label}
                            </span>

                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getComplianceStyle(
                                product.compliance
                              )}`}
                            >
                              {product.compliance}
                            </span>

                          </div>

                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">

                          <div className="bg-gray-50 rounded-xl p-3">

                            <p className="text-xs text-gray-500">
                              Quantity
                            </p>

                            <p className="text-sm font-bold text-gray-900 mt-1">
                              {formatNumber(
                                product.total_quantity
                              )}
                            </p>

                          </div>

                          <div className="bg-gray-50 rounded-xl p-3">

                            <p className="text-xs text-gray-500">
                              Procurement Value
                            </p>

                            <p className="text-sm font-bold text-gray-900 mt-1">
                              {formatCurrency(
                                product.procurement_value
                              )}
                            </p>

                          </div>

                          <div className="bg-gray-50 rounded-xl p-3">

                            <p className="text-xs text-gray-500">
                              Defective Units
                            </p>

                            <p className="text-sm font-bold text-gray-900 mt-1">
                              {formatNumber(
                                product.defective_units
                              )}
                            </p>

                          </div>

                          <div className="bg-gray-50 rounded-xl p-3">

                            <p className="text-xs text-gray-500">
                              Defect Rate
                            </p>

                            <p className="text-sm font-bold text-gray-900 mt-1">
                              {Number(
                                product.defect_rate || 0
                              ).toFixed(2)}
                              %
                            </p>

                          </div>

                        </div>

                        <div className="mt-4 text-right">

                          <span className="text-sm text-blue-600 font-semibold">
                            View Product Details â†’
                          </span>

                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            </div>

            {/* PO HISTORY */}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

              <div className="px-6 py-5 border-b border-gray-200">

                <p className="text-xs font-semibold text-blue-600 uppercase">
                  Procurement History
                </p>

                <h2 className="text-lg font-bold text-gray-900 mt-1">
                  Purchase Order History
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Historical procurement transactions for this supplier.
                </p>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-gray-50 border-b border-gray-200">

                    <tr>

                      <th className="text-left px-5 py-4 font-semibold text-gray-600">
                        PO ID
                      </th>

                      <th className="text-left px-5 py-4 font-semibold text-gray-600">
                        Product
                      </th>

                      <th className="text-left px-5 py-4 font-semibold text-gray-600">
                        Quantity
                      </th>

                      <th className="text-left px-5 py-4 font-semibold text-gray-600">
                        Value
                      </th>

                      <th className="text-left px-5 py-4 font-semibold text-gray-600">
                        Defect Rate
                      </th>

                      <th className="text-left px-5 py-4 font-semibold text-gray-600">
                        Compliance
                      </th>

                      <th className="text-left px-5 py-4 font-semibold text-gray-600">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {(supplierDetails.orders || []).map(
                      (order, index) => (

                        <tr
                          key={`${order.po_id}-${index}`}
                          className="hover:bg-gray-50"
                        >

                          <td className="px-5 py-4 font-semibold text-blue-600">
                            {order.po_id}
                          </td>

                          <td className="px-5 py-4 text-gray-800">
                            {order.product}
                          </td>

                          <td className="px-5 py-4 text-gray-800">
                            {formatNumber(
                              order.quantity
                            )}
                          </td>

                          <td className="px-5 py-4 font-semibold text-gray-800">
                            {formatCurrency(
                              order.procurement_value
                            )}
                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={
                                Number(
                                  order.defect_rate || 0
                                ) > 5
                                  ? "text-red-600 font-semibold"
                                  : "text-gray-800"
                              }
                            >
                              {Number(
                                order.defect_rate || 0
                              ).toFixed(2)}
                              %
                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getComplianceStyle(
                                String(
                                  order.compliance
                                )
                                  .toLowerCase()
                                  .includes("yes")
                                  ? "Compliant"
                                  : "Non-Compliant"
                              )}`}
                            >
                              {String(
                                order.compliance
                              )
                                .toLowerCase()
                                .includes("yes")
                                ? "Compliant"
                                : "Non-Compliant"}
                            </span>

                          </td>

                          <td className="px-5 py-4 text-gray-700">
                            {order.order_status}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </>
        )}

        {/* =================================================
            PRODUCT DETAIL MODAL
        ================================================= */}

        {selectedProduct && (

          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">

              {/* HEADER */}

              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold text-blue-600 uppercase">
                    Product Quality Profile
                  </p>

                  <h2 className="text-xl font-bold text-gray-900 mt-1">
                    {selectedProduct.product}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Supplier: {selectedSupplier}
                  </p>

                </div>

                <button
                  onClick={() =>
                    setSelectedProduct(null)
                  }
                  className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold"
                >
                  X
                </button>

              </div>

              {/* BODY */}

              <div className="p-6 space-y-6">

                {/* PRODUCT OVERVIEW */}

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">

                  <p className="text-xs text-blue-600 font-semibold uppercase">
                    Product
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-1">
                    {selectedProduct.product}
                  </h3>

                  <p className="text-sm text-gray-600 mt-1">
                    Supplier: {selectedSupplier}
                  </p>

                </div>

                {/* PROCUREMENT */}

                <div>

                  <h3 className="font-bold text-gray-900 mb-3">
                    Procurement Metrics
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="bg-gray-50 rounded-xl p-4">

                      <p className="text-xs text-gray-500">
                        Total Orders
                      </p>

                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {formatNumber(
                          selectedProduct.total_orders
                        )}
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">

                      <p className="text-xs text-gray-500">
                        Total Quantity
                      </p>

                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {formatNumber(
                          selectedProduct.total_quantity
                        )}
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">

                      <p className="text-xs text-gray-500">
                        Procurement Value
                      </p>

                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {formatCurrency(
                          selectedProduct.procurement_value
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                {/* QUALITY */}

                <div>

                  <h3 className="font-bold text-gray-900 mb-3">
                    Quality Metrics
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="bg-gray-50 rounded-xl p-4">

                      <p className="text-xs text-gray-500">
                        Defective Units
                      </p>

                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {formatNumber(
                          selectedProduct.defective_units
                        )}
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">

                      <p className="text-xs text-gray-500">
                        Defect Rate
                      </p>

                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {Number(
                          selectedProduct.defect_rate || 0
                        ).toFixed(2)}
                        %
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">

                      <p className="text-xs text-gray-500">
                        Quality Status
                      </p>

                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {getQualityStyle(
                          selectedProduct.defect_rate
                        ).label}
                      </p>

                    </div>

                  </div>

                </div>

                {/* COMPLIANCE */}

                <div className="border border-gray-200 rounded-xl p-5">

                  <p className="text-xs text-gray-500">
                    Compliance Status
                  </p>

                  <span
                    className={`inline-flex mt-2 px-3 py-1.5 rounded-full text-xs font-bold ${getComplianceStyle(
                      selectedProduct.compliance
                    )}`}
                  >
                    {selectedProduct.compliance}
                  </span>

                </div>

                {/* PO LIST */}

                <div>

                  <h3 className="font-bold text-gray-900 mb-3">
                    Associated Purchase Orders
                  </h3>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

                    <div className="flex flex-wrap gap-2">

                      {(selectedProduct.po_ids || []).map(
                        (po) => (

                          <span
                            key={po}
                            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700"
                          >
                            {po}
                          </span>

                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>

              {/* FOOTER */}

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">

                <button
                  onClick={() =>
                    setSelectedProduct(null)
                  }
                  className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    );
  }

  // =====================================================
  // MAIN SUPPLIER VIEW
  // =====================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <p className="text-sm font-semibold text-blue-600">
          QUALITY & SUPPLIER INTELLIGENCE
        </p>

        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          Quality Analysis
        </h1>

        <p className="text-gray-500 mt-1">
          Monitor supplier quality, defect rates and procurement performance
        </p>

      </div>

      {/* SUPPLIER COUNT */}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          <div>

            <p className="text-xs font-semibold text-blue-600 uppercase">
              Supplier Performance
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-1">
              Supplier Quality Overview
            </h2>

          </div>

          <div className="bg-blue-50 rounded-xl px-4 py-3">

            <p className="text-xs text-blue-600 font-semibold">
              SUPPLIERS
            </p>

            <p className="text-xl font-bold text-blue-800">
              {suppliers.length}
            </p>

          </div>

        </div>

      </div>

      {/* SUPPLIER CARDS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {suppliers.map((supplier, index) => {

          const quality =
            getQualityStyle(
              supplier.overall_defect_rate ||
              supplier.defect_rate
            );

          return (

            <button
              key={`${supplier.supplier}-${index}`}
              onClick={() =>
                openSupplier(supplier)
              }
              className="text-left bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition p-5"
            >

              {/* HEADER */}

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">

                    <span className="text-blue-600 font-bold">
                      S
                    </span>

                  </div>

                  <div>

                    <p className="text-xs font-semibold text-blue-600 uppercase">
                      Supplier
                    </p>

                    <h3 className="text-lg font-bold text-gray-900 mt-1">
                      {supplier.supplier}
                    </h3>

                  </div>

                </div>

                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${quality.badge}`}
                >
                  {quality.label}
                </span>

              </div>

              {/* METRICS */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">

                <div className="bg-gray-50 rounded-xl p-3">

                  <p className="text-xs text-gray-500">
                    Orders
                  </p>

                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {formatNumber(
                      supplier.total_orders
                    )}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-xl p-3">

                  <p className="text-xs text-gray-500">
                    Defective
                  </p>

                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {formatNumber(
                      supplier.defective_units
                    )}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-xl p-3">

                  <p className="text-xs text-gray-500">
                    Defect Rate
                  </p>

                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {Number(
                      supplier.overall_defect_rate ||
                        supplier.defect_rate ||
                        0
                    ).toFixed(2)}
                    %
                  </p>

                </div>

                <div className="bg-gray-50 rounded-xl p-3">

                  <p className="text-xs text-gray-500">
                    Compliance
                  </p>

                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {Number(
                      supplier.compliance_rate || 0
                    ).toFixed(2)}
                    %
                  </p>

                </div>

              </div>

              {/* DEFECT BAR */}

              <div className="mt-5">

                <div className="flex justify-between text-xs mb-2">

                  <span className="text-gray-500">
                    Defect rate
                  </span>

                  <span className="font-semibold text-gray-700">
                    {Number(
                      supplier.overall_defect_rate ||
                        supplier.defect_rate ||
                        0
                    ).toFixed(2)}
                    %
                  </span>

                </div>

                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">

                  <div
                    className={`h-full rounded-full ${quality.bar}`}
                    style={{
                      width: `${Math.min(
                        Number(
                          supplier.overall_defect_rate ||
                            supplier.defect_rate ||
                            0
                        ) * 5,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

              {/* ACTION */}

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  View supplier quality profile
                </span>

                <span className="text-sm font-semibold text-blue-600">
                  Open â†’
                </span>

              </div>

            </button>

          );
        })}

      </div>

    </div>
  );
}

/* =====================================================
   ANALYTICS
===================================================== */

function Analytics() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadSupplierPerformance();
  }, []);

  const loadSupplierPerformance = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      `${API_BASE_URL}/api/supplier-comparison`
    );

    if (!response.ok) {
      throw new Error("Unable to load supplier performance");
    }

    const data = await response.json();

    console.log("Supplier comparison response:", data);

    if (!data.success) {
      throw new Error(
        data.error || "Unable to load supplier performance"
      );
    }

    if (!Array.isArray(data.suppliers)) {
      throw new Error(
        "Invalid supplier performance data received"
      );
    }

    setSuppliers(data.suppliers);

  } catch (err) {
    console.error(
      "Supplier performance error:",
      err
    );

    setSuppliers([]);

    setError(
      "Unable to load supplier performance. Please make sure the backend is running."
    );

  } finally {
    setLoading(false);
  }
};

  const openSupplierDetails = async (supplier) => {
    setSelectedSupplier(supplier);
    setSupplierDetails(null);
    setDetailsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/quality/supplier/${encodeURIComponent(
          supplier.supplier
        )}`
      );

      if (!response.ok) {
        throw new Error("Unable to load supplier details");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.error || "Unable to load supplier details"
        );
      }

      setSupplierDetails(data);
    } catch (err) {
      console.error("Supplier details error:", err);
      setSupplierDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeSupplierDetails = () => {
    setSelectedSupplier(null);
    setSupplierDetails(null);
  };

  const getDefectStatus = (rate) => {
    const value = Number(rate || 0);

    if (value <= 2) {
      return {
        label: "Good",
        className: "bg-green-100 text-green-700",
      };
    }

    if (value <= 5) {
      return {
        label: "Moderate",
        className: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "Needs Attention",
      className: "bg-red-100 text-red-700",
    };
  };

  const getComplianceStatus = (rate) => {
    const value = Number(rate || 0);

    if (value >= 90) {
      return "bg-green-100 text-green-700";
    }

    if (value >= 75) {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  };

  const formatCurrency = (value) => {
    return `Rs. ${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const totalOrders = suppliers.reduce(
    (sum, supplier) =>
      sum + Number(supplier.total_orders || 0),
    0
  );

  const averageCompliance =
    suppliers.length > 0
      ? suppliers.reduce(
          (sum, supplier) =>
            sum + Number(supplier.compliance_rate || 0),
          0
        ) / suppliers.length
      : 0;

  const averageDefectRate =
    suppliers.length > 0
      ? suppliers.reduce(
          (sum, supplier) =>
            sum + Number(supplier.defect_rate || 0),
          0
        ) / suppliers.length
      : 0;

  const totalSavings = suppliers.reduce(
    (sum, supplier) =>
      sum + Number(supplier.total_savings || 0),
    0
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Supplier Performance
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Monitor supplier quality, compliance, pricing and savings
          across procurement operations.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Suppliers
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {suppliers.length}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Active procurement suppliers
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {totalOrders.toLocaleString("en-IN")}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Orders across suppliers
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Avg. Compliance
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {averageCompliance.toFixed(2)}%
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Supplier compliance rate
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Savings
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(totalSavings)}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Negotiated procurement savings
            </p>
          </div>

        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <p className="font-semibold text-red-700">
            Supplier Performance Error
          </p>

          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>

          <button
            onClick={loadSupplierPerformance}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-500">
            Loading supplier performance...
          </p>
        </div>
      )}

      {/* SUPPLIER TABLE */}
      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Supplier Performance
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Click View Details to inspect supplier-level
                  procurement and quality information.
                </p>
              </div>

              <button
                onClick={loadSupplierPerformance}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Refresh
              </button>

            </div>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b border-gray-200">

                <tr>

                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Supplier
                  </th>

                  <th className="text-center px-4 py-4 font-semibold text-gray-600">
                    Orders
                  </th>

                  <th className="text-right px-4 py-4 font-semibold text-gray-600">
                    Avg. Unit Price
                  </th>

                  <th className="text-right px-4 py-4 font-semibold text-gray-600">
                    Avg. Negotiated
                  </th>

                  <th className="text-center px-4 py-4 font-semibold text-gray-600">
                    Defect Rate
                  </th>

                  <th className="text-center px-4 py-4 font-semibold text-gray-600">
                    Compliance
                  </th>

                  <th className="text-right px-4 py-4 font-semibold text-gray-600">
                    Savings
                  </th>

                  <th className="text-center px-6 py-4 font-semibold text-gray-600">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {suppliers.map((supplier) => {

                  const defectStatus = getDefectStatus(
                    supplier.defect_rate
                  );

                  return (
                    <tr
                      key={supplier.supplier}
                      className="hover:bg-gray-50 transition"
                    >

                      <td className="px-6 py-4">

                        <div className="font-semibold text-gray-900">
                          {supplier.supplier}
                        </div>

                        <div className="text-xs text-gray-400 mt-1">
                          Procurement supplier
                        </div>

                      </td>

                      <td className="px-4 py-4 text-center font-semibold text-gray-700">
                        {Number(
                          supplier.total_orders || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-4 text-right text-gray-700">
                        {formatCurrency(
                          supplier.average_unit_price
                        )}
                      </td>

                      <td className="px-4 py-4 text-right text-gray-700">
                        {formatCurrency(
                          supplier.average_negotiated_price
                        )}
                      </td>

                      <td className="px-4 py-4 text-center">

                        <div className="flex flex-col items-center gap-1">

                          <span className="font-semibold text-gray-800">
                            {Number(
                              supplier.defect_rate || 0
                            ).toFixed(2)}
                            %
                          </span>

                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${defectStatus.className}`}
                          >
                            {defectStatus.label}
                          </span>

                        </div>

                      </td>

                      <td className="px-4 py-4 text-center">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getComplianceStatus(
                            supplier.compliance_rate
                          )}`}
                        >
                          {Number(
                            supplier.compliance_rate || 0
                          ).toFixed(2)}
                          %
                        </span>

                      </td>

                      <td className="px-4 py-4 text-right font-semibold text-gray-800">
                        {formatCurrency(
                          supplier.total_savings
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">

                        <button
                          onClick={() =>
                            openSupplierDetails(supplier)
                          }
                          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                        >
                          View Details
                        </button>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

          {suppliers.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No supplier performance data available.
            </div>
          )}

        </div>
      )}

      {/* SUPPLIER DETAILS MODAL */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">

            {/* MODAL HEADER */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedSupplier.supplier}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Detailed supplier performance and procurement
                  quality analysis
                </p>
              </div>

              <button
                onClick={closeSupplierDetails}
                className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold"
              >
                X
              </button>

            </div>

            {/* MODAL BODY */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-90px)]">

              {detailsLoading && (
                <div className="py-16 text-center text-gray-500">
                  Loading supplier details...
                </div>
              )}

              {!detailsLoading && !supplierDetails && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
                  Unable to load detailed supplier information.
                </div>
              )}

              {!detailsLoading && supplierDetails && (
                <div className="space-y-6">

                  {/* SUMMARY */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500">
                        Total Orders
                      </p>

                      <p className="text-xl font-bold text-gray-900 mt-1">
                        {Number(
                          supplierDetails.summary.total_orders || 0
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500">
                        Procurement Value
                      </p>

                      <p className="text-xl font-bold text-gray-900 mt-1">
                        {formatCurrency(
                          supplierDetails.summary.procurement_value
                        )}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500">
                        Defect Rate
                      </p>

                      <p className="text-xl font-bold text-gray-900 mt-1">
                        {Number(
                          supplierDetails.summary.defect_rate || 0
                        ).toFixed(2)}
                        %
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500">
                        Compliance Rate
                      </p>

                      <p className="text-xl font-bold text-gray-900 mt-1">
                        {Number(
                          supplierDetails.summary.compliance_rate || 0
                        ).toFixed(2)}
                        %
                      </p>
                    </div>

                  </div>

                  {/* QUALITY STATUS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="border border-gray-200 rounded-xl p-5">

                      <p className="text-sm font-semibold text-gray-700">
                        Quality Status
                      </p>

                      <div className="mt-3">

                        {(() => {
                          const status = getDefectStatus(
                            supplierDetails.summary.defect_rate
                          );

                          return (
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          );
                        })()}

                      </div>

                    </div>

                    <div className="border border-gray-200 rounded-xl p-5">

                      <p className="text-sm font-semibold text-gray-700">
                        Compliant Orders
                      </p>

                      <p className="text-2xl font-bold text-green-600 mt-2">
                        {Number(
                          supplierDetails.summary.compliant_orders ||
                            0
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>

                    <div className="border border-gray-200 rounded-xl p-5">

                      <p className="text-sm font-semibold text-gray-700">
                        Non-Compliant Orders
                      </p>

                      <p className="text-2xl font-bold text-red-600 mt-2">
                        {Number(
                          supplierDetails.summary
                            .non_compliant_orders || 0
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>

                  </div>

                  {/* PRODUCT PERFORMANCE */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">

                    <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">

                      <h3 className="font-bold text-gray-900">
                        Product Performance
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        Product-level quality and compliance details
                      </p>

                    </div>

                    <div className="overflow-x-auto">

                      <table className="w-full text-sm">

                        <thead className="border-b border-gray-200">

                          <tr>

                            <th className="text-left px-5 py-3 font-semibold text-gray-600">
                              Product
                            </th>

                            <th className="text-center px-4 py-3 font-semibold text-gray-600">
                              Orders
                            </th>

                            <th className="text-right px-4 py-3 font-semibold text-gray-600">
                              Quantity
                            </th>

                            <th className="text-right px-4 py-3 font-semibold text-gray-600">
                              Procurement Value
                            </th>

                            <th className="text-center px-4 py-3 font-semibold text-gray-600">
                              Defect Rate
                            </th>

                            <th className="text-center px-5 py-3 font-semibold text-gray-600">
                              Compliance
                            </th>

                          </tr>

                        </thead>

                        <tbody className="divide-y divide-gray-100">

                          {(supplierDetails.products || []).map(
                            (product) => {

                              const status = getDefectStatus(
                                product.defect_rate
                              );

                              return (
                                <tr
                                  key={product.product}
                                  className="hover:bg-gray-50"
                                >

                                  <td className="px-5 py-4 font-semibold text-gray-900">
                                    {product.product}
                                  </td>

                                  <td className="px-4 py-4 text-center">
                                    {product.total_orders}
                                  </td>

                                  <td className="px-4 py-4 text-right">
                                    {Number(
                                      product.total_quantity || 0
                                    ).toLocaleString("en-IN")}
                                  </td>

                                  <td className="px-4 py-4 text-right">
                                    {formatCurrency(
                                      product.procurement_value
                                    )}
                                  </td>

                                  <td className="px-4 py-4 text-center">

                                    <div className="flex flex-col items-center gap-1">

                                      <span className="font-semibold">
                                        {Number(
                                          product.defect_rate || 0
                                        ).toFixed(2)}
                                        %
                                      </span>

                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${status.className}`}
                                      >
                                        {status.label}
                                      </span>

                                    </div>

                                  </td>

                                  <td className="px-5 py-4 text-center">

                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        String(
                                          product.compliance
                                        ).toLowerCase() === "yes"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-red-100 text-red-700"
                                      }`}
                                    >
                                      {String(
                                        product.compliance
                                      ).toLowerCase() === "yes"
                                        ? "Compliant"
                                        : "Non-Compliant"}
                                    </span>

                                  </td>

                                </tr>
                              );
                            }
                          )}

                        </tbody>

                      </table>

                    </div>

                  </div>

                  {/* ORDER HISTORY */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">

                    <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">

                      <h3 className="font-bold text-gray-900">
                        Recent Order History
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        Supplier purchase order history
                      </p>

                    </div>

                    <div className="overflow-x-auto max-h-80">

                      <table className="w-full text-sm">

                        <thead className="bg-white sticky top-0 border-b border-gray-200">

                          <tr>

                            <th className="text-left px-5 py-3 font-semibold text-gray-600">
                              PO ID
                            </th>

                            <th className="text-left px-4 py-3 font-semibold text-gray-600">
                              Product
                            </th>

                            <th className="text-left px-4 py-3 font-semibold text-gray-600">
                              Order Date
                            </th>

                            <th className="text-right px-4 py-3 font-semibold text-gray-600">
                              Quantity
                            </th>

                            <th className="text-right px-4 py-3 font-semibold text-gray-600">
                              Amount
                            </th>

                            <th className="text-center px-4 py-3 font-semibold text-gray-600">
                              Defect
                            </th>

                            <th className="text-center px-5 py-3 font-semibold text-gray-600">
                              Compliance
                            </th>

                          </tr>

                        </thead>

                        <tbody className="divide-y divide-gray-100">

                          {(supplierDetails.orders || []).map(
                            (order) => (
                              <tr
                                key={order.po_id}
                                className="hover:bg-gray-50"
                              >

                                <td className="px-5 py-3 font-semibold text-gray-800">
                                  {order.po_id}
                                </td>

                                <td className="px-4 py-3 text-gray-700">
                                  {order.product}
                                </td>

                                <td className="px-4 py-3 text-gray-600">
                                  {order.order_date}
                                </td>

                                <td className="px-4 py-3 text-right">
                                  {Number(
                                    order.quantity || 0
                                  ).toLocaleString("en-IN")}
                                </td>

                                <td className="px-4 py-3 text-right">
                                  {formatCurrency(
                                    order.procurement_value
                                  )}
                                </td>

                                <td className="px-4 py-3 text-center">

                                  <span
                                    className={`font-semibold ${
                                      Number(
                                        order.defect_rate || 0
                                      ) > 5
                                        ? "text-red-600"
                                        : Number(
                                            order.defect_rate || 0
                                          ) > 2
                                        ? "text-yellow-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {Number(
                                      order.defect_rate || 0
                                    ).toFixed(2)}
                                    %
                                  </span>

                                </td>

                                <td className="px-5 py-3 text-center">

                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                      String(
                                        order.compliance
                                      ).toLowerCase() === "yes"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {String(
                                      order.compliance
                                    ).toLowerCase() === "yes"
                                      ? "Compliant"
                                      : "Non-Compliant"}
                                  </span>

                                </td>

                              </tr>
                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* =====================================================
   COMPLIANCE
===================================================== */

function Compliance() {
  const [summary, setSummary] = useState(null);
  const [po, setPo] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD COMPLIANCE SUMMARY
  ===================================================== */

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/dashboard/compliance`
        );

        if (!response.ok) {
          throw new Error("Failed to load compliance summary.");
        }

        const data = await response.json();

        setSummary(data);
      } catch (error) {
        console.error("Compliance summary error:", error);
      } finally {
        setSummaryLoading(false);
      }
    };

    loadSummary();
  }, []);

  /* =====================================================
     CHECK INDIVIDUAL PO
  ===================================================== */

  const checkCompliance = async () => {
    const poId = po.trim().toUpperCase();

    if (!poId) {
      setError("Please enter a Purchase Order ID.");
      setResult(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch(
        `${API_BASE_URL}/api/compliance/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            po_id: poId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.detail ||
          "Compliance check failed."
        );
      }

      if (data?.success === false) {
        throw new Error(
          data?.error ||
          "Unable to check compliance."
        );
      }

      setResult(data?.data || data);

    } catch (error) {
      console.error("Compliance check error:", error);

      setError(
        error.message ||
        "Unable to check compliance."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     HELPERS
  ===================================================== */

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  const formatCurrency = (value) => {
    return `â‚¹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPercent = (value) => {
    return `${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;
  };

  /* =====================================================
     SUMMARY VALUES
  ===================================================== */

  const compliantOrders = Number(
    summary?.compliant_orders ||
    summary?.compliantOrders ||
    0
  );

  const nonCompliantOrders = Number(
    summary?.non_compliant_orders ||
    summary?.nonCompliantOrders ||
    0
  );

  const complianceRate = Number(
    summary?.compliance_rate ||
    summary?.complianceRate ||
    0
  );

  const totalOrders =
    compliantOrders + nonCompliantOrders;

  /* =====================================================
     LOADING SUMMARY
  ===================================================== */

  if (summaryLoading) {
    return (
      <div className="space-y-6">

        <PageTitle
          title="Compliance Intelligence"
          subtitle="Monitor procurement compliance and verify individual purchase orders."
        />

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">

          <div className="mx-auto w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>

          <p className="mt-4 text-slate-500 font-medium">
            Loading compliance intelligence...
          </p>

        </div>

      </div>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-sm">
            âœ“
          </div>

          <div>

            <h1 className="text-2xl font-bold text-slate-900">
              Compliance Intelligence
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Monitor procurement compliance and verify purchase orders
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2">

          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>

          <span className="text-sm font-medium text-slate-600">
            Live Compliance Data
          </span>

        </div>

      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Compliance Rate */}

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Compliance Rate
              </p>

              <h2 className="text-3xl font-bold text-indigo-600 mt-3">
                {formatPercent(complianceRate)}
              </h2>

            </div>

            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
              %
            </div>

          </div>

          <div className="mt-5 h-2 bg-slate-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(
                  Math.max(complianceRate, 0),
                  100
                )}%`,
              }}
            ></div>

          </div>

          <p className="text-xs text-slate-400 mt-3">
            Overall procurement compliance
          </p>

        </div>


        {/* Compliant */}

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Compliant Orders
              </p>

              <h2 className="text-3xl font-bold text-emerald-600 mt-3">
                {formatNumber(compliantOrders)}
              </h2>

            </div>

            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
              âœ“
            </div>

          </div>

          <p className="text-xs text-slate-400 mt-5">
            Orders meeting compliance requirements
          </p>

        </div>


        {/* Non-Compliant */}

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Non-Compliant Orders
              </p>

              <h2 className="text-3xl font-bold text-red-600 mt-3">
                {formatNumber(nonCompliantOrders)}
              </h2>

            </div>

            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold">
              !
            </div>

          </div>

          <p className="text-xs text-slate-400 mt-5">
            Orders requiring compliance review
          </p>

        </div>

      </div>


      {/* =================================================
          PO COMPLIANCE CHECKER
      ================================================= */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="p-6 border-b border-slate-100">

          <div className="flex items-start gap-4">

            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              ðŸ”Ž
            </div>

            <div>

              <h3 className="text-lg font-bold text-slate-900">
                Purchase Order Compliance Checker
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Enter a PO number to perform a detailed compliance analysis.
              </p>

            </div>

          </div>


          <div className="flex flex-col sm:flex-row gap-3 mt-6">

            <input
              value={po}
              onChange={(e) => {
                setPo(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  checkCompliance();
                }
              }}
              placeholder="Example: PO-00056"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />

            <button
              onClick={checkCompliance}
              disabled={loading}
              className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Checking..." : "Check Compliance"}
            </button>

          </div>

          {error && (

            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>

          )}

        </div>


        {/* =================================================
            RESULT
        ================================================= */}

        {result && (

          <div className="p-6">

            {/* STATUS HEADER */}

            <div
              className={`rounded-2xl p-5 border ${
                result?.is_compliant
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              }`}
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold ${
                      result?.is_compliant
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {result?.is_compliant ? "âœ“" : "!"}
                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                      Compliance Result
                    </p>

                    <h2
                      className={`text-2xl font-bold mt-1 ${
                        result?.is_compliant
                          ? "text-emerald-700"
                          : "text-red-700"
                      }`}
                    >
                      {result?.compliance_status ||
                        (result?.is_compliant
                          ? "Compliant"
                          : "Non-Compliant")}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      {result?.po_id || po}
                    </p>

                  </div>

                </div>

                <div className="text-left md:text-right">

                  <p className="text-xs text-slate-400">
                    Supplier
                  </p>

                  <p className="font-bold text-slate-800 mt-1">
                    {result?.supplier || "Unknown"}
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                METRICS
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">

              <div className="bg-slate-50 rounded-xl p-4">

                <p className="text-xs text-slate-400">
                  Procurement Value
                </p>

                <p className="text-lg font-bold text-slate-900 mt-2">
                  {formatCurrency(
                    result?.procurement_value
                  )}
                </p>

              </div>


              <div className="bg-emerald-50 rounded-xl p-4">

                <p className="text-xs text-slate-400">
                  Savings
                </p>

                <p className="text-lg font-bold text-emerald-600 mt-2">
                  {formatCurrency(
                    result?.savings
                  )}
                </p>

              </div>


              <div className="bg-slate-50 rounded-xl p-4">

                <p className="text-xs text-slate-400">
                  Quantity
                </p>

                <p className="text-lg font-bold text-slate-900 mt-2">
                  {formatNumber(
                    result?.quantity
                  )}
                </p>

              </div>


              <div
                className={`rounded-xl p-4 ${
                  Number(result?.defect_rate || 0) > 10
                    ? "bg-red-50"
                    : "bg-emerald-50"
                }`}
              >

                <p className="text-xs text-slate-400">
                  Defect Rate
                </p>

                <p
                  className={`text-lg font-bold mt-2 ${
                    Number(result?.defect_rate || 0) > 10
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {formatPercent(
                    result?.defect_rate
                  )}
                </p>

              </div>

            </div>


            {/* =================================================
                PO DETAILS
            ================================================= */}

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">

              <div className="border border-slate-200 rounded-2xl p-5">

                <h4 className="font-bold text-slate-900 mb-4">
                  Purchase Order Details
                </h4>

                <div className="space-y-3">

                  <div className="flex justify-between gap-4 text-sm">

                    <span className="text-slate-500">
                      PO ID
                    </span>

                    <span className="font-semibold text-slate-800">
                      {result?.po_id || "N/A"}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4 text-sm">

                    <span className="text-slate-500">
                      Supplier
                    </span>

                    <span className="font-semibold text-slate-800">
                      {result?.supplier || "N/A"}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4 text-sm">

                    <span className="text-slate-500">
                      Unit Price
                    </span>

                    <span className="font-semibold text-slate-800">
                      {formatCurrency(
                        result?.unit_price
                      )}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4 text-sm">

                    <span className="text-slate-500">
                      Negotiated Price
                    </span>

                    <span className="font-semibold text-slate-800">
                      {formatCurrency(
                        result?.negotiated_price
                      )}
                    </span>

                  </div>

                </div>

              </div>


              {/* =================================================
                  QUALITY DETAILS
              ================================================= */}

              <div className="border border-slate-200 rounded-2xl p-5">

                <h4 className="font-bold text-slate-900 mb-4">
                  Quality & Compliance Details
                </h4>

                <div className="space-y-3">

                  <div className="flex justify-between gap-4 text-sm">

                    <span className="text-slate-500">
                      Defective Units
                    </span>

                    <span className="font-semibold text-red-600">
                      {formatNumber(
                        result?.defective_units
                      )}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4 text-sm">

                    <span className="text-slate-500">
                      Defect Rate
                    </span>

                    <span className="font-semibold text-slate-800">
                      {formatPercent(
                        result?.defect_rate
                      )}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4 text-sm">

                    <span className="text-slate-500">
                      Dataset Compliance
                    </span>

                    <span className="font-semibold text-slate-800">
                      {result?.dataset_compliance || "N/A"}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4 text-sm">

                    <span className="text-slate-500">
                      Final Status
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        result?.is_compliant
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {result?.compliance_status ||
                        (result?.is_compliant
                          ? "Compliant"
                          : "Non-Compliant")}
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                VIOLATIONS
            ================================================= */}

            <div className="mt-5">

              {Array.isArray(result?.violations) &&
              result.violations.length > 0 ? (

                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">

                  <div className="flex items-center gap-3">

                    <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                      !
                    </div>

                    <div>

                      <h4 className="font-bold text-red-800">
                        Compliance Violations
                      </h4>

                      <p className="text-xs text-red-600 mt-1">
                        {result.violations.length} issue(s) detected
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 space-y-2">

                    {result.violations.map(
                      (violation, index) => (

                        <div
                          key={index}
                          className="flex items-start gap-3 bg-white border border-red-100 rounded-xl p-3"
                        >

                          <span className="text-red-500 font-bold">
                            â€¢
                          </span>

                          <span className="text-sm text-slate-700">
                            {violation}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                </div>

              ) : (

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">

                  <div className="flex items-center gap-3">

                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      âœ“
                    </div>

                    <div>

                      <h4 className="font-bold text-emerald-800">
                        No Compliance Violations
                      </h4>

                      <p className="text-sm text-emerald-700 mt-1">
                        This purchase order satisfies the configured compliance checks.
                      </p>

                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>

        )}

      </div>


      {/* =================================================
          DATA SOURCE
      ================================================= */}

      <div className="flex justify-between items-center text-xs text-slate-400">

        <span>
          Live data source: /api/dashboard/compliance
        </span>

        <span>
          Orders analyzed: {formatNumber(totalOrders)}
        </span>

      </div>

    </div>
  );
}

/* =====================================================
   RFQ GENERATOR
===================================================== */

function RFQGenerator({ selectedSupplier, rfqRequest, setRfqHistoryRefresh }) {
  const [form, setForm] = useState({
    supplier: selectedSupplier || "",
    item: "",
    quantity: 1,
    required_date: "",
    additional_requirements: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
  if (!rfqRequest && !selectedSupplier) {
    return;
  }

  setForm((prev) => ({
    ...prev,
    supplier: selectedSupplier || prev.supplier || "",
    item: rfqRequest?.item || prev.item || "",
    quantity: rfqRequest?.quantity || prev.quantity || 1,
    required_date:
      rfqRequest?.required_date ||
      prev.required_date ||
      "",
    additional_requirements:
      rfqRequest?.notes ||
      prev.additional_requirements ||
      "",
  }));

  setResult(null);
  setError("");
  setCopied(false);
}, [rfqRequest, selectedSupplier]);

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generate = async () => {
    setError("");
    setCopied(false);

    if (!form.supplier.trim()) {
      setError("Please enter the supplier name.");
      return;
    }

    if (!form.item.trim()) {
      setError("Please enter the item or material name.");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch(
        `${API_BASE_URL}/api/rfq/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supplier: form.supplier.trim(),
            item: form.item.trim(),
            quantity: Number(form.quantity),
            required_date: form.required_date,
            additional_requirements:
              form.additional_requirements.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            "RFQ generation failed."
        );
      }

      setResult(data);
    } catch (error) {
      setError(
        error.message ||
          "Unable to generate the RFQ. Please check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    if (!result) return;

    const subject = result.subject || "Request for Quotation";
    const body = result.body || "";

    const text = `Subject: ${subject}\n\n${body}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (error) {
      setError("Unable to copy the RFQ email.");
    }
  };

  const clearForm = () => {
    setForm({
      supplier: "",
      item: "",
      quantity: 1,
      required_date: "",
      additional_requirements: "",
    });

    setResult(null);
    setError("");
    setCopied(false);
  };

  return (
    <div className="space-y-6">

      <PageTitle
        title="RFQ Generator"
        subtitle="Create professional Request for Quotation emails using procurement details."
      />

      {/* Header Information */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-700 font-bold text-lg">
                  RFQ
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Request for Quotation
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Generate supplier-ready procurement emails.
                </p>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
              Procurement Assistant
            </p>

            <p className="text-sm font-semibold text-slate-700 mt-1">
              AI-Powered RFQ Drafting
            </p>
          </div>

        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 font-bold text-sm">
                !
              </span>
            </div>

            <div>
              <p className="font-semibold text-red-800">
                RFQ Generation Error
              </p>

              <p className="text-sm text-red-700 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* RFQ Form */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">

          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              RFQ Details
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Enter the procurement requirements below.
            </p>
          </div>

          <div className="p-6 space-y-5">

            {/* Supplier */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Supplier
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="text"
                value={form.supplier}
                onChange={(e) =>
                  update("supplier", e.target.value)
                }
                placeholder="Example: Alpha_Inc"
                className="w-full mt-2 px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Item */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Item / Material
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="text"
                value={form.item}
                onChange={(e) =>
                  update("item", e.target.value)
                }
                placeholder="Example: Industrial Equipment"
                className="w-full mt-2 px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Quantity + Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Quantity
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) =>
                    update("quantity", e.target.value)
                  }
                  className="w-full mt-2 px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Required Delivery Date
                </label>

                <input
                  type="date"
                  value={form.required_date}
                  onChange={(e) =>
                    update("required_date", e.target.value)
                  }
                  className="w-full mt-2 px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

            </div>

            {/* Additional Requirements */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Additional Requirements
              </label>

              <textarea
                value={form.additional_requirements}
                onChange={(e) =>
                  update(
                    "additional_requirements",
                    e.target.value
                  )
                }
                rows="5"
                placeholder="Example: Warranty, delivery terms, payment terms, quality requirements..."
                className="w-full mt-2 px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />

              <p className="text-xs text-slate-400 mt-2">
                Include any specific procurement or delivery requirements.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">

              <button
                onClick={generate}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Generating RFQ...
                  </span>
                ) : (
                  "Generate RFQ Email"
                )}
              </button>

              <button
                onClick={clearForm}
                disabled={loading}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition disabled:opacity-50"
              >
                Clear
              </button>

            </div>

          </div>
        </div>

        {/* Generated Email */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">

          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Generated RFQ
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Review the generated email before sending.
                </p>
              </div>

              {result && (
                <div className="flex items-center gap-2">

                  <button
                    onClick={generate}
                    disabled={loading}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50"
                  >
                    Regenerate
                  </button>

                  <button
                    onClick={copyText}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition"
                  >
                    {copied ? "Copied" : "Copy Email"}
                  </button>

                </div>
              )}

            </div>
          </div>

          {!result ? (

            <div className="p-8">

              <div className="min-h-[420px] bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-center">

                <div className="max-w-sm px-6">

                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-700 font-bold">
                      RFQ
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-800 mt-5">
                    No RFQ Generated Yet
                  </h4>

                  <p className="text-sm text-slate-500 mt-2 leading-6">
                    Enter supplier and procurement details on the left,
                    then generate an RFQ email.
                  </p>

                </div>

              </div>

            </div>

          ) : (

            <div className="p-6 space-y-5">

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wide font-bold text-indigo-600">
                    Email Subject
                  </label>

                  <span className="text-xs text-slate-400">
                    RFQ
                  </span>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <p className="font-bold text-slate-900 leading-6">
                    {result.subject || "Request for Quotation"}
                  </p>
                </div>
              </div>

              {/* Email Body */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wide font-bold text-slate-600">
                    Email Body
                  </label>

                  <span className="text-xs text-slate-400">
                    Supplier Communication
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-h-[500px] overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm text-slate-700 leading-7">
                    {result.body || "No email body was generated."}
                  </div>
                </div>
              </div>

              {/* RFQ Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">
                    Supplier
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                    {form.supplier}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">
                    Item
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                    {form.item}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">
                    Quantity
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {form.quantity}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">
                    Required Date
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {form.required_date 
                      ? form.required_date.split("-").reverse().join("-")
                      : "Not specified"}
                  </p>
                </div>

              </div>

            </div>

          )}

        </div>

      </div>

      {/* RFQ Workflow */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

        <h3 className="text-lg font-bold text-slate-900">
          RFQ Workflow
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

          <div className="border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-bold text-slate-800">
              1. Enter Requirements
            </p>

            <p className="text-xs text-slate-500 mt-2 leading-5">
              Provide supplier, item, quantity and delivery requirements.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-bold text-slate-800">
              2. Generate RFQ
            </p>

            <p className="text-xs text-slate-500 mt-2 leading-5">
              The procurement assistant creates a structured supplier email.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-bold text-slate-800">
              3. Review and Send
            </p>

            <p className="text-xs text-slate-500 mt-2 leading-5">
              Review the generated message and copy it for supplier communication.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   COMPLIANCE SUMMARY
===================================================== */

function ComplianceSummary({
  compliantOrders,
  nonCompliantOrders,
  complianceRate,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

      <div className="flex items-center justify-between">

        <div>
          <h3 className="text-lg font-bold">
            Compliance Summary
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Overall purchase order compliance
          </p>
        </div>

        <span className="text-2xl font-bold text-emerald-600">
          {Number(complianceRate || 0).toFixed(2)}%
        </span>

      </div>

      <div className="mt-6">

        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">

          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{
              width: `${Math.min(
                Number(complianceRate || 0),
                100
              )}%`,
            }}
          ></div>

        </div>

      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">

        <div className="bg-emerald-50 rounded-xl p-4">

          <p className="text-xs text-emerald-600 font-semibold uppercase">
            Compliant
          </p>

          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {Number(
              compliantOrders || 0
            ).toLocaleString("en-IN")}
          </p>

        </div>

        <div className="bg-red-50 rounded-xl p-4">

          <p className="text-xs text-red-600 font-semibold uppercase">
            Non-Compliant
          </p>

          <p className="text-2xl font-bold text-red-700 mt-1">
            {Number(
              nonCompliantOrders || 0
            ).toLocaleString("en-IN")}
          </p>

        </div>

      </div>

    </div>
  );
}

/* =====================================================
   SUPPLIER QUALITY OVERVIEW
===================================================== */

function SupplierQualityOverview({
  suppliers = [],
}) {
  const normalized = suppliers
    .map((supplier) => ({
      name:
        supplier.supplier ??
        supplier.name ??
        "Unknown",

      rate: Number(
        supplier.defect_rate ??
        supplier.average_defect_rate ??
        supplier.avg_defect_rate ??
        0
      ),

      orders: Number(
        supplier.total_orders ??
        supplier.orders ??
        0
      ),
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

      <h3 className="text-lg font-bold">
        Supplier Quality Overview
      </h3>

      <p className="text-sm text-slate-500 mt-1">
        Defect rate by supplier
      </p>

      <div className="mt-6 space-y-5">

        {normalized.map((supplier) => (

          <div key={supplier.name}>

            <div className="flex items-center justify-between mb-2">

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {supplier.name}
                </p>

                <p className="text-xs text-slate-400">
                  {supplier.orders} orders
                </p>
              </div>

              <span className="text-sm font-bold text-slate-700">
                {supplier.rate.toFixed(2)}%
              </span>

            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">

              <div
                className={`h-full rounded-full ${
                  supplier.rate >= 8
                    ? "bg-red-500"
                    : supplier.rate >= 4
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{
                  width: `${Math.min(
                    supplier.rate * 7,
                    100
                  )}%`,
                }}
              ></div>

            </div>

          </div>

        ))}

        {normalized.length === 0 && (
          <p className="text-sm text-slate-400">
            No supplier data available.
          </p>
        )}

      </div>

    </div>
  );
}

/* =====================================================
   METRIC CARD
===================================================== */

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  loading = false,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {title}
          </p>

          {loading ? (
            <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg mt-2"></div>
          ) : (
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {value}
            </p>
          )}

          <p className="text-xs text-slate-400 mt-2">
            {subtitle}
          </p>

        </div>

        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =====================================================
   SMALL STAT CARD
===================================================== */

function SmallStatCard({
  title,
  value,
  subtitle,
  type = "info",
}) {
  const styles = {
    info: {
      box: "bg-indigo-50",
      text: "text-indigo-700",
    },

    success: {
      box: "bg-emerald-50",
      text: "text-emerald-700",
    },

    warning: {
      box: "bg-amber-50",
      text: "text-amber-700",
    },

    danger: {
      box: "bg-red-50",
      text: "text-red-700",
    },
  };

  const style =
    styles[type] || styles.info;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

      <p className="text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p
        className={`text-3xl font-bold mt-2 ${style.text}`}
      >
        {value}
      </p>

      <div
        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold mt-3 ${style.box} ${style.text}`}
      >
        {subtitle}
      </div>

    </div>
  );
}

/* =====================================================
   STATUS ITEM
===================================================== */

function StatusItem({ name, status }) {
  const isOnline =
    status === "Online" ||
    status === "Active" ||
    status === "Configured";

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">

      <div className="flex items-center gap-3">

        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isOnline
              ? "bg-emerald-500"
              : status === "Checking..."
              ? "bg-amber-400"
              : "bg-red-500"
          }`}
        ></span>

        <span className="text-sm font-medium text-slate-700">
          {name}
        </span>

      </div>

      <span className="text-xs font-semibold text-slate-500">
        {status}
      </span>

    </div>
  );
}

/* =====================================================
   SUPPLIER CARD
===================================================== */

function SupplierCard({ supplier }) {
  const isDanger =
    supplier.defectRate >= 8;

  const isGood =
    supplier.defectRate <= 3;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

      <div className="flex items-start justify-between gap-4">

        <div>

          <h3 className="text-lg font-bold text-slate-900">
            {supplier.name}
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            {supplier.orders} purchase orders
          </p>

        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isDanger
              ? "bg-red-100 text-red-700"
              : isGood
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {supplier.status}
        </span>

      </div>

      <div className="mt-6">

        <div className="flex items-center justify-between mb-2">

          <span className="text-sm text-slate-500">
            Defect Rate
          </span>

          <span className="text-sm font-bold text-slate-900">
            {supplier.defectRate.toFixed(2)}%
          </span>

        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">

          <div
            className={`h-full rounded-full ${
              isDanger
                ? "bg-red-500"
                : isGood
                ? "bg-emerald-500"
                : "bg-amber-500"
            }`}
            style={{
              width: `${Math.min(
                supplier.defectRate * 7,
                100
              )}%`,
            }}
          ></div>

        </div>

      </div>

    </div>
  );
}

/* =====================================================
   EXAMPLE QUESTION
===================================================== */

function ExampleQuestion({ text }) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition">

      <p className="text-sm text-slate-600">
        "{text}"
      </p>

    </div>
  );
}

/* =====================================================
   PAGE TITLE
===================================================== */

function PageTitle({ title, subtitle }) {
  return (
    <div>

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
        {title}
      </h1>

      <p className="text-sm text-slate-500 mt-1">
        {subtitle}
      </p>

    </div>
  );
}

/* =====================================================
   ANALYSIS CARD
===================================================== */

function AnalysisCard({
  title,
  value,
  subtitle,
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

      <p className="text-xs font-semibold text-slate-500 uppercase">
        {title}
      </p>

      <p className="text-xl font-bold text-slate-900 mt-2 break-words">
        {value}
      </p>

      <p className="text-xs text-slate-500 mt-2">
        {subtitle}
      </p>

    </div>
  );
}

/* =====================================================
   QUALITY BAR
===================================================== */

function QualityBar({
  label,
  value,
  orders,
}) {
  return (
    <div>

      <div className="flex items-center justify-between mb-2">

        <div>

          <p className="text-sm font-semibold text-slate-800">
            {label}
          </p>

          <p className="text-xs text-slate-400">
            {orders}
          </p>

        </div>

        <p className="text-sm font-bold text-slate-700">
          {value.toFixed(2)}%
        </p>

      </div>

      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

        <div
          className="h-full bg-indigo-500 rounded-full"
          style={{
            width: `${Math.min(
              value * 7,
              100
            )}%`,
          }}
        ></div>

      </div>

    </div>
  );
}

/* =====================================================
   PERFORMANCE ROW
===================================================== */

function PerformanceRow({
  name,
  value,
}) {
  return (
    <div className="flex items-center gap-4">

      <div className="w-36 shrink-0">

        <p className="text-sm font-semibold text-slate-700 truncate">
          {name}
        </p>

      </div>

      <div className="flex-1">

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

          <div
            className={`h-full rounded-full ${
              value >= 8
                ? "bg-red-500"
                : value >= 4
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{
              width: `${Math.min(
                value * 7,
                100
              )}%`,
            }}
          ></div>

        </div>

      </div>

      <div className="w-16 text-right">

        <span className="text-sm font-bold text-slate-700">
          {value.toFixed(2)}%
        </span>

      </div>

    </div>
  );
}

/* =====================================================
   ANALYTICS ROW
===================================================== */

function AnalyticsRow({
  label,
  value,
  percentage,
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">

      <div>

        <p className="text-sm font-semibold text-slate-700">
          {label}
        </p>

        <p className="text-xs text-slate-400 mt-1">
          {percentage}
        </p>

      </div>

      <p className="text-xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   INSIGHT CARD
===================================================== */

function InsightCard({
  icon,
  title,
  text,
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">

      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
        {icon}
      </div>

      <h4 className="font-bold text-slate-900 mt-4">
        {title}
      </h4>

      <p className="text-sm text-slate-500 leading-6 mt-2">
        {text}
      </p>

    </div>
  );
}

/* =====================================================
   EXPORT
===================================================== */

export default App;

function RFQHistory({ refresh }) {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/rfq/history`
      );

      const data = await response.json();

      if (data.success) {
        setRfqs(data.rfqs || []);
      } else {
        setRfqs([]);
      }
    } catch (error) {
      console.error("RFQ history error:", error);
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [refresh]);
  
    const deleteRfq = async (rfqId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this RFQ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/rfq/history/${rfqId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!data.success) {
        alert(data.error || "Unable to delete RFQ.");
        return;
      }

      setRfqs((currentRfqs) =>
        currentRfqs.filter((rfq) => rfq.id !== rfqId)
      );

      if (selectedRfq && selectedRfq.id === rfqId) {
        setSelectedRfq(null);
      }

    } catch (error) {
      console.error("Delete RFQ failed:", error);
      alert("Unable to delete RFQ.");
    }
  };
  const copyRfq = async (rfq) => {
    try {
      await navigator.clipboard.writeText(
        `Subject: ${rfq.subject}\n\n${rfq.body}`
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          RFQ History
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          View and manage previously generated quotation requests.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">
            Total RFQs
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            {rfqs.length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">
            Suppliers
          </p>

          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {
              new Set(
                rfqs.map((rfq) => rfq.supplier)
              ).size
            }
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">
            Categories
          </p>

          <p className="text-3xl font-bold text-green-600 mt-2">
            {
              new Set(
                rfqs.map((rfq) => rfq.category)
              ).size
            }
          </p>
        </div>

      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500">
            Loading RFQ history...
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && rfqs.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">

          <h3 className="text-lg font-semibold text-gray-900">
            No RFQs generated yet
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            Generate an RFQ from the RFQ Generator to see it here.
          </p>

        </div>
      )}

      {/* Table */}
      {!loading && rfqs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b border-gray-200">

                <tr>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Supplier
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Item
                  </th>

                  <th className="px-5 py-4 text-right font-semibold text-gray-600">
                    Quantity
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Required Date
                  </th>

                  <th className="px-5 py-4 text-center font-semibold text-gray-600">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {rfqs.map((rfq, index) => (

                  <tr
                    key={index}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">
                        {rfq.supplier}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {rfq.item}
                    </td>

                    <td className="px-5 py-4 text-right text-gray-700">
                      {Number(rfq.quantity).toLocaleString()}
                    </td>

                    <td className="px-5 py-4">

                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                        {rfq.category}
                      </span>

                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {rfq.required_date || "Not specified"}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-center gap-2">

  <button
    onClick={() => {
      setSelectedRfq(rfq);
      setCopied(false);
    }}
    className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
  >
    View
  </button>

  <button
    onClick={() => copyRfq(rfq)}
    className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
  >
    Copy
  </button>

  <button
    onClick={() => deleteRfq(rfq.id)}
    className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200"
  >
    Delete
  </button>

</div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* View Modal */}
      {selectedRfq && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  RFQ Details
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedRfq.supplier} - {selectedRfq.item}
                </p>
              </div>

              <button
                onClick={() => setSelectedRfq(null)}
                className="text-gray-500 hover:text-gray-900 text-xl"
              >
                X
              </button>

            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">
                    Supplier
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedRfq.supplier}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">
                    Item
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedRfq.item}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">
                    Quantity
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {Number(selectedRfq.quantity).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">
                    Category
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedRfq.category}
                  </p>
                </div>

              </div>

              <div className="mb-5">

                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </p>

                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800">
                  {selectedRfq.subject}
                </div>

              </div>

              <div>

                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Email Body
                </p>

                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-6">
                  {selectedRfq.body}
                </div>

              </div>

            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t">

              <button
                onClick={() => copyRfq(selectedRfq)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
              >
                {copied ? "Copied" : "Copy Email"}
              </button>

              <button
                onClick={() => setSelectedRfq(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

