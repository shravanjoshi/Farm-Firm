// src/components/CropDetails.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from './AuthContext';
import { MapPin, IndianRupee, Package, Scale, Phone, Send } from 'lucide-react';

const CropDetails = () => {
  const { cropId } = useParams();
  const { user, isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const [crop, setCrop] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    requirement: '',
    deadline: '',
  });

  const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4003';

  useEffect(() => {
    const fetchCropDetails = async () => {
      try {
        const response = await fetch(
          `${backendApiUrl}/api/crop-details/${cropId}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!response.ok) throw new Error('Failed to fetch crop details');

        const data = await response.json();

        setCrop(data.crop || null);
        setFarmer(data.farmer || null);
      } catch (err) {
        toast.error(err.message || 'Error loading crop details');
      } finally {
        setLoading(false);
      }
    };

    fetchCropDetails();
  }, [cropId]);

  const handleCallFarmer = () => {
    if (!isLoggedIn) {
      toast.info('Please log in to contact the farmer');
      navigate('/login-page');
      return;
    }

    const phone = farmer?.phoneNumber;
    if (!phone) {
      toast.warning('Farmer contact number is not available');
      return;
    }

    const cleanPhone = phone.toString().replace(/\D/g, '');
    const fullNumber = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`;

    window.location.href = `tel:${fullNumber}`;
    toast.success(`Initiating call to ${farmer?.FirstName || 'farmer'}...`);
  };

  const handleRequestCrop = () => {
    if (!isLoggedIn) {
      toast.info('Please log in to request this crop');
      navigate('/login-page');
      return;
    }
    setShowRequestForm(true);
  };

  const handleCloseModal = () => {
    setShowRequestForm(false);
    setRequestData({ requirement: '', deadline: '' });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    if (!requestData.requirement.trim()) return toast.error('Please specify requirement');
    if (!requestData.deadline) return toast.error('Please select a deadline');

    try {
      const response = await fetch(`${backendApiUrl}/api/crop-request/${cropId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Request submitted successfully');
        handleCloseModal();
      } else {
        toast.error(result.error || 'Failed to submit request');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-5">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-emerald-600 border-r-4 border-emerald-200 mx-auto"></div>
          <p className="text-lg font-medium text-gray-700">Loading crop details...</p>
        </div>
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md px-6 py-10 bg-white rounded-2xl shadow-sm border">
          <p className="text-xl font-semibold text-gray-700">Crop listing not found</p>
          <p className="text-gray-500 mt-3">It may have been removed or is no longer available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Hero Image Section */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl mb-12">
            <div className="w-full h-96 md:h-[480px] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
              {crop.img?.startsWith('/Uploads/') ? (
                <img
                  src={`${backendApiUrl}${crop.img}`}
                  alt={crop.cropname}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600?text=Crop+Image';
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-9xl md:text-[12rem] opacity-35 select-none">
                  🌾
                </div>
              )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

            <div className="absolute bottom-8 left-6 sm:left-10 right-6 sm:right-10 text-white space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight drop-shadow-lg">
                {crop.cropname}
              </h1>

              <div className="flex items-center gap-3 text-lg sm:text-xl font-medium drop-shadow">
                <MapPin className="h-5 w-5 text-emerald-300" />
                <span>{crop.location || 'Location not specified'}</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            {/* Left: Crop Details */}
            <div className="lg:col-span-2 space-y-10">
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 space-y-8">
                <h2 className="text-3xl font-bold text-gray-900">Crop Information</h2>

                <div className="space-y-6 text-gray-700">
                  <DetailRow label="Crop Name" value={crop.cropname} />
                  <DetailRow
                    label="Price per unit"
                    value={
                      <span className="text-3xl font-bold text-emerald-700">
                        ₹{crop.price?.toLocaleString() || '—'}
                        <span className="text-base font-normal text-gray-500 ml-2">/{crop.unit || 'unit'}</span>
                      </span>
                    }
                  />
                  <DetailRow
                    label="Minimum Order"
                    value={
                      <div className="flex items-center gap-3">
                        <Scale className="h-5 w-5 text-emerald-600" />
                        <span className="font-medium">{crop.minquantity || '—'} {crop.unit || 'units'}</span>
                      </div>
                    }
                  />
                  <DetailRow
                    label="Total Available"
                    value={
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-emerald-600" />
                        <span className="font-medium">{crop.totalavailable || '—'} {crop.unit || 'units'}</span>
                      </div>
                    }
                  />
                  <DetailRow
                    label="Quality Grade"
                    value={
                      <span
                        className={`inline-flex px-4 py-1.5 rounded-full font-medium text-sm border ${
                          crop.grade === 'A' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          crop.grade === 'B' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        Grade {crop.grade || 'N/A'}
                      </span>
                    }
                  />
                </div>
              </section>
            </div>

            {/* Right: Farmer & Actions Sidebar */}
            <div className="space-y-8 lg:sticky lg:top-20 self-start">
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
                <h2 className="text-2xl font-bold text-gray-900">Farmer Details</h2>

                <div className="space-y-5 text-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-semibold text-xl shrink-0">
                      {(farmer?.FirstName?.[0] || '?')}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {farmer?.FirstName || '—'} {farmer?.LastName || ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        {farmer?.city || '—'}, {farmer?.state || '—'}
                      </p>
                    </div>
                  </div>

                  {farmer?.phoneNumber && (
                    <div className="flex items-center gap-3 pt-2">
                      <Phone className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium">{farmer.phoneNumber}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4">
             {user.userType==='firm' && (
                  <button
                    onClick={handleRequestCrop}
                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Send className="h-5 w-5" />
                    Request This Crop
                  </button>
             )}

                  <button
                    onClick={handleCallFarmer}
                    disabled={!farmer?.phoneNumber}
                    className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      farmer?.phoneNumber
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Phone className="h-5 w-5" />
                    Call Farmer
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Request Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Request {crop.cropname}
              </h2>
              <p className="text-gray-600 mt-1">
                Tell the farmer what you need and when.
              </p>
            </div>

            <form onSubmit={handleRequestSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Requirement / Quantity <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={requestData.requirement}
                  onChange={(e) => setRequestData({ ...requestData, requirement: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-400 transition-all"
                  placeholder="e.g., 2,000 kg or 50 quintals"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Deadline <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={requestData.deadline}
                  onChange={(e) => setRequestData({ ...requestData, deadline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-400 transition-all"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
    <span className="font-medium text-gray-700 min-w-[160px] md:min-w-[200px]">
      {label}
    </span>
    <div className="flex-1 text-gray-900">{value}</div>
  </div>
);

export default CropDetails;