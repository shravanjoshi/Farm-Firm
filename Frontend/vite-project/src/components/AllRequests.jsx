// src/pages/AllRequests.jsx

import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./Input";
import { Button } from "./Button";
import { Card, CardContent } from "./Card"; // assuming CardContent exists; if not, use div with p-5
import { Badge } from "./Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import {
  Search,
  ArrowUpDown,
  Clock,
  Package,
  Building,
  MapPin,
  AlertCircle,
  Plus,
  Phone,
} from "lucide-react";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

const AllRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const { isLoggedIn, user } = useContext(AuthContext);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    cropName: "",
    requirement: "",
    deadline: "",
  });
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedRequestForQuotation, setSelectedRequestForQuotation] = useState(null);
  const [quotationRate, setQuotationRate] = useState("");
  const [submittingQuotation, setSubmittingQuotation] = useState(false);

  // ────────────────────────────────────────────────
  // Fetch logic (unchanged except minor error handling polish)
  // ────────────────────────────────────────────────
  useEffect(() => {
    const fetchAllRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BACKEND_URL}/api/allrequests`, {
          method: "GET",
          credentials: "include", // ← added for consistency with auth flows
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (data.success) {
          console.log("Fetched requests:", data.requests);
          const normalized = data.requests.map((req) => ({
            id: req._id,
            firmOwnerId: req.firmId?._id || null,
            cropName: req.cropname || "Unknown Crop",
            firmName: req.firmId?.CompanyName || "Unknown Firm",
            city: req.firmId?.city || "—",
            state: req.firmId?.state || "—",
            firmPhone: req.firmId?.phoneNumber || null,
            requirement: req.requirement || "Not specified",
            deadline: req.deadline
              ? new Date(req.deadline).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
              : "—",
            requestedAt: new Date(req.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            status: req.status || "Pending",
          }));

          setRequests(normalized);
        } else {
          setError(data.error || "Failed to load requests");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to load crop requests at this time.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllRequests();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cropName || !formData.requirement || !formData.deadline) {
      toast.error("Please complete all required fields.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/add-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Request submitted successfully.");
        setFormData({ cropName: "", requirement: "", deadline: "" });
        setRequests((prev) => [
          {
            id: data.request?._id || Date.now().toString(),
            firmOwnerId: data.request?.firmId?._id || user?._id || null,
            cropName: data.request?.cropname || formData.cropName,
            firmName: data.request?.firmId?.CompanyName || "Your Firm",
            city: data.request?.firmId?.city || "—",
            state: data.request?.firmId?.state || "—",
            firmPhone: data.request?.firmId?.phoneNumber || null,
            requirement: data.request?.requirement || formData.requirement,
            deadline: new Date(data.request?.deadline || formData.deadline).toLocaleDateString("en-IN"),
            requestedAt: new Date().toLocaleDateString("en-IN"),
            status: data.request?.status || "Pending",
          },
          ...prev,
        ]);
        setShowAddForm(false);
      } else {
        toast.error(data.error || "Submission failed.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    if (!window.confirm("Confirm acceptance of this request?")) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/requests/accept/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Request accepted.");
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: "Accepted" } : req
          )
        );
      } else {
        toast.error(data.error || "Failed to accept request.");
      }
    } catch {
      toast.error("Network error during acceptance.");
    }
  };

  const handleCallFirm = (phone) => {
    if (!phone) {
      toast.warning("Phone number unavailable.");
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const handleViewQuotations = (requestId) => {
    navigate(`/quotations/${requestId}`);
  };

  const handleOpenQuotationModal = (req) => {
    setSelectedRequestForQuotation(req);
    setQuotationRate("");
    setShowQuotationModal(true);
  };

  const handleCloseQuotationModal = () => {
    setShowQuotationModal(false);
    setSelectedRequestForQuotation(null);
    setQuotationRate("");
  };

  const handleQuotationSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRequestForQuotation?.id) {
      toast.error("Request not found.");
      return;
    }

    if (!user?._id || user?.userType !== "farmer") {
      toast.error("Please log in as a farmer to add quotation.");
      return;
    }

    const numericRate = Number(quotationRate);
    if (!numericRate || numericRate <= 0) {
      toast.error("Please enter a valid rate.");
      return;
    }

    try {
      setSubmittingQuotation(true);
      const response = await fetch(`${BACKEND_URL}/api/quotation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          rate: numericRate,
          farmerId: user._id,
          firmRequestId: selectedRequestForQuotation.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data?.success) {
        toast.success("Quotation submitted successfully.");
        handleCloseQuotationModal();
      } else {
        toast.error(data?.message || "Failed to submit quotation.");
      }
    } catch (err) {
      console.error("Quotation submit error:", err);
      toast.error("Network error while submitting quotation.");
    } finally {
      setSubmittingQuotation(false);
    }
  };

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 text-xs font-medium rounded-full";
    switch (status?.toLowerCase()) {
      case "pending":
        return <Badge className={`${base} bg-amber-50 text-amber-700 border-amber-200`}>Pending</Badge>;
      case "accepted":
        return <Badge className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>Accepted</Badge>;
      case "rejected":
        return <Badge className={`${base} bg-red-50 text-red-700 border-red-200`}>Rejected</Badge>;
      default:
        return <Badge className={`${base} bg-gray-50 text-gray-600 border-gray-200`}>Unknown</Badge>;
    }
  };

  const filteredRequests = requests
    .filter((req) => {
      const q = searchQuery.toLowerCase();
      return (
        req.cropName.toLowerCase().includes(q) ||
        req.firmName.toLowerCase().includes(q) ||
        req.city.toLowerCase().includes(q) ||
        req.state.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.requestedAt) - new Date(a.requestedAt);
        case "oldest":
          return new Date(a.requestedAt) - new Date(b.requestedAt);
        case "crop-name":
          return a.cropName.localeCompare(b.cropName);
        default:
          return 0;
      }
    });

  // Split requests into Accepted and Pending
  const acceptedRequests = filteredRequests.filter(req => req.status?.toLowerCase() === "accepted");
  const pendingRequests = filteredRequests.filter(req => req.status?.toLowerCase() === "pending");

  const showAcceptButton = isLoggedIn && user?.userType === "farmer";
  const showCallButton = isLoggedIn;
  const canViewQuotations = (req) => {
    if (!isLoggedIn || user?.userType !== "firm") return false;
    if (!req?.firmOwnerId) return true;
    return String(req.firmOwnerId) === String(user?._id);
  };

  return (
    <div className="min-h-screen bg-gray-50/60">
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-12">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                All <span className="text-emerald-600">Crop Requests</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl">
                Browse and respond to purchase inquiries from buyers nationwide.
              </p>
            </div>

            {isLoggedIn && user?.userType === "firm" && (
              <Button
                onClick={() => setShowAddForm(true)}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="mr-2 h-5 w-5" />
                Post New Request
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-gray-100 rounded-2xl   p-6 mb-10 sticky top-4 z-10">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by crop, firm, city or state..."
                  className="h-12 pl-12 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 w-full md:w-52 rounded-xl border-gray-200">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="crop-name">Crop Name (A–Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-24">
              <div className="text-center space-y-5">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-emerald-600 border-r-4 border-emerald-200 mx-auto"></div>
                <p className="text-lg font-medium text-gray-700">Loading requests...</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="flex justify-center items-center py-24">
              <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border p-10 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Error Loading Requests</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => window.location.reload()} className="bg-emerald-600 hover:bg-emerald-700 px-8">
                  Retry
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              <p className="text-gray-600 font-medium mb-8">
                Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""}
                ({acceptedRequests.length} accepted, {pendingRequests.length} pending)
              </p>

              {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                  <p className="text-xl font-medium text-gray-700 mb-3">
                    {requests.length === 0 ? "No crop requests available yet." : "No matching requests found."}
                  </p>
                  <p className="text-gray-500">
                    {requests.length === 0
                      ? "Check back later or post a new request if you're a buyer."
                      : "Try adjusting your search filter."}
                  </p>
                </div>
              ) : (
                <div className="space-y-12">
                  {/* Accepted Requests Section */}
                  {acceptedRequests.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                          Accepted Requests
                        </h2>
                        <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1">
                          {acceptedRequests.length}
                        </Badge>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-7">
                        {acceptedRequests.map((req) => (
                          <Card
                            key={req.id}
                            className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-300 bg-white group"
                          >
                            <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                              <span className="text-9xl  select-none">
                                🌾
                              </span>
                            </div>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start gap-4 mb-4">
                                <h3 className="font-semibold text-xl text-gray-900 line-clamp-2 leading-tight ">
                                  {req.cropName}
                                </h3>
                                <div className="flex items-center gap-2 shrink-0">
                                  {getStatusBadge(req.status)}
                                  {showCallButton && req.firmPhone && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 rounded-full hover:bg-emerald-50"
                                      onClick={() => handleCallFirm(req.firmPhone)}
                                      title={`Call ${req.firmName}`}
                                    >
                                      <Phone className="h-4 w-4 text-emerald-600" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3.5 text-sm mb-6">
                                <div className="flex items-center gap-3">

                                  <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-semibold shrink-0">
                                    {req.firmName?.charAt(0) || "?"}
                                  </div>
                                  <span className="font-medium text-gray-800 truncate">
                                    {req.firmName}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2.5 text-gray-600">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {req.city}, {req.state}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2.5 text-gray-600">
                                  <Package className="h-4 w-4 flex-shrink-0" />
                                  <span>Requirement: {req.requirement}</span>
                                </div>

                                <div className="flex items-center gap-2.5 text-gray-600">
                                  <Clock className="h-4 w-4 flex-shrink-0" />
                                  <span>Deadline: {req.deadline}</span>
                                </div>

                                <div className="text-xs text-gray-500 pt-1">
                                  Posted on {req.requestedAt}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending Requests Section */}
                  {pendingRequests.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                          All Pending Requests
                        </h2>
                        <Badge className="bg-amber-100 text-amber-700 px-3 py-1">
                          {pendingRequests.length}
                        </Badge>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-7">
                        {pendingRequests.map((req) => (
                          <Card
                            key={req.id}
                            className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-300 bg-white group"
                          >
                            <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                              <span className="text-9xl  select-none">
                                🌾
                              </span>
                            </div>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start gap-4 mb-4">
                                <h3 className="font-semibold text-xl text-gray-900 line-clamp-2 leading-tight ">
                                  {req.cropName}
                                </h3>
                                <div className="flex items-center gap-2 shrink-0">
                                  {getStatusBadge(req.status)}
                                  {showCallButton && req.firmPhone && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 rounded-full hover:bg-emerald-50"
                                      onClick={() => handleCallFirm(req.firmPhone)}
                                      title={`Call ${req.firmName}`}
                                    >
                                      <Phone className="h-4 w-4 text-emerald-600" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3.5 text-sm mb-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-semibold shrink-0">
                                    {req.firmName?.charAt(0) || "?"}
                                  </div>
                                  <span className="font-medium text-gray-800 truncate">
                                    {req.firmName}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2.5 text-gray-600">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {req.city}, {req.state}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2.5 text-gray-600">
                                  <Package className="h-4 w-4 flex-shrink-0" />
                                  <span>Requirement: {req.requirement}</span>
                                </div>

                                <div className="flex items-center gap-2.5 text-gray-600">
                                  <Clock className="h-4 w-4 flex-shrink-0" />
                                  <span>Deadline: {req.deadline}</span>
                                </div>

                                <div className="text-xs text-gray-500 pt-1">
                                  Posted on {req.requestedAt}
                                </div>
                              </div>

                              {(showAcceptButton || canViewQuotations(req)) && (
                                <div className="space-y-3">
                                  {showAcceptButton && (
                                    <Button
                                      onClick={() => handleOpenQuotationModal(req)}
                                      className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors"
                                    >
                                      Add Quotation
                                    </Button>
                                  )}

                                  {showAcceptButton && (
                                    <Button
                                      onClick={() => handleAcceptRequest(req.id)}
                                      variant="outline"
                                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                      Accept This Request
                                    </Button>
                                  )}

                                  {canViewQuotations(req) && (
                                    <Button
                                      onClick={() => handleViewQuotations(req.id)}
                                      variant="outline"
                                      className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                    >
                                      View Quotations
                                    </Button>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Add Request Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Post New Crop Request</h2>
              <p className="text-gray-600 mt-1">Specify what you need from farmers.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Crop Name</label>
                <Input
                  name="cropName"
                  value={formData.cropName}
                  onChange={handleFormChange}
                  placeholder="e.g., Wheat, Soybean, Turmeric"
                  className="rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Requirement (quantity)</label>
                <Input
                  name="requirement"
                  value={formData.requirement}
                  onChange={handleFormChange}
                  placeholder="e.g., 10,000 kg or 500 quintals"
                  className="rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
                <Input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleFormChange}
                  className="rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-300"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Quotation Modal */}
      {showQuotationModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Add Quotation</h2>
              <p className="text-gray-600 mt-1">
                Enter your rate for {selectedRequestForQuotation?.cropName || "this request"}.
              </p>
            </div>

            <form onSubmit={handleQuotationSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rate (INR)</label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={quotationRate}
                  onChange={(e) => setQuotationRate(e.target.value)}
                  placeholder="e.g., 2450"
                  className="rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                  required
                />
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-300"
                  onClick={handleCloseQuotationModal}
                  disabled={submittingQuotation}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                  disabled={submittingQuotation}
                >
                  {submittingQuotation ? "Submitting..." : "Submit Quotation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllRequests;