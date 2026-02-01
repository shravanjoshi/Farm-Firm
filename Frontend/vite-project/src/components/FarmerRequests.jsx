// src/components/FarmerRequests.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  IndianRupee,
  Package,
  Calendar,
  MapPin,
  Building,
  AlertTriangle,
  Clock,
  Check,
  X,
  Plus,
  Phone
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4003';

const FarmerRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchFarmerRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BACKEND_URL}/api/requested-crops`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.warn('Please log in to view incoming requests');
            navigate('/login-page');
            return;
          }
          throw new Error('Failed to fetch incoming crop requests');
        }

        const data = await response.json();

        if (data?.success) {
          setRequests(Array.isArray(data.requests) ? data.requests : []);
        } else {
          throw new Error(data?.error || 'Unable to load incoming requests');
        }
      } catch (err) {
        const message = err.message || 'An unexpected error occurred';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerRequests();
  }, [navigate]);

  const handleAccept = async (requestId) => {
    if (!window.confirm('Are you sure you want to accept this request?')) return;

    setProcessingId(requestId);

    try {
      const response = await fetch(`${BACKEND_URL}/api/accept/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Request accepted successfully');
        setRequests((prev) =>
          prev.map((r) => (r._id === requestId ? { ...r, status: 'accepted' } : r))
        );
      } else {
        toast.error(result.error || 'Failed to accept request');
      }
    } catch (err) {
      toast.error('Network error while accepting request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;

    setProcessingId(requestId);
    try {
      const response = await fetch(`${BACKEND_URL}/api/reject/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Request rejected successfully');
        setRequests((prev) =>
          prev.map((r) => (r._id === requestId ? { ...r, status: 'rejected' } : r))
        );
      } else {
        toast.error(result.error || 'Failed to reject request');
      }
    } catch (err) {
      toast.error('Network error while rejecting request');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-5">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-emerald-600 border-r-4 border-emerald-200 mx-auto"></div>
          <p className="text-lg font-medium text-gray-700">Loading incoming requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-10 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Error Loading Requests</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-emerald-700 transition"
          >
            Try Again
          </button>
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
                Incoming <span className="text-emerald-600">Crop Requests</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl">
                View and respond to purchase requests from buyers for your listed crops.
              </p>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                No incoming requests yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                When buyers request your crops, they will appear here for you to review.
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 font-medium mb-8">
                Showing {requests.length} incoming request{requests.length !== 1 ? 's' : ''}
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-7">
                {requests.map((req) => {
                  const isProcessing = processingId === req._id;
                  const status = (req.status || 'pending').toLowerCase();

                  const cropName = req.cropId?.cropname || 'Unknown Crop';
                  const firmName = req.firmId?.CompanyName || 'Unknown Firm';
                  const firmCity = req.firmId?.city || '—';
                  const firmState = req.firmId?.state || '—';
                  const phone = req.firmId?.phoneNumber || null;

                  return (
                    <div
                      key={req._id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-300 overflow-hidden group"
                    >
                      {/* Image Area – same as CropPage */}
                      <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                        {req.cropId?.img?.startsWith('/Uploads/') ? (
                          <img
                            src={`${BACKEND_URL}${req.cropId.img}`}
                            alt={cropName}
                            className="w-full h-full object-cover "
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x300?text=Crop+Image';
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-35 group-hover:opacity-65 transition-opacity duration-300 select-none">
                            🌾
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <h3 className="font-semibold text-xl text-gray-900 line-clamp-2 leading-tight ">
                            {cropName}
                          </h3>

                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                              status === 'accepted'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : status === 'rejected'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>

                        <div className="space-y-3.5 text-sm mb-6">
                          <div className="flex items-center gap-2.5 text-gray-600">
                            <IndianRupee className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                            <span>
                              Listed at:{' '}
                              <span className="font-medium text-gray-800">
                                ₹{(req.cropId?.price ?? 0).toLocaleString('en-IN')}
                              </span>{' '}
                              per unit
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 text-gray-600">
                            <Package className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                            <span>
                              Requested:{' '}
                              <span className="font-medium text-gray-800">
                                {req.requirement || '—'}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 text-gray-600">
                            <Calendar className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                            <span>
                              Deadline:{' '}
                              {req.deadline
                                ? new Date(req.deadline).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 text-gray-600">
                            <Building className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                            <span className="truncate">
                              From: <span className="font-medium text-gray-800">{firmName}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 text-gray-600">
                            <MapPin className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                            <span className="truncate">
                              {firmCity}, {firmState}
                            </span>
                          </div>

                          {phone && (
                            <div className="flex items-center gap-2.5 text-gray-600 pt-1 border-t border-gray-100 pt-4">
                              <Phone className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                              <span>{phone}</span>
                            </div>
                          )}

                          <div className="text-xs text-gray-500 pt-2">
                            Requested on{' '}
                            {new Date(req.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>

                        {status === 'pending' && (
                          <div className="flex gap-4 pt-5 border-t border-gray-100">
                            <button
                              onClick={() => handleAccept(req._id)}
                              disabled={isProcessing}
                              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                                isProcessing
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow'
                              }`}
                            >
                              {isProcessing ? (
                                <Clock className="h-5 w-5 animate-spin" />
                              ) : (
                                <Check className="h-5 w-5" />
                              )}
                              Accept
                            </button>

                            <button
                              onClick={() => handleReject(req._id)}
                              disabled={isProcessing}
                              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                                isProcessing
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow'
                              }`}
                            >
                              {isProcessing ? (
                                <Clock className="h-5 w-5 animate-spin" />
                              ) : (
                                <X className="h-5 w-5" />
                              )}
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default FarmerRequests;