// src/components/ListedCrops.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Card, CardContent } from "./Card"; // assuming CardContent is used
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Package, IndianRupee, MapPin, AlertTriangle, Plus } from "lucide-react";

const BACKEND_URL = "http://localhost:4003"; // or import.meta.env.VITE_BACKEND_API_URL

const ListedCrops = () => {
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyCrops = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BACKEND_URL}/api/listed-crops`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please log in to view your listed crops");
          }
          throw new Error("Failed to fetch your listed crops");
        }

        const data = await response.json();

        if (data.success) {
          const normalized = (data.listedCrops || []).map((crop) => ({
            ...crop,
            grade: crop.grade || "B",
            totalavailable: crop.totalavailable || 0,
            minquantity: crop.minquantity || 0,
            price: crop.price || 0,
            unit: crop.unit || "kg",
          }));
          setCrops(normalized);
        } else {
          setError(data.error || "Unable to load your crops");
        }
      } catch (err) {
        console.error("Error fetching listed crops:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMyCrops();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-5">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-emerald-600 border-r-4 border-emerald-200 mx-auto"></div>
          <p className="text-lg font-medium text-gray-700">Loading your listed crops...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border p-10 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Error Loading Crops</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-emerald-600 hover:bg-emerald-700 px-8">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-12">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                My <span className="text-emerald-600">Listed Crops</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl">
                Manage and track the crops you have offered for sale.
              </p>
            </div>

            <Button
              onClick={() => navigate("/add-crop")}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="mr-2 h-5 w-5" />
              List New Crop
            </Button>
          </div>

          {crops.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                No crops listed yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Add your first crop to start selling directly to buyers across India.
              </p>
              <Button
                onClick={() => navigate("/add-crop")}
                className="bg-emerald-600 hover:bg-emerald-700 px-8"
              >
                Add Your First Crop
              </Button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 font-medium mb-8">
                You have {crops.length} crop{crops.length !== 1 ? "s" : ""} listed
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-7">
                {crops.map((crop) => (
                  <Card
                    key={crop._id}
                    className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-300 bg-white group"
                  >
                    <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                      {crop.img?.startsWith("/Uploads/") ? (
                        <img
                          src={`${BACKEND_URL}${crop.img}`}
                          alt={crop.cropname}
                          className="w-full h-full object-cover "
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x300?text=Crop+Image";
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-35 group-hover:opacity-65 transition-opacity duration-300 select-none">
                          🌾
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <h3 className="font-semibold text-xl text-gray-900 line-clamp-2 leading-tight ">
                          {crop.cropname}
                        </h3>

                        <Badge
                          className={
                            crop.grade === "A"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 text-xs font-medium rounded-full"
                              : crop.grade === "B"
                              ? "bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 text-xs font-medium rounded-full"
                              : "bg-orange-50 text-orange-700 border-orange-200 px-3 py-1 text-xs font-medium rounded-full"
                          }
                        >
                          Grade {crop.grade || "N/A"}
                        </Badge>
                      </div>

                      <div className="space-y-3.5 text-sm mb-6">
                        <div className="flex items-center gap-2.5 text-gray-600">
                          <IndianRupee className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                          <span className="font-medium">
                            ₹{crop.price} <span className="text-gray-500">per {crop.unit}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-gray-600">
                          <Package className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                          <span>
                            Available: <span className="font-medium text-gray-800">{crop.totalavailable} {crop.unit}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-gray-600">
                          <Package className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                          <span>
                            Min order: <span className="font-medium text-gray-800">{crop.minquantity} {crop.unit}</span>
                          </span>
                        </div>

                        {/* Optional: location if you have it in the future */}
                        {/* <div className="flex items-center gap-2.5 text-gray-600">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{crop.city || "—"}, {crop.state || "—"}</span>
                        </div> */}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-xl border-gray-300 hover:bg-gray-50"
                          onClick={() => navigate(`/crop-details/${crop._id}`)}
                        >
                          View Details
                        </Button>

                                          </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ListedCrops;