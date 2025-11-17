'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { extractPaginatedData } from '@/utils/api-helpers';
import {
    Package,
    Calendar,
    MapPin,
    Play,
    Pause,
    XCircle,
    Loader2,
    TrendingUp,
    CheckCircle2,
    Clock,
    QrCode,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { SubscriptionListItem, Subscription } from '@/types';

export default function SubscriptionsPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<SubscriptionListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchSubscriptions();
        }
    }, [isAuthenticated]);

    const fetchSubscriptions = async () => {
        try {
            const response = await api.get('/services/subscriptions/');
            const data = extractPaginatedData<SubscriptionListItem>(response.data);
            setSubscriptions(data);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            toast.error('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubscriptionDetails = async (id: string) => {
        try {
            const response = await api.get(`/services/subscriptions/${id}/`);
            setSelectedSubscription(response.data);
            setShowDetailsModal(true);
        } catch (error) {
            console.error('Error fetching subscription details:', error);
            toast.error('Failed to load subscription details');
        }
    };

    const handlePause = async (id: string) => {
        try {
            await api.post(`/services/subscriptions/${id}/pause/`);
            toast.success('Subscription paused successfully');
            fetchSubscriptions();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to pause subscription');
        }
    };

    const handleResume = async (id: string) => {
        try {
            await api.post(`/services/subscriptions/${id}/resume/`);
            toast.success('Subscription resumed successfully');
            fetchSubscriptions();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to resume subscription');
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this subscription? Unused units will be forfeited.')) {
            return;
        }

        try {
            await api.post(`/services/subscriptions/${id}/cancel/`);
            toast.success('Subscription cancelled successfully');
            fetchSubscriptions();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to cancel subscription');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            active: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
            paused: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Pause },
            completed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle2 },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
        };

        const badge = badges[status as keyof typeof badges] || badges.active;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
                <Icon size={14} className="mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getProgressPercentage = (used: number, total: number) => {
        return Math.round((used / total) * 100);
    };

    if (isLoading || loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Subscriptions</h1>
                <p className="text-gray-600 mt-2">
                    Manage your active subscriptions and track usage
                </p>
            </div>

            {/* Subscriptions List */}
            {subscriptions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No subscriptions yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Start subscribing to services to see them here
                    </p>
                    <button
                        onClick={() => router.push('/services')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Browse Services
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {subscriptions.map((subscription) => (
                        <div
                            key={subscription.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-xl font-bold">{subscription.service_name}</h3>
                                        <p className="text-indigo-100 text-sm">{subscription.package_name}</p>
                                    </div>
                                    {getStatusBadge(subscription.status)}
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span>Units Used</span>
                                        <span className="font-semibold">
                                            {subscription.used_units} / {subscription.total_units}
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/30 rounded-full h-2.5">
                                        <div
                                            className="bg-white rounded-full h-2.5 transition-all"
                                            style={{
                                                width: `${getProgressPercentage(
                                                    subscription.used_units,
                                                    subscription.total_units
                                                )}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-4">
                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Remaining Units</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {subscription.remaining_units}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Delivery Type</p>
                                        <p className="text-sm font-medium text-gray-900 capitalize">
                                            {subscription.delivery_type === 'self_pickup' ? (
                                                <span className="flex items-center">
                                                    <Package size={14} className="mr-1" />
                                                    Self Pickup
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    <MapPin size={14} className="mr-1" />
                                                    Auto Delivery
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Started Date */}
                                <div className="flex items-center text-sm text-gray-600 mb-4">
                                    <Calendar size={14} className="mr-2" />
                                    Started {new Date(subscription.created_at).toLocaleDateString()}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => fetchSubscriptionDetails(subscription.id)}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                    >
                                        View Details
                                    </button>

                                    {subscription.status === 'active' && (
                                        <>
                                            <button
                                                onClick={() => handlePause(subscription.id)}
                                                className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                                                title="Pause Subscription"
                                            >
                                                <Pause size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleCancel(subscription.id)}
                                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                title="Cancel Subscription"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </>
                                    )}

                                    {subscription.status === 'paused' && (
                                        <button
                                            onClick={() => handleResume(subscription.id)}
                                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                            title="Resume Subscription"
                                        >
                                            <Play size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Subscription Details Modal */}
            {showDetailsModal && selectedSubscription && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowDetailsModal(false)}
                    ></div>

                    <div className="flex min-h-full items-center justify-center p-4">
                        <div
                            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Subscription Details
                                </h3>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Service Info */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Service Information</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Service:</span>
                                            <span className="font-medium">{selectedSubscription.package.service_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Package:</span>
                                            <span className="font-medium">{selectedSubscription.package.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Amount:</span>
                                            <span className="font-bold text-indigo-600">₹{selectedSubscription.total_amount}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Usage Stats */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Usage Statistics</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                                            <p className="text-sm text-blue-600 mb-1">Total Units</p>
                                            <p className="text-2xl font-bold text-blue-700">
                                                {selectedSubscription.total_units}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg text-center">
                                            <p className="text-sm text-green-600 mb-1">Used</p>
                                            <p className="text-2xl font-bold text-green-700">
                                                {selectedSubscription.used_units}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                                            <p className="text-sm text-purple-600 mb-1">Remaining</p>
                                            <p className="text-2xl font-bold text-purple-700">
                                                {selectedSubscription.remaining_units}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                {selectedSubscription.delivery_type === 'auto_delivery' && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Delivery Information</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Address</p>
                                                <p className="text-gray-900">{selectedSubscription.delivery_address}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Preferred Time</p>
                                                <p className="text-gray-900">{selectedSubscription.preferred_time}</p>
                                            </div>
                                            {selectedSubscription.delivery_days && selectedSubscription.delivery_days.length > 0 && (
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-2">Delivery Days</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedSubscription.delivery_days.map((day) => (
                                                            <span
                                                                key={day}
                                                                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm capitalize"
                                                            >
                                                                {day}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* QR Code for Self Pickup */}
                                {selectedSubscription.delivery_type === 'self_pickup' && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg text-center">
                                        <QrCode className="w-12 h-12 mx-auto text-indigo-600 mb-3" />
                                        <h4 className="font-semibold text-gray-900 mb-2">Digital Subscription Card</h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Show this to the provider when picking up
                                        </p>
                                        <div className="bg-white p-4 rounded-lg inline-block">
                                            <p className="text-xs text-gray-500 mb-1">Subscription ID</p>
                                            <p className="font-mono text-lg font-bold text-gray-900">
                                                {selectedSubscription.id.slice(0, 8).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}