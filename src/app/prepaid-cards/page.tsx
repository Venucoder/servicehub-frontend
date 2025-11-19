'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CreditCard, Loader2, Package } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { PrepaidCardListItem } from '@/types';

export default function PrepaidCardsPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [cards, setCards] = useState<PrepaidCardListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCards();
        }
    }, [isAuthenticated]);

    const fetchCards = async () => {
        try {
            const response = await api.get('/services/prepaid-cards/');
            const data = Array.isArray(response.data) ? response.data : response.data.results || [];
            setCards(data);
        } catch (error) {
            console.error('Error fetching prepaid cards:', error);
            toast.error('Failed to load prepaid cards');
        } finally {
            setLoading(false);
        }
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Prepaid Cards</h1>
                <p className="text-gray-600 mt-2">
                    Manage your prepaid cards and track usage
                </p>
            </div>

            {cards.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No prepaid cards yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Buy prepaid cards to save money and use services anytime
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
                    {cards.map((card) => {
                        const usedPercentage = (parseFloat(card.used_units) / parseFloat(card.total_units)) * 100;
                        
                        return (
                            <div
                                key={card.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => router.push(`/prepaid-cards/${card.id}`)}
                            >
                                <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4 text-white">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-xl font-bold">{card.service_name}</h3>
                                            <p className="text-green-100 text-sm">{card.card_name}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            card.status === 'active' ? 'bg-green-200 text-green-800' :
                                            card.status === 'exhausted' ? 'bg-gray-200 text-gray-800' :
                                            'bg-red-200 text-red-800'
                                        }`}>
                                            {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span>Balance</span>
                                            <span className="font-semibold">
                                                {card.remaining_units} / {card.total_units} units
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/30 rounded-full h-2.5">
                                            <div
                                                className="bg-white rounded-full h-2.5 transition-all"
                                                style={{ width: `${100 - usedPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Purchased</span>
                                        <span className="text-gray-900">
                                            {new Date(card.purchased_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {card.last_used_at && (
                                        <div className="flex items-center justify-between text-sm mt-2">
                                            <span className="text-gray-600">Last Used</span>
                                            <span className="text-gray-900">
                                                {new Date(card.last_used_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}