import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Clock,
    FileText,
    IndianRupee,
    MapPin,
    Package,
    Building,
    User,
} from "lucide-react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

const FarmerQuotationsPage = () => {
    const navigate = useNavigate();
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyQuotations = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${BACKEND_URL}/api/my-quotations`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.message || "Failed to load your quotations");
                }

                if (data?.success) {
                    setQuotations(Array.isArray(data.quotations) ? data.quotations : []);
                } else {
                    throw new Error(data?.message || "Unable to load your quotations");
                }
            } catch (err) {
                const message = err.message || "Unexpected error while loading quotations";
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchMyQuotations();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center space-y-5">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
                    <p className="text-lg font-medium text-gray-700">Loading your quotations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-10 text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">Error Loading Quotations</h2>
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
                    <div className="flex flex-col gap-6 mb-10">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium w-fit"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>

                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                                My <span className="text-emerald-600">Quotations</span>
                            </h1>
                            <p className="mt-3 text-lg text-gray-600 max-w-3xl">
                                Track every quotation you have submitted to firm requests.
                            </p>
                        </div>
                    </div>

                    {quotations.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">No quotations yet</h3>
                            <p className="text-gray-600 max-w-md mx-auto">
                                You have not submitted any quotations yet. Open pending requests and add your first quotation.
                            </p>
                            <button
                                onClick={() => navigate("/allrequests")}
                                className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition"
                            >
                                Browse Requests
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 font-medium mb-8">
                                Showing {quotations.length} quotation{quotations.length !== 1 ? "s" : ""}
                            </p>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-7">
                                {quotations.map((quotation) => {
                                    const request = quotation.firmRequestId;
                                    const status = (quotation.status || "Pending").toLowerCase();
                                    const statusClass =
                                        status === "accepted"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : status === "rejected"
                                                ? "bg-red-50 text-red-700 border-red-200"
                                                : "bg-amber-50 text-amber-700 border-amber-200";

                                    return (
                                        <div
                                            key={quotation._id}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-300 overflow-hidden"
                                        >
                                            <div className="h-40 bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                                                <span className="text-9xl select-none">🌾</span>
                                            </div>

                                            <div className="p-6">
                                                <div className="flex justify-between items-start gap-4 mb-4">
                                                    <h3 className="font-semibold text-xl text-gray-900 line-clamp-2 leading-tight">
                                                        {request?.cropname || "Firm Request"}
                                                    </h3>
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
                                                        {quotation.status || "Pending"}
                                                    </span>
                                                </div>

                                                <div className="space-y-3.5 text-sm mb-6">
                                                    <div className="flex items-center gap-2.5 text-gray-700">
                                                        <IndianRupee className="h-4 w-4 shrink-0 text-emerald-600" />
                                                        <span>
                                                            Your Rate: <span className="font-medium text-gray-900">₹{Number(quotation.rate || 0).toLocaleString("en-IN")}</span>
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2.5 text-gray-700">
                                                        <Package className="h-4 w-4 shrink-0 text-emerald-600" />
                                                        <span>
                                                            Requirement: <span className="font-medium text-gray-900">{request?.requirement || "-"}</span>
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2.5 text-gray-700">
                                                        <Building className="h-4 w-4 shrink-0 text-emerald-600" />
                                                        <span className="truncate">
                                                            Firm: <span className="font-medium text-gray-900">{request?.firmId?.CompanyName || "-"}</span>
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2.5 text-gray-700">
                                                        <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
                                                        <span className="truncate">
                                                            {request?.firmId?.city || "—"}, {request?.firmId?.state || "—"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2.5 text-gray-700">
                                                        <Clock className="h-4 w-4 shrink-0 text-emerald-600" />
                                                        <span>
                                                            Submitted: <span className="font-medium text-gray-900">{quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2.5 text-gray-700">
                                                        <Calendar className="h-4 w-4 shrink-0 text-emerald-600" />
                                                        <span>
                                                            Deadline: <span className="font-medium text-gray-900">{request?.deadline ? new Date(request.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3.5 w-3.5 text-emerald-600" />
                                                        <span>
                                                            Request Status: <span className="font-medium text-gray-700">{request?.status || "Pending"}</span>
                                                        </span>
                                                    </div>
                                                </div>
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

export default FarmerQuotationsPage;
