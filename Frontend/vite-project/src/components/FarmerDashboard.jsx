import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { Card, CardContent } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import {
  Package,
  ShoppingCart,
  IndianRupee,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  X,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [profileData, setProfileData] = useState(null);
  const [listedCrops, setListedCrops] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [editFormData, setEditFormData] = useState({
    cropname: "",
    totalavailable: "",
    price: "",
    unit: "kg",
    grade: "A",
    minquantity: "",
    status: "Active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Market prices data
  const marketPrices = [
    { crop: "Wheat", location: "Mumbai APMC", price: 28, unit: "kg", trend: "up", change: 7.7 },
    { crop: "Rice (Basmati)", location: "Delhi Mandi", price: 85, unit: "kg", trend: "down", change: -3.4 },
    { crop: "Tomatoes", location: "Pune APMC", price: 35, unit: "kg", trend: "neutral", change: 0.0 },
    { crop: "Onions", location: "Nashik Mandi", price: 22, unit: "kg", trend: "up", change: 22.2 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch profile
        const profileRes = await fetch(`${BACKEND_URL}/api/farmer/profile`, {
          method: "GET",
          credentials: "include",
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          console.log("Farmer Profile Data:", profileData);
          setProfileData(profileData.farmerProfile);
        }

        // Fetch listed crops
        const cropsRes = await fetch(`${BACKEND_URL}/api/listed-crops`, {
          method: "GET",
          credentials: "include",
        });
        if (cropsRes.ok) {
          const cropsData = await cropsRes.json();
          console.log("Listed Crops Data:", cropsData);
          if (cropsData.success) {
            setListedCrops(cropsData.listedCrops || []);
          }
        }

        // Fetch requests
        const requestsRes = await fetch(`${BACKEND_URL}/api/requested-crops`, {
          method: "GET",
          credentials: "include",
        });
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          console.log("Farmer Requests Data:", requestsData);
          if (requestsData.success) {
            setRequests(requestsData.requests || []);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats
  const activeListings = listedCrops.filter((crop) => crop.status === "Active").length;
  const pendingOrders = requests.filter((req) => req.status === "Pending").length;
  const totalSales = requests.filter((req) => req.status === "Accepted").length;
  const totalEarnings = requests
    .filter((req) => req.status === "Accepted")
    .reduce((sum, req) => sum + (req.requirement * req.cropId?.price || 0), 0);

  const handleEditClick = (crop) => {
    setSelectedCrop(crop);
    setEditFormData({
      cropname: crop.cropname || "",
      totalavailable: crop.totalavailable || "",
      price: crop.price || "",
      unit: crop.unit || "kg",
      grade: crop.grade || "A",
      minquantity: crop.minquantity || "",
      status: crop.status || "Active",
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedCrop(null);
    setEditFormData({
      cropname: "",
      totalavailable: "",
      price: "",
      unit: "kg",
      grade: "A",
      minquantity: "",
      status: "Active",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/crops/${selectedCrop._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedCrop = await response.json();
        // Update the local state
        setListedCrops((prev) =>
          prev.map((crop) =>
            crop._id === selectedCrop._id ? { ...updatedCrop.crop, ...editFormData } : crop
          )
        );
        handleCloseModal();
        alert("Crop updated successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to update crop: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating crop:", error);
      alert("An error occurred while updating the crop");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A":
        return "bg-farmer/10 text-farmer border-farmer/30";
      case "B":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "C":
        return "bg-muted text-muted-foreground border-muted";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-farmer/10 text-farmer border-farmer/30";
      case "Pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome back, {profileData?.FirstName || user?.name}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your crops today.
            </p>
          </div>
          <Button
            onClick={() => navigate("/add-crop")}
            variant="farmer"
            size="lg"
            className="shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Listing
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-farmer/10 rounded-lg">
                  <Package className="h-6 w-6 text-farmer" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Listings</p>
                <p className="text-3xl font-bold text-foreground mb-1">{activeListings}</p>
                <p className="text-xs text-farmer">+2 this week</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-foreground mb-1">{totalSales}</p>
                <p className="text-xs text-muted-foreground">{totalSales} transactions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-foreground mb-1">
                  ₹{totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">+15% this month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-foreground mb-1">{pendingOrders}</p>
                <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Your Crop Listings */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Your Crop Listings</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/listed-crops")}
                  >
                    View All
                  </Button>
                </div>
              </div>
              <CardContent className="p-0">
                {listedCrops.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No crops listed yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">
                            Crop
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">
                            Quantity
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">
                            Price
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">
                            Quality
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">
                            Status
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">
                            Listed
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {listedCrops.slice(0, 5).map((crop) => (
                          <tr
                            key={crop._id}
                            className="border-b border-border hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-4">
                              <span className="font-medium text-foreground">
                                {crop.cropname}
                              </span>
                            </td>
                            <td className="p-4 text-foreground">
                              {crop.totalavailable} {crop.unit}
                            </td>
                            <td className="p-4 text-foreground font-semibold">
                              ₹{crop.price}/{crop.unit}
                            </td>
                            <td className="p-4">
                              <Badge className={getGradeColor(crop.grade)}>
                                Grade {crop.grade}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(crop.status || "active")}>
                                {crop.status || "Active"}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {new Date(crop.createdAt).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => navigate(`/crop/${crop._id}`)}
                                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                                >
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                </button>
                                <button
                                  onClick={() => handleEditClick(crop)}
                                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                                >
                                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                                </button>
                                <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Market Prices */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Market Prices</h2>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {marketPrices.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{item.crop}</p>
                          
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          ₹{item.price}/{item.unit}
                        </p>
                        <div className="flex items-center justify-end gap-1">
                          {item.trend === "up" ? (
                            <>
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-600">
                                +{item.change}%
                              </span>
                            </>
                          ) : item.trend === "down" ? (
                            <>
                              <TrendingDown className="h-3 w-3 text-red-600" />
                              <span className="text-xs text-red-600">{item.change}%</span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {item.change}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-border animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-farmer/10 to-transparent border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-farmer/10 rounded-lg">
                  <Edit2 className="h-5 w-5 text-farmer" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Edit Crop Details</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)] bg-white ">
              <div className="px-8 py-6 space-y-6">
                {/* Crop Name */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Crop Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    name="cropname"
                    value={editFormData.cropname}
                    onChange={handleInputChange}
                    placeholder="e.g., Wheat, Rice, Tomatoes"
                    className="h-12 text-base"
                    required
                  />
                </div>

                {/* Grid for smaller fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Total Available */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Total Available <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      name="totalavailable"
                      value={editFormData.totalavailable}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  {/* Min Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Minimum Order Quantity <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      name="minquantity"
                      value={editFormData.minquantity}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Price per Unit (₹) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      name="price"
                      value={editFormData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Unit <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={editFormData.unit}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, unit: value }))
                      }
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="quintal">Quintal</SelectItem>
                        <SelectItem value="ton">Ton</SelectItem>
                        <SelectItem value="piece">Piece</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Grade */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Quality Grade <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={editFormData.grade}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, grade: value }))
                      }
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Grade A (Premium)</SelectItem>
                        <SelectItem value="B">Grade B (Standard)</SelectItem>
                        <SelectItem value="C">Grade C (Basic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Listing Status <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-4 px-8 py-6 bg-slate-50 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  size="lg"
                  className="min-w-[120px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="farmer"
                  disabled={isSubmitting}
                  size="lg"
                  className="min-w-[160px] shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;