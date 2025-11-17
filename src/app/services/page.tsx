// src/app/services/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { extractPaginatedData } from '@/utils/api-helpers';
import Link from 'next/link';
import {
    Search,
    Filter,
    Grid3x3,
    List,
    Loader2,
    Star,
    MapPin,
    Package,
    TrendingUp,
    Tag,
} from 'lucide-react';
import api from '@/lib/api';
import { ServiceListItem, ServiceCategory, SubscriptionPackage } from '@/types';

interface ServiceWithPackages extends ServiceListItem {
    packages?: SubscriptionPackage[];
}

export default function ServicesPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [services, setServices] = useState<ServiceWithPackages[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('name');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCategories();
            fetchServices();
        }
    }, [isAuthenticated]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/services/categories/');
            const data = extractPaginatedData<ServiceCategory>(response.data);
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await api.get('/services/services/');
            const servicesData = extractPaginatedData<ServiceListItem>(response.data);
            
            // Fetch packages for each service
            const servicesWithPackages = await Promise.all(
                servicesData.map(async (service) => {
                    try {
                        const packagesResponse = await api.get(`/services/services/${service.id}/packages/`);
                        const packages = Array.isArray(packagesResponse.data) 
                            ? packagesResponse.data 
                            : packagesResponse.data.results || [];
                        return { ...service, packages };
                    } catch (error) {
                        return { ...service, packages: [] };
                    }
                })
            );
            
            setServices(servicesWithPackages);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = services
        .filter((service) => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    service.name.toLowerCase().includes(query) ||
                    service.provider_name.toLowerCase().includes(query) ||
                    service.category_name.toLowerCase().includes(query)
                );
            }
            return true;
        })
        .filter((service) => {
            if (selectedCategory !== 'all') {
                return service.category_name === selectedCategory;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'price-low') {
                return parseFloat(a.base_price) - parseFloat(b.base_price);
            } else if (sortBy === 'price-high') {
                return parseFloat(b.base_price) - parseFloat(a.base_price);
            } else {
                return a.name.localeCompare(b.name);
            }
        });

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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Browse Services</h1>
                <p className="text-gray-600 mt-2">
                    Discover and subscribe to local services in your area
                </p>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search services, providers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white text-gray-900"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white text-gray-900"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>

                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${
                                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Grid3x3 size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${
                                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    Showing {filteredServices.length} of {services.length} services
                </div>
            </div>

            {/* Services Grid/List */}
            {filteredServices.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {filteredServices.map((service) => (
                        <ServiceCard key={service.id} service={service} viewMode={viewMode} />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

function ServiceCard({ service, viewMode }: { service: ServiceWithPackages; viewMode: 'grid' | 'list' }) {
    const hasPackages = service.packages && service.packages.length > 0;
    const bestPackage = hasPackages && service.packages
        ? service.packages.reduce((best, pkg) => 
            parseFloat(pkg.savings) > parseFloat(best.savings) ? pkg : best
          )
        : null;

    if (viewMode === 'list') {
        return (
            <Link href={`/services/${service.id}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                                {service.is_available ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                        Available
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center">
                                    <MapPin size={16} className="mr-1" />
                                    {service.provider_name}
                                </span>
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                                    {service.category_name}
                                </span>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div>
                                    <span className="text-sm text-gray-600">One-time: </span>
                                    <span className="text-lg font-bold text-gray-900">₹{service.base_price}</span>
                                    <span className="text-sm text-gray-600">/{service.unit}</span>
                                </div>
                                {bestPackage && (
                                    <div className="flex items-center px-3 py-1 bg-green-50 rounded-lg">
                                        <TrendingUp size={16} className="text-green-600 mr-1" />
                                        <span className="text-sm font-medium text-green-600">
                                            Save ₹{parseFloat(bestPackage.savings).toFixed(0)} with subscription
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button className="ml-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                            View Details
                        </button>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/services/${service.id}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
                    <Package className="w-16 h-16 text-white opacity-50" />
                    {bestPackage && parseFloat(bestPackage.savings) > 0 && (
                        <div className="absolute top-4 right-4">
                            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                SAVE ₹{parseFloat(bestPackage.savings).toFixed(0)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900 flex-1">{service.name}</h3>
                        {service.is_available ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                Available
                            </span>
                        ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                Out of Stock
                            </span>
                        )}
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin size={14} className="mr-1" />
                        {service.provider_name}
                    </div>

                    <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium mb-4 w-fit">
                        {service.category_name}
                    </span>

                    <div className="mt-auto">
                        <div className="mb-3">
                            <span className="text-sm text-gray-600">One-time: </span>
                            <span className="text-xl font-bold text-gray-900">₹{service.base_price}</span>
                            <span className="text-sm text-gray-600">/{service.unit}</span>
                        </div>

                        {hasPackages && service.packages && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-green-600 font-medium">SUBSCRIPTION</p>
                                        <p className="text-sm text-gray-900">
                                            {service.packages.length} package{service.packages.length > 1 ? 's' : ''} available
                                        </p>
                                    </div>
                                    <TrendingUp className="text-green-600" size={20} />
                                </div>
                            </div>
                        )}

                        <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}