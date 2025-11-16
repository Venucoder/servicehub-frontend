'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import Modal from '@/components/common/Modal';
import OrderForm from '@/components/orders/OrderForm';
import {
    ArrowLeft,
    Package,
    MapPin,
    Star,
    TrendingUp,
    CheckCircle2,
    Loader2,
    ShoppingCart,
    Calendar,
    Phone,
    Mail,
    Tag,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ServiceDetail {
    id: string;
    provider: {
        id: string;
        business_name: string;
        business_address: string;
        business_phone: string;
        business_email: string;
        average_rating: string;
        total_ratings: number;
    };
    category: {
        id: string;
        name: string;
        slug: string;
        icon: string;
    };
    name: string;
    description: string;
    pricing_type: string;
    base_price: string;
    subscription_price: string | null;
    unit: string;
    minimum_order: number;
    is_active: boolean;
    is_available: boolean;
    has_stock_tracking: boolean;
    current_stock: number;
    created_at: string;
    updated_at: string;
}

export default function ServiceDetailPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const serviceId = params.id as string;

    const [service, setService] = useState<ServiceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [orderType, setOrderType] = useState<'one_time' | 'subscription'>('subscription');
    const [quantity, setQuantity] = useState(1);
    const [showOrderModal, setShowOrderModal] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated && serviceId) {
            fetchServiceDetail();
        }
    }, [isAuthenticated, serviceId]);

    const fetchServiceDetail = async () => {
        try {
            const response = await api.get(`/services/services/${serviceId}/`);
            setService(response.data);
        } catch (error) {
            console.error('Error fetching service detail:', error);
            toast.error('Failed to load service details');
        } finally {
            setLoading(false);
        }
    };

    const handleOrder = () => {
        // TODO: Implement order/subscription creation
        toast.success('Order feature coming soon!');
    };

    if (authLoading || loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </DashboardLayout>
        );
    }

    if (!service) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Service not found
                    </h3>
                    <Link
                        href="/services"
                        className="text-indigo-600 hover:text-indigo-500"
                    >
                        Back to services
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const totalPrice = orderType === 'subscription'
        ? parseFloat(service.subscription_price || service.base_price)
        : parseFloat(service.base_price) * quantity;

    return (
        <DashboardLayout>
            {/* Back Button */}
            <Link
                href="/services"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Services
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Service Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Service Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Image/Banner */}
                        <div className="h-64 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Package className="w-24 h-24 text-white opacity-50" />
                        </div>

                        {/* Service Info */}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {service.name}
                                    </h1>
                                    <div className="flex items-center space-x-4">
                                        <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium">
                                            <Tag size={14} className="mr-1" />
                                            {service.category.name}
                                        </span>
                                        {service.is_available ? (
                                            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                <CheckCircle2 size={14} className="mr-1" />
                                                Available
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                    Description
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {service.description}
                                </p>
                            </div>

                            {/* Pricing Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* One-time Price */}
                                <div className="p-4 border-2 border-gray-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-600">
                                            One-time Purchase
                                        </span>
                                        <ShoppingCart size={18} className="text-gray-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        ₹{service.base_price}
                                        <span className="text-sm font-normal text-gray-600">
                                            /{service.unit}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Pay per order
                                    </p>
                                </div>

                                {/* Subscription Price */}
                                {service.subscription_price && (
                                    <div className="p-4 border-2 border-green-500 bg-green-50 rounded-lg relative">
                                        <div className="absolute top-2 right-2">
                                            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                                                SAVE ₹{(parseFloat(service.base_price) * 30 - parseFloat(service.subscription_price)).toFixed(0)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-green-700">
                                                Monthly Subscription
                                            </span>
                                            <TrendingUp size={18} className="text-green-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-green-700">
                                            ₹{service.subscription_price}
                                            <span className="text-sm font-normal text-green-600">
                                                /month
                                            </span>
                                        </div>
                                        <p className="text-xs text-green-600 mt-1">
                                            Best value • 30 units
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Service Features */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Service Features
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start space-x-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Quality Assured</p>
                                    <p className="text-sm text-gray-600">Premium quality guaranteed</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">On-time Delivery</p>
                                    <p className="text-sm text-gray-600">Daily delivery at your doorstep</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Flexible Plans</p>
                                    <p className="text-sm text-gray-600">Cancel or pause anytime</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Digital Tracking</p>
                                    <p className="text-sm text-gray-600">Track usage in real-time</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Provider Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Provider Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 text-lg">
                                    {service.provider.business_name}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={`${i < Math.round(parseFloat(service.provider.average_rating))
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {service.provider.average_rating} ({service.provider.total_ratings} reviews)
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Address</p>
                                    <p className="text-sm text-gray-600">
                                        {service.provider.business_address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Phone</p>
                                    <p className="text-sm text-gray-600">
                                        {service.provider.business_phone}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Email</p>
                                    <p className="text-sm text-gray-600">
                                        {service.provider.business_email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Order Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            Place Order
                        </h3>

                        {/* Order Type Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Select Order Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setOrderType('one_time')}
                                    className={`p-4 border-2 rounded-lg transition-all ${orderType === 'one_time'
                                        ? 'border-indigo-600 bg-indigo-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <ShoppingCart
                                        className={`mx-auto mb-2 ${orderType === 'one_time' ? 'text-indigo-600' : 'text-gray-600'
                                            }`}
                                        size={24}
                                    />
                                    <p className="text-sm font-medium text-gray-900">One-time</p>
                                    <p className="text-xs text-gray-600">₹{service.base_price}/{service.unit}</p>
                                </button>

                                {service.subscription_price && (
                                    <button
                                        onClick={() => setOrderType('subscription')}
                                        className={`p-4 border-2 rounded-lg transition-all ${orderType === 'subscription'
                                            ? 'border-green-600 bg-green-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <Calendar
                                            className={`mx-auto mb-2 ${orderType === 'subscription' ? 'text-green-600' : 'text-gray-600'
                                                }`}
                                            size={24}
                                        />
                                        <p className="text-sm font-medium text-gray-900">Subscription</p>
                                        <p className="text-xs text-gray-600">₹{service.subscription_price}/month</p>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quantity (for one-time orders) */}
                        {orderType === 'one_time' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                </label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(service.minimum_order, quantity - 1))}
                                        className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-indigo-600 transition-all text-gray-700 font-bold text-xl"
                                    >
                                        −
                                    </button>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(service.minimum_order, parseInt(e.target.value) || 1))}
                                            className="w-full text-center border-2 border-gray-300 rounded-lg py-3 font-bold text-xl text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none"
                                            min={service.minimum_order}
                                        />
                                        <p className="text-center text-xs text-gray-500 mt-1">
                                            {service.unit}(s)
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-indigo-600 transition-all text-gray-700 font-bold text-xl"
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Minimum order: {service.minimum_order} {service.unit}(s)
                                </p>
                            </div>
                        )}

                        {/* Subscription Details */}
                        {orderType === 'subscription' && (
                            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-2">
                                    Subscription Includes:
                                </h4>
                                <ul className="space-y-2 text-sm text-green-700">
                                    <li className="flex items-center">
                                        <CheckCircle2 size={16} className="mr-2" />
                                        30 units per month
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle2 size={16} className="mr-2" />
                                        Daily delivery
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle2 size={16} className="mr-2" />
                                        Save ₹{(parseFloat(service.base_price) * 30 - parseFloat(service.subscription_price || '0')).toFixed(0)} per month
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle2 size={16} className="mr-2" />
                                        Cancel anytime
                                    </li>
                                </ul>
                            </div>
                        )}

                        {/* Price Summary */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600">
                                    {orderType === 'subscription' ? 'Monthly Price' : 'Subtotal'}
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ₹{totalPrice.toFixed(2)}
                                </span>
                            </div>
                            {orderType === 'subscription' && (
                                <div className="flex items-center justify-between text-sm text-green-600">
                                    <span>You save</span>
                                    <span className="font-semibold">
                                        ₹{(parseFloat(service.base_price) * 30 - parseFloat(service.subscription_price || '0')).toFixed(0)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Order Button */}
                        <button
                            onClick={() => setShowOrderModal(true)}
                            disabled={!service.is_available}
                            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {orderType === 'subscription' ? 'Subscribe Now' : 'Place Order'}
                        </button>

                        {service.has_stock_tracking && service.current_stock > 0 && (
                            <p className="text-xs text-gray-500 text-center mt-3">
                                {service.current_stock} units in stock
                            </p>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Order Modal */}
            <Modal
                isOpen={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                title={orderType === 'subscription' ? 'Create Subscription' : 'Place Order'}
                size="lg"
            >
                <OrderForm
                    service={{
                        id: service.id,
                        name: service.name,
                        base_price: service.base_price,
                        subscription_price: service.subscription_price,
                        unit: service.unit,
                    }}
                    orderType={orderType}
                    quantity={quantity}
                    onSuccess={() => {
                        setShowOrderModal(false);
                        router.push('/orders');
                    }}
                    onCancel={() => setShowOrderModal(false)}
                />
            </Modal>
        </DashboardLayout>
    );
}