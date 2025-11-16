'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import api from '@/lib/api';

interface DashboardStats {
  active_subscriptions: number;
  total_orders: number;
  total_spent: number;
  pending_orders: number;
}

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated]);

  const fetchDashboardStats = async () => {
    try {
      // TODO: Replace with actual API endpoints when implemented
      // For now, using mock data
      setStats({
        active_subscriptions: 3,
        total_orders: 12,
        total_spent: 850,
        pending_orders: 2,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.first_name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your services today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Subscriptions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Subscriptions
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.active_subscriptions || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp size={16} className="mr-1" />
            <span>All active</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.total_orders || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <Clock size={16} className="mr-1" />
            <span>{stats?.pending_orders || 0} pending</span>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ₹{stats?.total_spent || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span>This month</span>
          </div>
        </div>

        {/* Savings */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-100">
                You Saved
              </p>
              <p className="text-3xl font-bold mt-2">₹90</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-indigo-100">
            With subscriptions vs regular price
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Activity Item 1 */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Water bottle delivered
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    20L Mineral Water • 2 hours ago
                  </p>
                </div>
                <span className="text-xs text-gray-500">Today</span>
              </div>

              {/* Activity Item 2 */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Subscription renewed
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Monthly Water Subscription • Yesterday
                  </p>
                </div>
                <span className="text-xs text-gray-500">1d ago</span>
              </div>

              {/* Activity Item 3 */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Order placed
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Fresh Milk 2L • 2 days ago
                  </p>
                </div>
                <span className="text-xs text-gray-500">2d ago</span>
              </div>

              {/* Activity Item 4 */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Payment successful
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ₹210 • Water Subscription
                  </p>
                </div>
                <span className="text-xs text-gray-500">3d ago</span>
              </div>
            </div>

            <Link
              href="/orders"
              className="mt-6 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all activity
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <Link
              href="/services"
              className="block w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center font-medium"
            >
              Browse Services
            </Link>
            <Link
              href="/subscriptions"
              className="block w-full px-4 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-center font-medium"
            >
              My Subscriptions
            </Link>
            <Link
              href="/orders"
              className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
            >
              View Orders
            </Link>
          </div>

          {/* Active Subscriptions Preview */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Active Subscriptions
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Water (20L)
                  </p>
                  <p className="text-xs text-gray-500">15/30 units used</p>
                </div>
                <span className="text-xs font-medium text-green-600">Active</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Fresh Milk
                  </p>
                  <p className="text-xs text-gray-500">22/30 units used</p>
                </div>
                <span className="text-xs font-medium text-yellow-600">
                  Expiring soon
                </span>
              </div>
            </div>

            <Link
              href="/subscriptions"
              className="mt-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}