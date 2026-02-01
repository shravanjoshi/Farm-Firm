// src/pages/AllRequests.jsx

import { useState, useEffect, useContext } from "react";
import { Input } from "./Input";
import { Button } from "./Button";
import { Card } from "./Card";
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
  Filter,
  ArrowUpDown,
  Clock,
  Package,
  Building,
  MapPin,
  AlertCircle,
  Plus,
  Phone,           // ← added
} from "lucide-react";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

const AllRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { isLoggedIn, user } = useContext(AuthContext);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    cropName: "",
    requirement: "",
    deadline: "",
  });

  useEffect(() => {
    const fetchAllRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BACKEND_URL}/api/allrequests`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        if (data.success) {
          const normalized = data.requests.map((req) => ({
            id: req._id,
            cropName: req.cropname || "Unknown Crop",
            firmName: req.firmId?.CompanyName || "Unknown Firm",
            city: req.firmId?.city || "—",
            state: req.firmId?.state || "—",
            firmPhone: req.firmId?.phoneNumber || null, 
            requirement: req.requirement || "Not specified",
            deadline: req.deadline
              ? new Date(req.deadline).toLocaleDateString("en-IN")
              : "—",
            requestedAt: new Date(req.createdAt).toLocaleDateString("en-IN"),
            status: (req.status || "Pending").toLowerCase(),
          }));

          setRequests(normalized);
        } else {
          setError(data.error || "Failed to load requests");
        }
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Could not load crop requests. Please try again later.");
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
      toast.error("Please fill in all fields");
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
      console.log(data);

      if (response.ok) {
        toast.success(data.message || "Crop request submitted successfully!");
        setFormData({ cropName: "", requirement: "", deadline: "" });
        setRequests((prev) => [
          {
            id: data._id ,
            cropName: formData.cropName,
            firmName: data.firmId?.CompanyName || "Unknown Firm",
            city: data.firmId?.city || "—",
            state: data.firmId?.state || "—",
            firmPhone: data.firmId?.phoneNumber || null,
            requirement: formData.requirement,
            deadline: formData.deadline,
            requestedAt: new Date().toLocaleDateString("en-IN"),
            status: "Pending",
          },
          ...prev
        ]);
        setShowAddForm(false);
      } else {
        toast.error(data.error || "Failed to submit request");
      }
    } catch (err) {
      toast.error("Network error while submitting request");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to accept this request?")) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/requests/accept/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();
       console.log(data);
      if (response.ok) {
        toast.success("Request accepted successfully");

           setRequests((prev) =>
          prev.map((req) =>
          req.id?.toString() === requestId?.toString() ? { ...req, status: "accepted" } : req
          )
        );
      } else {
        toast.error(data.error || "Failed to accept request");
      }
    } catch (err) {
      console.error("Accept request error:", err);
      toast.error("Network error while accepting request");
    }
  };

  const handleCallFirm = (phone) => {
    if (!phone) {
      toast.warning("Phone number not available for this firm");
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredRequests = requests
    .filter((req) => {
      const matchesSearch =
        req.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.firmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.state.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === "all" || req.status === filterStatus;

      return matchesSearch && matchesStatus;
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

  const showAcceptButton = isLoggedIn && user?.userType === "farmer";
  const showCallButton = isLoggedIn;

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-16 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl font-bold text-foreground mb-3">
                All <span className="text-primary">Crop Requests</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                View purchase requests from firms and buyers across India.
              </p>
            </div>

            {isLoggedIn && user?.userType === "firm" && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="whitespace-nowrap"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Request
              </Button>
            )}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-0 z-10 bg-background py-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search crop, firm, city or state..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="crop-name">Crop Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading crop requests...</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-20 max-w-md mx-auto">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          )}

          {!loading && !error && (
            <>
              <p className="text-muted-foreground mb-6">
                Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""}
              </p>

              {filteredRequests.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-xl">
                    {requests.length === 0
                      ? "No crop requests available at this time."
                      : "No requests found matching your criteria."}
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredRequests.map((req) => (
                    <Card
                      key={req.id}
                      className="overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="h-40 bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center text-6xl overflow-hidden">
                        <Package className="h-20 w-20 text-muted-foreground" />
                      </div>

                      <div className="p-5">
                        {/* Header row with crop name, status, and call button */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg line-clamp-2 pr-10">
                            {req.cropName}
                          </h3>

                          <div className="flex items-center gap-2 shrink-0">
                            {getStatusBadge(req.status)}

                            {showCallButton && req.firmPhone && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleCallFirm(req.firmPhone)}
                                title={`Call ${req.firmName}`}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2.5 text-sm text-muted-foreground mb-5">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span className="font-medium text-foreground">{req.firmName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{req.city}, {req.state}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span>Requirement: {req.requirement}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Deadline: {req.deadline}</span>
                          </div>
                          <div className="text-xs pt-1 opacity-80">
                            Requested on: {req.requestedAt}
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          {showAcceptButton && req.status === "pending" && (
                            <Button
                              onClick={() => handleAcceptRequest(req.id)}
                              className="w-full"
                              variant="default"
                            >
                              Accept Request
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Add Request Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h2 className="text-2xl font-bold mb-6">Add New Crop Request</h2>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Crop Name</label>
                <Input
                  name="cropName"
                  value={formData.cropName}
                  onChange={handleFormChange}
                  placeholder="e.g. Basmati Rice"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Requirement</label>
                <Input
                  name="requirement"
                  value={formData.requirement}
                  onChange={handleFormChange}
                  placeholder="e.g. 5000 kg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deadline</label>
                <Input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Submit Request
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