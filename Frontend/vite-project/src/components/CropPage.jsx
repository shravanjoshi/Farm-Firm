import { useState, useEffect } from "react";
import { useNavigate ,Link } from "react-router-dom";

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
import { Search, Filter, ArrowUpDown, Star, MapPin, Package, Plus } from "lucide-react";

const BACKEND_URL = "http://localhost:4003"; // or use import.meta.env.VITE_BACKEND_API_URL

const CropPage = () => {
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("price-low");
  const [filterQuality, setFilterQuality] = useState("all");

  // Fetch all crops from backend
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BACKEND_URL}/api/crops`, {
          method: "GET",
          credentials: "include", // if authentication is required
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();
console.log(data.crops);
        if (data.success) {
          // Normalize data shape to match your existing card rendering
          const normalizedCrops = data.crops.map((crop) => ({
            id: crop._id,
            name: crop.cropname || "Unnamed Crop",
       farmer: [crop.userId?.FirstName, crop.userId?.LastName]
  .filter(Boolean)
  .join(" ") || "Unknown Farmer"
,
            farmerRating: crop.farmerRating || 4.0,       // fallback if not present
location: `${crop.userId?.city || "Unknown City"}, ${crop.userId?.state || "Unknown State"}`,
            minquantity: crop.minquantity || 0,
            unit: crop.unit || "kg",
            price: crop.price || 0,
            quality: crop.grade || "B",
            image: crop.img || "🌾",                      // fallback emoji if no image
            available: crop.totalavailable || 0,
          }));

          setCrops(normalizedCrops);
        } else {
          setError(data.error || "Failed to load crops");
        }
      } catch (err) {
        console.error("Error fetching crops:", err);
        setError("Could not load crops. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  const getQualityColor = (quality) => {
    switch (quality) {
      case "A":
        return "bg-farmer/10 text-farmer border-farmer/20";
      case "B":
        return "bg-secondary/50 text-secondary-foreground border-secondary";
      case "C":
        return "bg-muted text-muted-foreground border-muted";
      default:
        return "";
    }
  };

  // Client-side filtering & sorting (can be moved to backend later)
  const filteredCrops = crops
    .filter((crop) => {
      const matchesSearch =
        crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (crop.farmer || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (crop.location || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesQuality = filterQuality === "all" || crop.quality === filterQuality;

      return matchesSearch && matchesQuality;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "quantity":
          return b.quantity - a.quantity;
        case "rating":
          return b.farmerRating - a.farmerRating;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading crops...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-18 pb-16">
        <div className="container mx-auto px-4">
          {/* Header with Add Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
            <div className="text-center sm:text-left max-w-2xl">
              <h1 className="font-display text-4xl font-bold text-foreground mb-4">
                Browse <span className="text-primary">Crops</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Discover fresh crops from verified farmers across India.
                Compare prices and find the best deals.
              </p>
            </div>

            <Button
              onClick={() => navigate("/add-crop")}
              className="whitespace-nowrap"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Your Crop
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search crops, farmers, or locations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={filterQuality} onValueChange={setFilterQuality}>
              <SelectTrigger className="w-full md:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="A">Grade A</SelectItem>
                <SelectItem value="B">Grade B</SelectItem>
                <SelectItem value="C">Grade C</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="quantity">Quantity Available</SelectItem>
                <SelectItem value="rating">Farmer Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <p className="text-muted-foreground mb-6">
            Showing {filteredCrops.length} crops
          </p>

          {/* Crops Grid */}
          {filteredCrops.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No crops found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCrops.map((crop) => (
                <Card
                  key={crop.id}
                  className={`overflow-hidden hover:shadow-card transition-all duration-300 ${
                    !crop.available ? "opacity-60" : ""
                  }`}
                >
              <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-6xl overflow-hidden">
  {crop.image?.startsWith('/Uploads') ? (
    <img
      src={`${BACKEND_URL}${crop.image}`}   // ← important: prepend backend base URL
      alt={crop.name || "Crop image"}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "https://via.placeholder.com/300x200?text=No+Image"; // fallback
      }}
    />
  ) : (
    // Fallback for old mock data or emoji
    crop.image || "🌾"
  )}
</div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {crop.name}
                      </h3>
                      <Badge variant="outline" className={getQualityColor(crop.quality)}>
                        Grade {crop.quality}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-farmer/10 flex items-center justify-center text-farmer text-xs font-bold">
                          {(crop.farmer || "U")[0]}
                        </div>
                        <span className="text-muted-foreground">{crop.farmer}</span>
                        <div className="flex items-center gap-1 text-secondary ml-auto">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-medium">{crop.farmerRating}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {crop.location}
                      </div>
                        <p>minquantity:-{crop.minquantity}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Package className="w-3 h-3" />
                             {crop.available} {crop.unit} available
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          ₹{crop.price}
                          <span className="text-sm font-normal text-muted-foreground">/{crop.unit}</span>
                        </p>
                      </div>

                      <Link
                      to={`/crop-details/${crop.id}`}
                        variant={crop.available ? "default" : "secondary"}
                        size="sm"
                        disabled={!crop.available}
                      >
                        {crop.available ? "Contact" : "Sold Out"}
                      </Link>
                    </div>
                  </div>
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