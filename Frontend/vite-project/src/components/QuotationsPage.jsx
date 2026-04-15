import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Check,
    Clock,
    FileText,
    IndianRupee,
    Package,
    User,
    X,
} from "lucide-react";
import { AuthContext } from "./AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

const QuotationsPage = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const fetchQuotations = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${BACKEND_URL}/api/quotation/${requestId}`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch quotations");
                }

                const data = await response.json();

                if (data?.success) {
                    const sorted = Array.isArray(data.quotations)
                        ? data.quotations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        : [];
                    setQuotations(sorted);
                } else {
                    throw new Error(data?.message || "Unable to load quotations");
                }
            } catch (err) {
                const message = err.message || "Unexpected error while loading quotations";
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        if (requestId) {
            fetchQuotations();
        }
    }, [requestId]);

    const requestInfo = useMemo(() => {
        if (!quotations.length) return null;
        return quotations[0]?.firmRequestId || null;
    }, [quotations]);

    const updateQuotationStatus = async (quotationId, action) => {
        const confirmMessage =
            action === "accept"
                ? "Are you sure you want to accept this quotation?"
                : "Are you sure you want to reject this quotation?";

        if (!window.confirm(confirmMessage)) return;

        setProcessingId(quotationId);
        try {
            const response = await fetch(`${BACKEND_URL}/api/quotation/${action}/${quotationId}`, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(data?.message || `Unable to ${action} quotation`);
            }

            const nextStatus = action === "accept" ? "Accepted" : "Rejected";
            setQuotations((prev) =>
                prev.map((item) =>
                    item._id === quotationId ? { ...item, status: nextStatus } : item
                )
            );

            toast.success(`Quotation ${action}ed successfully.`);
        } catch (err) {
            toast.error(err.message || `Failed to ${action} quotation.`);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusPill = (status) => {
        const normalized = (status || "Pending").toLowerCase();

        if (normalized === "accepted") {
            return (
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Accepted
                </span>
            );
        }

        if (normalized === "rejected") {
            return (
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
                    Rejected
                </span>
            );
        }

        return (
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                Pending
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center space-y-5">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
                    <p className="text-lg font-medium text-gray-700">Loading quotations...</p>
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
                                Request <span className="text-emerald-600">Quotations</span>
                            </h1>
                            <p className="mt-3 text-lg text-gray-600 max-w-3xl">
                                Review all rates shared by farmers for this request and take action.
                            </p>
                        </div>
                    </div>

                    {requestInfo && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Package className="h-4 w-4 text-emerald-600" />
                                    <span>
                                        Crop: <span className="font-medium text-gray-900">{requestInfo.cropname || "-"}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <FileText className="h-4 w-4 text-emerald-600" />
                                    <span>
                                        Requirement: <span className="font-medium text-gray-900">{requestInfo.requirement || "-"}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Clock className="h-4 w-4 text-emerald-600" />
                                    <span>
                                        Request Status: <span className="font-medium text-gray-900">{requestInfo.status || "Pending"}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar className="h-4 w-4 text-emerald-600" />
                                    <span>
                                        Deadline:{" "}
                                        <span className="font-medium text-gray-900">
                                            {requestInfo.deadline
                                                ? new Date(requestInfo.deadline).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "-"}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {quotations.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">No quotations yet</h3>
                            <p className="text-gray-600 max-w-md mx-auto">
                                Farmers have not submitted quotations for this request yet.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 font-medium mb-8">
                                Showing {quotations.length} quotation{quotations.length !== 1 ? "s" : ""}
                            </p>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-7">
                                {quotations.map((quotation) => {
                                    const status = (quotation.status || "pending").toLowerCase();
                                    const isProcessing = processingId === quotation._id;
                                    const canTakeAction = user?.userType === "firm" && status === "pending";

                                    return (
                                        <div
                                            key={quotation._id}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-300 overflow-hidden"
                                        >
                                            <div className="p-6">
                                                <div className="flex justify-between items-start gap-4 mb-4">
                                                    <h3 className="font-semibold text-xl text-gray-900 leading-tight">
                                                        {quotation.farmerId?.FirstName || "Farmer"} {quotation.farmerId?.LastName || ""}
                                                    </h3>
                                                    {getStatusPill(quotation.status)}
                                                </div>

                                                <div className="space-y-3.5 text-sm mb-6">
                                                    <div className="flex items-center gap-2.5 text-gray-700">
                                                        <IndianRupee className="h-4 w-4 shrink-0 text-emerald-600" />
                                                        <span>
                                                            Quoted Rate:{" "}
                                                            <span className="font-medium text-gray-900">
                                                                ₹{(quotation.rate || 0).toLocaleString("en-IN")}
                                                            </span>
                                                        </span>
                                                    </div>

                                                    {/* <div className="flex items-center gap-2.5 text-gray-700">
                                                        <User className="h-4 w-4 shrink-0 text-emerald-600" />
                                                        <span>
                                                            Farmer ID: <span className="font-medium text-gray-900">{quotation.farmerId?._id || "-"}</span>
                                                        </span>
                                                    </div> */}

                                                    <div className="flex items-center gap-2.5 text-gray-700">
                                                        <Calendar className="h-4 w-4 shrink-0 text-emerald-600" />
                                                        <span>
                                                            Submitted:{" "}
                                                            <span className="font-medium text-gray-900">
                                                                {quotation.createdAt
                                                                    ? new Date(quotation.createdAt).toLocaleDateString("en-IN", {
                                                                        day: "numeric",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    })
                                                                    : "-"}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>

                                                {canTakeAction && (
                                                    <div className="flex gap-4 pt-5 border-t border-gray-100">
                                                        <button
                                                            onClick={() => updateQuotationStatus(quotation._id, "accept")}
                                                            disabled={isProcessing}
                                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${isProcessing
                                                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow"
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
                                                            onClick={() => updateQuotationStatus(quotation._id, "reject")}
                                                            disabled={isProcessing}
                                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${isProcessing
                                                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                                    : "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow"
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

export default QuotationsPage;