import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";

function AdminPage({ currentUser, onOpenRFQ }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const [sourcingLoading, setSourcingLoading] = useState(false);
  const [sourcingData, setSourcingData] = useState(null);

  const [selectedSupplier, setSelectedSupplier] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/procurement-requests`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to load procurement requests."
        );
      }

      setRequests(data.requests || []);
    } catch (error) {
      console.error("Load requests error:", error);

      alert(
        error.message ||
          "Unable to load procurement requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/procurement-requests/${requestId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to update request status."
        );
      }

      setRequests((previousRequests) =>
        previousRequests.map((request) =>
          request.id === requestId
            ? data.data
            : request
        )
      );

      if (
        selectedRequest &&
        selectedRequest.id === requestId
      ) {
        setSelectedRequest(data.data);
      }

      setSourcingData(null);
      setSelectedSupplier("");

      alert(
        `Request #${requestId} marked as ${status}.`
      );
    } catch (error) {
      console.error(
        "Update request status error:",
        error
      );

      alert(
        error.message ||
          "Unable to update request status."
      );
    }
  };

  const openRequest = (request) => {
    setSelectedRequest(request);
    setRequestModalOpen(true);

    setSourcingData(null);
    setSelectedSupplier("");
  };

  const closeRequestModal = () => {
    setRequestModalOpen(false);
    setSelectedRequest(null);
    setSourcingData(null);
    setSelectedSupplier("");
  };

  const startSupplierSourcing = async () => {
    if (!selectedRequest) return;

    if (selectedRequest.status !== "Approved") {
      alert(
        "Only approved procurement requests can be sent for supplier sourcing."
      );
      return;
    }

    try {
      setSourcingLoading(true);
      setSourcingData(null);
      setSelectedSupplier("");

      const response = await fetch(
        `${API_BASE_URL}/api/procurement-requests/${selectedRequest.id}/supplier-sourcing`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to find matching suppliers."
        );
      }

      setSourcingData(data);
    } catch (error) {
      console.error(
        "Supplier sourcing error:",
        error
      );

      alert(
        error.message ||
          "Unable to start supplier sourcing."
      );
    } finally {
      setSourcingLoading(false);
    }
  };

  const handleSelectSupplier = (supplier) => {
    if (!selectedRequest) return;

    setSelectedSupplier(supplier.supplier);

    alert(
      `${supplier.supplier} selected for ${selectedRequest.item}.`
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 text-emerald-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "In Review":
        return "bg-amber-100 text-amber-700";

      case "New":
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const totalRequests = requests.length;

  const newRequests = requests.filter(
    (request) => request.status === "New"
  ).length;

  const reviewRequests = requests.filter(
    (request) => request.status === "In Review"
  ).length;

  const approvedRequests = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedRequests = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  return (
    <div className="min-h-screen bg-slate-100">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">

        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  PB
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Procurement Administration
                  </h1>

                  <p className="text-sm text-slate-500">
                    Manage procurement requests, approvals and supplier sourcing.
                  </p>
                </div>

              </div>
            </div>

            <div className="flex items-center gap-3">

              <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200">

                <p className="text-xs text-slate-500">
                  Signed in as
                </p>

                <p className="text-sm font-semibold text-slate-800">
                  {currentUser?.username || "Admin"}
                </p>

              </div>

              <button
                onClick={loadRequests}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
              >
                Refresh
              </button>

            </div>

          </div>

        </div>

      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Total Requests
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {totalRequests}
            </p>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              New
            </p>

            <p className="text-3xl font-bold text-slate-700 mt-2">
              {newRequests}
            </p>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              In Review
            </p>

            <p className="text-3xl font-bold text-amber-600 mt-2">
              {reviewRequests}
            </p>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Approved
            </p>

            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {approvedRequests}
            </p>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Rejected
            </p>

            <p className="text-3xl font-bold text-red-600 mt-2">
              {rejectedRequests}
            </p>

          </div>

        </div>

        {/* REQUEST TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200">

            <h2 className="text-lg font-bold text-slate-900">
              Procurement Requests
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Review requests submitted by the procurement team.
            </p>

          </div>

          {loading ? (

            <div className="p-10 text-center">

              <div className="inline-flex items-center gap-3 text-slate-500">

                <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>

                Loading procurement requests...

              </div>

            </div>

          ) : requests.length === 0 ? (

            <div className="p-10 text-center">

              <p className="text-slate-500">
                No procurement requests found.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50 border-b border-slate-200">

                  <tr>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Request
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Category
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Quantity
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Required Date
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Status
                    </th>

                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {requests.map((request) => (

                    <tr
                      key={request.id}
                      className="hover:bg-slate-50 transition"
                    >

                      <td className="px-6 py-4">

                        <div>

                          <p className="font-semibold text-slate-900">
                            #{request.id} â€” {request.item}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            Created {formatDate(request.created_at)}
                          </p>

                        </div>

                      </td>

                      <td className="px-6 py-4">

                        <span className="text-sm text-slate-700">
                          {request.category || "-"}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <span className="text-sm font-semibold text-slate-800">
                          {request.quantity}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <span className="text-sm text-slate-700">
                          {request.required_date || "-"}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-right">

                        <button
                          onClick={() =>
                            openRequest(request)
                          }
                          className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-sm font-semibold text-slate-700 transition"
                        >
                          View Details
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

      {/* REQUEST DETAIL MODAL */}
      {requestModalOpen && selectedRequest && (

        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">

          <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">

            {/* MODAL HEADER */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between z-10">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Procurement Request #{selectedRequest.id}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Review request details and procurement workflow.
                </p>

              </div>

              <button
                onClick={closeRequestModal}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                âœ•
              </button>

            </div>

            <div className="p-6">

              {/* REQUEST DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="rounded-xl border border-slate-200 p-5">

                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Requested Item
                  </p>

                  <p className="text-lg font-bold text-slate-900 mt-2">
                    {selectedRequest.item}
                  </p>

                </div>

                <div className="rounded-xl border border-slate-200 p-5">

                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Category
                  </p>

                  <p className="text-lg font-bold text-slate-900 mt-2">
                    {selectedRequest.category || "-"}
                  </p>

                </div>

                <div className="rounded-xl border border-slate-200 p-5">

                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Quantity
                  </p>

                  <p className="text-lg font-bold text-slate-900 mt-2">
                    {selectedRequest.quantity}
                  </p>

                </div>

                <div className="rounded-xl border border-slate-200 p-5">

                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Required Date
                  </p>

                  <p className="text-lg font-bold text-slate-900 mt-2">
                    {selectedRequest.required_date || "-"}
                  </p>

                </div>

              </div>

              {/* NOTES */}
              <div className="mt-5 rounded-xl border border-slate-200 p-5">

                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Request Notes
                </p>

                <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                  {selectedRequest.notes || "No additional notes provided."}
                </p>

              </div>

              {/* WORKFLOW */}
              <div className="mt-6">

                <h3 className="text-lg font-bold text-slate-900">
                  Procurement Workflow
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">

                  <div
                    className={`rounded-xl border p-4 ${
                      selectedRequest.status === "New"
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >

                    <p className="text-xs font-semibold text-slate-500">
                      STEP 1
                    </p>

                    <p className="font-semibold text-slate-900 mt-1">
                      Request Created
                    </p>

                  </div>

                  <div
                    className={`rounded-xl border p-4 ${
                      selectedRequest.status === "In Review"
                        ? "border-amber-300 bg-amber-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >

                    <p className="text-xs font-semibold text-slate-500">
                      STEP 2
                    </p>

                    <p className="font-semibold text-slate-900 mt-1">
                      Procurement Review
                    </p>

                  </div>

                  <div
                    className={`rounded-xl border p-4 ${
                      selectedRequest.status === "Approved"
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >

                    <p className="text-xs font-semibold text-slate-500">
                      STEP 3
                    </p>

                    <p className="font-semibold text-slate-900 mt-1">
                      Approval
                    </p>

                  </div>

                  <div
                    className={`rounded-xl border p-4 ${
                      sourcingData
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >

                    <p className="text-xs font-semibold text-slate-500">
                      STEP 4
                    </p>

                    <p className="font-semibold text-slate-900 mt-1">
                      Supplier Sourcing
                    </p>

                  </div>

                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-6 flex flex-wrap gap-3">

                {selectedRequest.status === "New" && (

                  <button
                    onClick={() =>
                      updateRequestStatus(
                        selectedRequest.id,
                        "In Review"
                      )
                    }
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition"
                  >
                    Mark In Review
                  </button>

                )}

                {selectedRequest.status !== "Approved" &&
                  selectedRequest.status !== "Rejected" && (

                    <button
                      onClick={() =>
                        updateRequestStatus(
                          selectedRequest.id,
                          "Approved"
                        )
                      }
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition"
                    >
                      Approve Request
                    </button>

                  )}

                {selectedRequest.status !== "Rejected" && (

                  <button
                    onClick={() =>
                      updateRequestStatus(
                        selectedRequest.id,
                        "Rejected"
                      )
                    }
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition"
                  >
                    Reject Request
                  </button>

                )}

                {selectedRequest.status === "Approved" && (

                  <button
                    onClick={startSupplierSourcing}
                    disabled={sourcingLoading}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-sm transition"
                  >
                    {sourcingLoading
                      ? "Finding Suppliers..."
                      : "Source Suppliers"}
                  </button>

                )}

              </div>

              {/* SELECTED SUPPLIER */}
              {selectedSupplier && (

                <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-5">

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                      <p className="text-xs font-semibold text-indigo-600 uppercase">
                        Selected Supplier
                      </p>

                      <p className="text-xl font-bold text-slate-900 mt-1">
                        {selectedSupplier}
                      </p>

                      <p className="text-sm text-slate-600 mt-1">
                        Supplier selected for{" "}
                        <span className="font-semibold">
                          {selectedRequest.item}
                        </span>
                        .
                      </p>

                    </div>

                    <div className="flex items-center gap-3">

  <div className="px-4 py-2 rounded-lg bg-white border border-indigo-200 text-sm font-semibold text-indigo-700">
    Supplier Selected
  </div>

  <button
    onClick={() => {
      if (!selectedRequest || !selectedSupplier) {
        alert("Please select a supplier first.");
        return;
      }

      const supplierData = (sourcingData?.suppliers || []).find(
        (supplier) =>
          supplier.supplier === selectedSupplier
      );

      if (!supplierData) {
        alert("Selected supplier details not found.");
        return;
      }

      if (typeof onOpenRFQ === "function") {
        onOpenRFQ(
          selectedRequest,
          supplierData.supplier
        );
      } else {
        alert(
          "RFQ Generator connection is not configured yet."
        );
      }
    }}
    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
  >
    Generate RFQ
  </button>

</div>

                  </div>

                </div>

              )}

              {/* SUPPLIER SOURCING RESULTS */}
              {sourcingData && (

                <div className="mt-8">

                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">

                    <div>

                      <h3 className="text-lg font-bold text-slate-900">
                        Matching Suppliers
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        Historical procurement records matched against the approved request.
                      </p>

                    </div>

                    <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200">

                      <span className="text-xs text-slate-500">
                        Supplier Matches
                      </span>

                      <span className="ml-2 font-bold text-slate-900">
                        {sourcingData.supplier_count || 0}
                      </span>

                    </div>

                  </div>

                  {/* MATCH SUMMARY */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="rounded-xl border border-slate-200 bg-white p-4">

                      <p className="text-xs text-slate-500">
                        Requested Item
                      </p>

                      <p className="font-bold text-slate-900 mt-1">
                        {sourcingData.requested_item ||
                          selectedRequest.item}
                      </p>

                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">

                      <p className="text-xs text-slate-500">
                        Matched Category
                      </p>

                      <p className="font-bold text-slate-900 mt-1 capitalize">
                        {sourcingData.matched_category ||
                          "No category match"}
                      </p>

                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">

                      <p className="text-xs text-slate-500">
                        Match Type
                      </p>

                      <p className="font-bold text-slate-900 mt-1 capitalize">
                        {sourcingData.match_type ||
                          "None"}
                      </p>

                    </div>

                  </div>

                  {/* TRANSPARENCY MESSAGE */}
                  {sourcingData.match_type === "category" && (

                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">

                      <p className="text-sm text-blue-800">

                        <span className="font-semibold">
                          Category-level match:
                        </span>{" "}
                        The procurement dataset does not contain a dedicated product-name field for this request.
                        Suppliers below are therefore based on historical records in the matched category,
                        not an exact product-level match.

                      </p>

                    </div>

                  )}

                  {/* SUPPLIER CARDS */}
                  <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {(sourcingData.suppliers || []).map(
                      (supplier) => (

                        <div
                          key={supplier.supplier}
                          className={`rounded-2xl border p-5 transition ${
                            selectedSupplier ===
                            supplier.supplier
                              ? "border-indigo-400 bg-indigo-50 shadow-md"
                              : "border-slate-200 bg-white hover:shadow-md"
                          }`}
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div>

                              <p className="text-xs font-semibold text-slate-500 uppercase">
                                Supplier
                              </p>

                              <h4 className="text-lg font-bold text-slate-900 mt-1">
                                {supplier.supplier}
                              </h4>

                            </div>

                            <div className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                              {supplier.order_count} historical orders
                            </div>

                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">

                            <div className="rounded-lg bg-slate-50 p-3">

                              <p className="text-xs text-slate-500">
                                Historical Qty
                              </p>

                              <p className="font-bold text-slate-800 mt-1">
                                {supplier.total_quantity?.toLocaleString()}
                              </p>

                            </div>

                            <div className="rounded-lg bg-slate-50 p-3">

                              <p className="text-xs text-slate-500">
                                Avg Unit Price
                              </p>

                              <p className="font-bold text-slate-800 mt-1">
                                â‚¹
                                {supplier.average_unit_price?.toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </p>

                            </div>

                            <div className="rounded-lg bg-slate-50 p-3">

                              <p className="text-xs text-slate-500">
                                Avg Negotiated
                              </p>

                              <p className="font-bold text-slate-800 mt-1">
                                â‚¹
                                {supplier.average_negotiated_price?.toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </p>

                            </div>

                            <div className="rounded-lg bg-slate-50 p-3">

                              <p className="text-xs text-slate-500">
                                Defect Rate
                              </p>

                              <p className="font-bold text-slate-800 mt-1">
                                {supplier.defect_rate}%
                              </p>

                            </div>

                            <div className="rounded-lg bg-slate-50 p-3">

                              <p className="text-xs text-slate-500">
                                Defective Units
                              </p>

                              <p className="font-bold text-slate-800 mt-1">
                                {supplier.defective_units?.toLocaleString()}
                              </p>

                            </div>

                            <div className="rounded-lg bg-slate-50 p-3">

                              <p className="text-xs text-slate-500">
                                Supplier Status
                              </p>

                              <p className="font-bold text-emerald-600 mt-1">
                                Historical Match
                              </p>

                            </div>

                          </div>

                          <div className="mt-5 flex justify-end">

                            <button
                              onClick={() =>
                                handleSelectSupplier(
                                  supplier
                                )
                              }
                              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                                selectedSupplier ===
                                supplier.supplier
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
                              }`}
                            >
                              {selectedSupplier ===
                              supplier.supplier
                                ? "Supplier Selected"
                                : "Select Supplier"}
                            </button>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                  {/* NO SUPPLIERS */}
                  {(!sourcingData.suppliers ||
                    sourcingData.suppliers.length === 0) && (

                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5">

                      <p className="font-semibold text-amber-900">
                        No matching supplier records found.
                      </p>

                      <p className="text-sm text-amber-800 mt-1">
                        No verified historical procurement records are available for this request.
                        Supplier details have not been invented.
                      </p>

                    </div>

                  )}

                </div>

              )}

              {/* FOOTER */}
              <div className="mt-8 pt-5 border-t border-slate-200 flex justify-end">

                <button
                  onClick={closeRequestModal}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminPage;


