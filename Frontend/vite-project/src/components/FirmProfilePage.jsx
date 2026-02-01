import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { Card, CardContent } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Input } from "./Input";
import {
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    Package,
    Loader2,
    ShoppingCart,
    Clock,
    TrendingUp,
    TrendingDown,
    Search,
    LayoutDashboard,
    History,
    Settings,
    IndianRupee,
    Star,
    MapPinIcon,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

const FirmProfilePage = () => {
    const navigate = useNavigate();
    const { user, isLoggedIn } = useContext(AuthContext);

    const [profileData, setProfileData] = useState(null);
    const [myRequests, setMyRequests] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [searchQuery, setSearchQuery] = useState("");

    // Market prices data
    const marketPrices = [
        { crop: "Wheat", location: "Mumbai APMC", price: 28, unit: "kg", trend: "up", change: 7.7 },
        { crop: "Rice (Basmati)", location: "Delhi Mandi", price: 85, unit: "kg", trend: "down", change: -3.4 },
        { crop: "Onions", location: "Nashik Mandi", price: 22, unit: "kg", trend: "up", change: 22.2 },
    ];

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }

        const fetchProfileData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch firm profile data
                const response = await fetch(`${BACKEND_URL}/api/firm/profile`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch profile data");
                }

                const data = await response.json();
                console.log("Fetched firm profile data:", data);
                setProfileData(data.firmProfile);

                // Fetch firm's requests
                const requestsResponse = await fetch(`${BACKEND_URL}/api/myrequests`, {
                    method: "GET",
                    credentials: "include",
                });

                if (requestsResponse.ok) {
                    const requestsData = await requestsResponse.json();
                    console.log("Fetched firm requests data:", requestsData);
                    if (requestsData.success) {

                        setMyRequests(requestsData.crop || []);
                    }
                }

                // Fetch farmers/suppliers
                const farmersResponse = await fetch(`${BACKEND_URL}/api/farmers`, {
                    method: "GET",
                    credentials: "include",
                });

                if (farmersResponse.ok) {
                    const farmersData = await farmersResponse.json();
                    console.log("Fetched farmers data:", farmersData);
                    if (farmersData.success) {
                        setFarmers(farmersData.farmers || []);
                    }
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user, isLoggedIn, navigate]);

    // Calculate stats
    const totalPurchases = myRequests.filter((req) => req.status === "accepted" || req.status === "Accepted").length;
    const activeSuppliers = 8; // You can calculate from unique farmers
    const totalSpent = myRequests
        .filter((req) => req.status === "accepted" || req.status === "Accepted")
        .reduce((sum, req) => sum + (req.quantity * req.cropId?.price || 0), 0);
    const pendingOrders = myRequests.filter((req) => req.status === "pending" || req.status === "Pending").length;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md px-6 py-10">
                    <Loader2 className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Error</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            {/* <aside className="w-64 bg-[#1a1f1a] text-white flex flex-col">
                Logo
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-firm rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold">KrishiConnect</span>
                    </div>
                </div>

               
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-firm/20 rounded-full flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-firm" />
                        </div>
                        <div>
                            <p className="font-semibold">{profileData?.CompanyName}</p>
                            <p className="text-sm text-white/60">Firm</p>
                        </div>
                    </div>
                </div>

              
                <nav className="flex-1 p-4">
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeTab === "dashboard"
                                ? "bg-firm text-white"
                                : "text-white/70 hover:bg-white/5"
                            }`}
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("find-farmers")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeTab === "find-farmers"
                                ? "bg-firm text-white"
                                : "text-white/70 hover:bg-white/5"
                            }`}
                    >
                        <Search className="h-5 w-5" />
                        <span>Find Farmers</span>
                    </button>

                    <button
                        onClick={() => navigate("/my-requests")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-white/70 hover:bg-white/5 transition-colors"
                    >
                        <History className="h-5 w-5" />
                        <span>Transactions</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("market-prices")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeTab === "market-prices"
                                ? "bg-firm text-white"
                                : "text-white/70 hover:bg-white/5"
                            }`}
                    >
                        <TrendingUp className="h-5 w-5" />
                        <span>Market Prices</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeTab === "settings"
                                ? "bg-firm text-white"
                                : "text-white/70 hover:bg-white/5"
                            }`}
                    >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                    </button>
                </nav>
            </aside>  */}

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="container mx-auto px-8 py-8 max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-foreground mb-2">
                            Welcome back! 👋
                        </h1>
                        <p className="text-muted-foreground">
                            Find the best farmers and crops for your business.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Total Purchases</p>
                                    <p className="text-3xl font-bold text-foreground mb-1">{totalPurchases}</p>
                                    <p className="text-xs text-muted-foreground">8 this month</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <Package className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Active Suppliers</p>
                                    <p className="text-3xl font-bold text-foreground mb-1">{activeSuppliers}</p>
                                    <p className="text-xs text-firm">+3 new farmers</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <IndianRupee className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                                    <p className="text-3xl font-bold text-foreground mb-1">
                                        ₹{totalSpent.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">This quarter</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                                    <p className="text-3xl font-bold text-foreground mb-1">{pendingOrders}</p>
                                    <p className="text-xs text-muted-foreground">In progress</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Find Farmers Section */}
                        <div className="lg:col-span-2">
                            <Card>
                                <div className="p-6 border-b border-border">
                                    <h2 className="text-2xl font-bold text-foreground mb-4">Find Farmers</h2>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                type="text"
                                                placeholder="Search by crop, location, or farmer name..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 h-12"
                                            />
                                        </div>
                                        <Button className="bg-firm hover:bg-firm/90 h-12 px-8">
                                            Search
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    {farmers.length === 0 ? (
                                        <div className="text-center py-12">
                                            <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-muted-foreground">No farmers found</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Sample Farmer Cards */}
                                            {farmers.map((farmer) => (
                                                <Card key={farmer._id} className="hover:shadow-md transition-shadow">
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 rounded-full bg-farmer/10 flex items-center justify-center">
                                                                    <span className="text-xl font-bold text-farmer">{farmer.FirstName.charAt(0)}</span>
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className="font-semibold text-foreground">{farmer.FirstName} {farmer.LastName}</h3>
                                                                        <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                                                                            Verified
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                        <MapPinIcon className="h-3 w-3" />
                                                                        <span>{farmer.city}, {farmer.state}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                <span className="text-sm font-semibold">4.5</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {farmer.listedCrops && farmer.listedCrops.map((crop) => (
                                                                <Badge key={crop._id} className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                                                                    {crop.cropname}
                                                                </Badge>
                                                            ) )}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm text-muted-foreground">
                                                                45 sales completed
                                                            </p>
                                                            
                                                            <Phone className="h-4 w-4 mr-2" />
                                                            {farmer.phoneNumber}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Market Prices Sidebar */}
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
                                                    <p className="text-xs text-muted-foreground">{item.location}</p>
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

                            {/* Recent Transactions */}
                            <Card className="mt-6">
                                <div className="p-6 border-b border-border">
                                    <h2 className="text-xl font-bold text-foreground">Recent Transactions</h2>
                                </div>
                                <CardContent className="p-6">
                                    {myRequests.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">No recent transactions</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {myRequests.slice(0, 3).map((req, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                                                >
                                                    <div>
                                                        <p className="font-medium text-foreground text-sm">
                                                            {req.cropId?.cropname || "Crop"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {req.quantity} {req.cropId?.unit}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        className={
                                                            req.status === "accepted" || req.status === "Accepted"
                                                                ? "bg-green-500/10 text-green-600 border-green-500/30"
                                                                : req.status === "pending" || req.status === "Pending"
                                                                    ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                                                                    : "bg-red-500/10 text-red-600 border-red-500/30"
                                                        }
                                                    >
                                                        {req.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FirmProfilePage;
