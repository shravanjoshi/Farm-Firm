import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { Input } from "./Input";
import { Button } from "./Button";
import { Card, CardContent } from "./Card"; // assuming you have CardContent
import { Badge } from "./Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { Search, Filter, ArrowUpDown, Star, MapPin, Package, Plus } from "lucide-react";

const BACKEND_URL = "http://localhost:4003";

const CropPage = () => {
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("price-low");
  const [filterQuality, setFilterQuality] = useState("all");

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BACKEND_URL}/api/crops`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (data.success) {
          const normalized = data.crops.map((crop) => ({
            id: crop._id,
            name: crop.cropname || "Unnamed Crop",
            farmer:
              [crop.userId?.FirstName, crop.userId?.LastName]
                .filter(Boolean)
                .join(" ") || "Unknown Farmer",
            farmerRating: crop.farmerRating || 4.0,
            location: `${crop.userId?.city || "Unknown"}, ${crop.userId?.state || "Unknown"}`,
            minquantity: crop.minquantity || 0,
            unit: crop.unit || "kg",
            price: crop.price || 0,
            quality: crop.grade || "B",
            image: crop.img || null,
            available: crop.totalavailable || 0,
          }));

          setCrops(normalized);
        } else {
          setError(data.error || "Failed to load crops");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to load crops at this time.");
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  const getQualityStyles = (quality) => {
    const styles = {
    A: "bg-emerald-100 text-emerald-800 border-emerald-200",   // Excellent / Distinction
B: "bg-blue-100 text-blue-800 border-blue-200",           // Good / Above average
C: "bg-amber-100 text-amber-800 border-amber-200",         // Average / Pass
    };
    return styles[quality] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  const filteredCrops = crops
    .filter((crop) => {
      const q = searchQuery.toLowerCase();
      return (
        crop.name.toLowerCase().includes(q) ||
        crop.farmer.toLowerCase().includes(q) ||
        crop.location.toLowerCase().includes(q)
      ) && (filterQuality === "all" || crop.quality === filterQuality);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":  return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "quantity":   return b.available - a.available;
        case "rating":     return b.farmerRating - a.farmerRating;
        default:           return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-emerald-600 mx-auto"></div>
          <p className="text-lg text-gray-600 font-medium">Loading fresh crops...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md px-6 py-10 bg-white rounded-2xl shadow-sm border">
          <h2 className="text-2xl font-semibold text-red-600 mb-3">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/40">
      <main className="pt-10 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                Browse <span className="text-emerald-600">Crops</span>
              </h1>
              <p className="mt-3 text-lg text-gray-600 max-w-2xl">
                Fresh, farm-direct produce from trusted growers across India.
              </p>
            </div>

            <Button
              onClick={() => navigate("/add-crop")}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="mr-2 h-5 w-5" />
              List Your Crop
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-gray-100 rounded-xl  p-5 mb-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by crop, farmer or location..."
                  className="pl-12 h-12 text-base rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={filterQuality} onValueChange={setFilterQuality}>
                <SelectTrigger className="h-12 w-full md:w-44 rounded-lg">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="A">Grade A – Premium</SelectItem>
                  <SelectItem value="B">Grade B – Standard</SelectItem>
                  <SelectItem value="C">Grade C – Economy</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 w-full md:w-52 rounded-lg">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-low">Price: Low → High</SelectItem>
                  <SelectItem value="price-high">Price: High → Low</SelectItem>
                  <SelectItem value="quantity">Most Available</SelectItem>
                  <SelectItem value="rating">Best Rated Farmers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Count */}
          <p className="text-gray-600 mb-6 font-medium">
            {filteredCrops.length} {filteredCrops.length === 1 ? "crop" : "crops"} found
          </p>

          {filteredCrops.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
              <p className="text-xl text-gray-600">No crops match your current filters.</p>
              <p className="mt-2 text-gray-500">Try adjusting search or filters.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-7">
              {filteredCrops.map((crop) => (
                <Card
                  key={crop.id}
                  className="overflow-hidden border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200/60 transition-all duration-300 bg-white group"
                >
                  <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                    {crop.image?.startsWith("/Uploads") ? (
                      <img
                        src={`${BACKEND_URL}${crop.image}`}
                        alt={crop.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-8xl opacity-30">
                        🌾
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <h3 className="font-semibold text-xl text-gray-900 line-clamp-2 leading-tight">
                        {crop.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`px-3 py-1 text-sm font-medium ${getQualityStyles(crop.quality)}`}
                      >
                        Grade {crop.quality}
                      </Badge>
                    </div>

                    <div className="space-y-3 text-sm mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm shrink-0">
                          {crop.farmer?.[0] || "?"}
                        </div>
                        <span className="font-medium text-gray-800 truncate">
                          {crop.farmer}
                        </span>
                        <div className="flex items-center gap-1 ml-auto text-amber-600">
                          <Star className="h-4 w-4 fill-amber-500" />
                          <span className="font-medium">{crop.farmerRating}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{crop.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="h-4 w-4" />
                        <span>
                          {crop.available} {crop.unit} available
                        </span>
                      </div>

                      <div className="text-gray-600">
                        Min order: <span className="font-medium">{crop.minquantity} {crop.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <span className="text-3xl font-bold text-emerald-700">
                          ₹{crop.price}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">/{crop.unit}</span>
                      </div>

                      <Button
                        asChild
                        variant={crop.available ? "default" : "secondary"}
                        size="sm"
                        disabled={!crop.available}
                        className={crop.available ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                      >
                        <Link to={`/crop-details/${crop.id}`}>
                          {crop.available ? "Contact Farmer" : "Not Available"}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CropPage;