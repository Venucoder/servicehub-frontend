'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import Modal from '@/components/common/Modal';
import PrepaidCardForm from '@/components/prepaid-cards/PrepaidCardForm';
import OrderForm from '@/components/orders/OrderForm';
import {
    ArrowLeft,
    Package,
    MapPin,
    Star,
    CheckCircle2,
    Loader2,
    ShoppingCart,
    Calendar,
    Phone,
    Mail,
    Tag,
    Clock,
    Zap,
    CreditCard,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Service, PrepaidCardOption } from '@/types';

export default function ServiceDetailPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const serviceId = params.id as string;

    const [service, setService] = useState<Service | null>(null);
    const [cardOptions, setCardOptions] = useState<PrepaidCardOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMode, setSelectedMode] = useState<'one_time' | 'prepaid_card'>('one_time');
    const [quantity, setQuantity] = useState(1);
    const [selectedQuantityOption, setSelectedQuantityOption] = useState<string>('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated && serviceId) {
            fetchServiceDetail();
            fetchPrepaidCardOptions();
        }
    }, [isAuthenticated, serviceId]);

    const fetchServiceDetail = async () => {
        try {
            const response = await api.get(`/services/services/${serviceId}/`);
            setService(response.data);
            
            // Set default quantity option if available
            if (response.data.quantity_options && response.data.quantity_options.length > 0) {
                setSelectedQuantityOption(response.data.quantity_options[0].label);
                setQuantity(response.data.quantity_options[0].value);
            }
        } catch (error) {
            console.error('Error fetching service detail:', error);
            toast.error('Failed to load service details');
        } finally {
            setLoading(false);
        }
    };

    const fetchPrepaidCardOptions = async () => {
        try {
            const response = await api.get(`/services/services/${serviceId}/prepaid_card_options/`);
            const options = Array.isArray(response.data) ? response.data : response.data.results || [];
            setCardOptions(options);
        } catch (error) {
            console.error('Error fetching prepaid card options:', error);
        }
    };

    const handleModeChange = (mode: 'one_time' | 'prepaid_card') => {
        setSelectedMode(mode);
    };

    const handleQuantityOptionChange = (option: any) => {
        setSelectedQuantityOption(option.label);
        setQuantity(option.value);
    };

    const handleProceed = () => {
        if (selectedMode === 'prepaid_card' && cardOptions.length === 0) {
            toast.error('No prepaid card options available');
            return;
        }
        setShowModal(true);
    };

    const isServiceOpen = () => {
        if (!service) return false;
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [startHour, startMin] = service.business_hours_start.split(':').map(Number);
        const [endHour, endMin] = service.business_hours_end.split(':').map(Number);
        
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;
        
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = daysOfWeek[now.getDay()];
        
        const isDayOpen = service.operating_days.includes(currentDay);
        const isTimeOpen = currentTime >= startTime && currentTime <= endTime;
        
        return isDayOpen && isTimeOpen;
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Service not found</h3>
                    <Link href="/services" className="text-indigo-600 hover:text-indigo-500">
                        Back to services
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const serviceOpen = isServiceOpen();
    const canOrderImmediate = service.supports_immediate_delivery && serviceOpen;
    const hasPrepaidCards = service.supports_prepaid_cards && cardOptions.length > 0;

    return (
        <DashboardLayout>
            <Link href="/services" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={20} className="mr-2" />
                Back to Services
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Service Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Service Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="h-64 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Package className="w-24 h-24 text-white opacity-50" />
                        </div>

                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
                                    <div className="flex items-center space-x-4 flex-wrap gap-2">
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
                                        {canOrderImmediate && (
                                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                <Zap size={14} className="mr-1" />
                                                Open Now
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-600 leading-relaxed">{service.description}</p>
                            </div>

                            {/* Pricing */}
                            <div className="p-4 bg-gray-50 rounded-lg mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">One-time Price</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ₹{service.base_price}
                                            <span className="text-sm font-normal text-gray-600">/{service.unit}</span>
                                        </p>
                                    </div>
                                    <ShoppingCart className="text-gray-400" size={24} />
                                </div>
                            </div>

                            {/* Prepaid Card Options */}
                            {hasPrepaidCards && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Prepaid Card Options</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {cardOptions.map((option) => {
                                            const savings = parseFloat(option.savings);
                                            
                                            return (
                                                <div
                                                    key={option.id}
                                                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-all cursor-pointer relative"
                                                >
                                                    {savings > 0 && (
                                                        <div className="absolute top-2 right-2">
                                                            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                                                                SAVE ₹{savings.toFixed(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <h4 className="font-semibold text-gray-900 mb-2">{option.name}</h4>
                                                    <div className="text-2xl font-bold text-green-600 mb-2">₹{option.price}</div>
                                                    <p className="text-sm text-gray-600 mb-1">{option.total_units} units</p>
                                                    <p className="text-xs text-gray-500">
                                                        ₹{parseFloat(option.price_per_unit).toFixed(2)} per unit
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                                        <strong>💡 How it works:</strong> Buy units upfront at a discount, use them at your own pace. 
                                        No expiry! Visit shop anytime and show your digital card.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Business Hours */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Business Hours</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-4 text-gray-600">
                                <Clock size={20} />
                                <span>
                                    {service.business_hours_start} - {service.business_hours_end}
                                </span>
                                {serviceOpen ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        Open Now
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                        Closed
                                    </span>
                                )}
                            </div>
                            {service.operating_days && service.operating_days.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {service.operating_days.map((day: string) => (
                                        <span
                                            key={day}
                                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm capitalize"
                                        >
                                            {day}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Provider Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Provider Information</h3>
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
                                                className={`${
                                                    i < Math.round(parseFloat(service.provider.average_rating))
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
                                    <p className="text-sm text-gray-600">{service.provider.business_address}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Phone</p>
                                    <p className="text-sm text-gray-600">{service.provider.business_phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Email</p>
                                    <p className="text-sm text-gray-600">{service.provider.business_email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Purchase Options */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Get Started</h3>

                        {/* Mode Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Choose Option</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleModeChange('one_time')}
                                    className={`p-4 border-2 rounded-lg transition-all ${
                                        selectedMode === 'one_time'
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <ShoppingCart
                                        className={`mx-auto mb-2 ${
                                            selectedMode === 'one_time' ? 'text-indigo-600' : 'text-gray-600'
                                        }`}
                                        size={24}
                                    />
                                    <p className="text-sm font-medium text-gray-900">One-time</p>
                                    <p className="text-xs text-gray-600">Buy now</p>
                                </button>

                                {hasPrepaidCards && (
                                    <button
                                        onClick={() => handleModeChange('prepaid_card')}
                                        className={`p-4 border-2 rounded-lg transition-all ${
                                            selectedMode === 'prepaid_card'
                                                ? 'border-green-600 bg-green-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <CreditCard
                                            className={`mx-auto mb-2 ${
                                                selectedMode === 'prepaid_card' ? 'text-green-600' : 'text-gray-600'
                                            }`}
                                            size={24}
                                        />
                                        <p className="text-sm font-medium text-gray-900">Prepaid Card</p>
                                        <p className="text-xs text-gray-600">Save more</p>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* One-time: Quantity Selector */}
                        {selectedMode === 'one_time' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Quantity</label>
                                {service.quantity_options && service.quantity_options.length > 0 ? (
                                    <select
                                        value={selectedQuantityOption}
                                        onChange={(e) => {
                                            const option = service.quantity_options.find(o => o.label === e.target.value);
                                            if (option) handleQuantityOptionChange(option);
                                        }}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none text-gray-900"
                                    >
                                        {service.quantity_options.map((option) => (
                                            <option key={option.label} value={option.label}>
                                                {option.label} - ₹{option.price}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
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
                                                onChange={(e) =>
                                                    setQuantity(Math.max(service.minimum_order, parseInt(e.target.value) || 1))
                                                }
                                                className="w-full text-center border-2 border-gray-300 rounded-lg py-3 font-bold text-xl text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none"
                                                min={service.minimum_order}
                                            />
                                            <p className="text-center text-xs text-gray-500 mt-1">{service.unit}(s)</p>
                                        </div>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-indigo-600 transition-all text-gray-700 font-bold text-xl"
                                        >
                                            +
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Prepaid Card: Show best option */}
                        {selectedMode === 'prepaid_card' && cardOptions.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Prepaid Cards Available</label>
                                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                                    <p className="text-sm font-semibold text-green-900 mb-1">
                                        {cardOptions.length} option{cardOptions.length > 1 ? 's' : ''} available
                                    </p>
                                    <p className="text-xs text-green-700">
                                        Click proceed to select your preferred card
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Price Summary */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">
                                    {selectedMode === 'one_time' ? 'Total' : 'Starting from'}
                                </span>
                                <span className="font-bold text-indigo-600 text-2xl">
                                    ₹
                                    {selectedMode === 'one_time'
                                        ? (parseFloat(service.base_price) * quantity).toFixed(2)
                                        : cardOptions[0]?.price || '0'}
                                </span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleProceed}
                            disabled={!service.is_available}
                            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {selectedMode === 'prepaid_card' ? 'Buy Prepaid Card' : 'Place Order'}
                        </button>

                        {service.has_stock_tracking && service.current_stock > 0 && (
                            <p className="text-xs text-gray-500 text-center mt-3">
                                {service.current_stock} units in stock
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedMode === 'prepaid_card' ? 'Buy Prepaid Card' : 'Place Order'}
                size="lg"
            >
                {selectedMode === 'prepaid_card' ? (
                    <PrepaidCardForm
                        options={cardOptions}
                        serviceName={service.name}
                        onSuccess={() => {
                            setShowModal(false);
                            router.push('/prepaid-cards');
                        }}
                        onCancel={() => setShowModal(false)}
                    />
                ) : (
                    <OrderForm
                        service={{
                            id: service.id,
                            name: service.name,
                            base_price: service.base_price,
                            unit: service.unit,
                            supports_immediate_delivery: service.supports_immediate_delivery,
                        }}
                        quantity={quantity}
                        quantityLabel={selectedQuantityOption || `${quantity} ${service.unit}`}
                        onSuccess={() => {
                            setShowModal(false);
                            router.push('/orders');
                        }}
                        onCancel={() => setShowModal(false)}
                    />
                )}
            </Modal>
        </DashboardLayout>
    );
}