'use client';

import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface ReportData {
  overview: {
    totalRequests: number;
    approvedRequests: number;
    pendingRequests: number;
    rejectedRequests: number;
    averageProcessingTime: number;
    requestsThisMonth: number;
    requestsLastMonth: number;
    growthRate: number;
  };
  users: {
    totalUsers: number;
    totalStudents: number;
    totalAdmins: number;
    activeUsersThisMonth: number;
    newUsersThisMonth: number;
  };
  visitors: {
    totalVisitors: number;
    averageVisitorsPerRequest: number;
    visitorsThisMonth: number;
    visitorsLastMonth: number;
    mostCommonPurpose: string;
    mostCommonDuration: string;
  };
  trends: {
    dailyRequests: Array<{ date: string; count: number }>;
    monthlyRequests: Array<{ month: string; count: number }>;
    statusDistribution: Array<{ status: string; count: number; percentage: number }>;
    purposeDistribution: Array<{ purpose: string; count: number; percentage: number }>;
  };
}

export default function AdminReports() {
  const { user, logout } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  // If user is not authenticated or not admin, show loading or redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const response = await fetch('/api/admin/reports', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data.data);
      } else {
        setError('Failed to fetch report data');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'yet_to_verify':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'requests', label: 'Requests', icon: '📋' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'visitors', label: 'Visitors', icon: '🚶' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                Vis-IITH
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-lg font-semibold text-gray-700">Reports & Analytics</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/';
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h2>
          <p className="text-gray-600">
            Comprehensive insights and analytics for the visitor management system.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : reportData ? (
          <>
            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Requests</p>
                        <p className="text-3xl font-bold text-gray-900">{reportData.overview.totalRequests}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📋</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className={`text-sm font-medium ${reportData.overview.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(reportData.overview.growthRate)}
                      </span>
                      <span className="text-sm text-gray-600"> from last month</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {reportData.overview.totalRequests > 0
                            ? Math.round((reportData.overview.approvedRequests / reportData.overview.totalRequests) * 100)
                            : 0}%
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">✅</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-sm text-gray-600">
                        {reportData.overview.approvedRequests} of {reportData.overview.totalRequests} approved
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg. Processing Time</p>
                        <p className="text-3xl font-bold text-gray-900">{reportData.overview.averageProcessingTime}h</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">⏱️</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-sm text-gray-600">Average time to process</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900">{reportData.users.totalUsers}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">👥</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-sm text-green-600 font-medium">
                        +{reportData.users.newUsersThisMonth}
                      </span>
                      <span className="text-sm text-gray-600"> new this month</span>
                    </div>
                  </div>
                </div>

                {/* Request Status Distribution */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Status Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reportData.trends.statusDistribution.map((item) => (
                      <div key={item.status} className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
                          {item.status === 'APPROVED' && '✅'}
                          {item.status === 'PENDING' && '⏳'}
                          {item.status === 'REJECTED' && '❌'}
                          {item.status === 'YET_TO_VERIFY' && '📋'}
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                        <p className="text-sm text-gray-600 capitalize">{item.status.replace('_', ' ').toLowerCase()}</p>
                        <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Trends */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Request Trends</h3>
                    <div className="space-y-3">
                      {reportData.trends.monthlyRequests.slice(-6).map((item, index) => (
                        <div key={item.month} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{item.month}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.max(10, (item.count / Math.max(...reportData.trends.monthlyRequests.map(m => m.count))) * 100)}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Purpose Distribution */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Purpose Distribution</h3>
                    <div className="space-y-3">
                      {reportData.trends.purposeDistribution.slice(0, 5).map((item) => (
                        <div key={item.purpose} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{item.purpose}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-teal-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.max(10, item.percentage)}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-12 text-right">{item.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Request Activity (Last 7 Days)</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {reportData.trends.dailyRequests.slice(-7).map((item, index) => (
                      <div key={item.date} className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="relative h-20 bg-gray-100 rounded flex items-end">
                          <div
                            className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded"
                            style={{
                              height: `${Math.max(8, (item.count / Math.max(...reportData.trends.dailyRequests.slice(-7).map(d => d.count))) * 100)}%`
                            }}
                          ></div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mt-1">{item.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                        <p className="text-3xl font-bold text-blue-600">{reportData.users.totalStudents}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🎓</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Admins</p>
                        <p className="text-3xl font-bold text-red-600">{reportData.users.totalAdmins}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">👨‍💼</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active This Month</p>
                        <p className="text-3xl font-bold text-green-600">{reportData.users.activeUsersThisMonth}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📈</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">User Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Students</span>
                          <span className="text-sm font-medium">{((reportData.users.totalStudents / reportData.users.totalUsers) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Admins</span>
                          <span className="text-sm font-medium">{((reportData.users.totalAdmins / reportData.users.totalUsers) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Growth Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">New users this month</span>
                          <span className="text-sm font-medium text-green-600">+{reportData.users.newUsersThisMonth}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Active users this month</span>
                          <span className="text-sm font-medium">{reportData.users.activeUsersThisMonth}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Visitors Tab */}
            {activeTab === 'visitors' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                        <p className="text-3xl font-bold text-purple-600">{reportData.visitors.totalVisitors}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">👥</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg. per Request</p>
                        <p className="text-3xl font-bold text-indigo-600">{reportData.visitors.averageVisitorsPerRequest.toFixed(1)}</p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">This Month</p>
                        <p className="text-3xl font-bold text-teal-600">{reportData.visitors.visitorsThisMonth}</p>
                      </div>
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📅</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className={`text-sm font-medium ${
                        reportData.visitors.visitorsThisMonth >= reportData.visitors.visitorsLastMonth 
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {reportData.visitors.visitorsThisMonth >= reportData.visitors.visitorsLastMonth ? '+' : ''}
                        {reportData.visitors.visitorsThisMonth - reportData.visitors.visitorsLastMonth}
                      </span>
                      <span className="text-sm text-gray-600"> from last month</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Visit Patterns</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Most Common Purpose</span>
                          <span className="text-sm text-gray-500">Top choice</span>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <span className="text-gray-900 font-medium capitalize">{reportData.visitors.mostCommonPurpose}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Most Common Duration</span>
                          <span className="text-sm text-gray-500">Typical stay</span>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <span className="text-gray-900 font-medium">{reportData.visitors.mostCommonDuration}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitor Trends</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Average visitors per request</span>
                        <span className="text-lg font-semibold text-gray-900">{reportData.visitors.averageVisitorsPerRequest.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total visitors this month</span>
                        <span className="text-lg font-semibold text-gray-900">{reportData.visitors.visitorsThisMonth}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Monthly growth</span>
                        <span className={`text-lg font-semibold ${
                          reportData.visitors.visitorsThisMonth >= reportData.visitors.visitorsLastMonth 
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {reportData.visitors.visitorsLastMonth > 0
                            ? formatPercentage(((reportData.visitors.visitorsThisMonth - reportData.visitors.visitorsLastMonth) / reportData.visitors.visitorsLastMonth) * 100)
                            : '+100%'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No data available</div>
          </div>
        )}
      </main>
    </div>
  );
}
