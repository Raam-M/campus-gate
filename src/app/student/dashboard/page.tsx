'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
  const [user] = useState({
    name: 'John Doe',
    id: 'CS21B1001',
    email: 'john.doe@iith.ac.in'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-indigo-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Vis-IITH
              </h1>
              <span className="text-gray-300">|</span>
              <span className="text-lg font-semibold text-gray-700">Student Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.id}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <Link 
                href="/" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user.name.split(' ')[0]}!
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Manage your visitor requests and track your campus visits from the options below.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* New Request */}
          <Link href="/student/dashboard/new-request">
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 border border-indigo-100 overflow-hidden">
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-300 shadow-lg">
                    <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">New Request</h3>
                  <p className="text-gray-600 mb-6">
                    Create a new visitor request for family or friends visiting campus
                  </p>
                  <div className="text-indigo-600 font-bold text-lg group-hover:text-indigo-700 transition-colors">
                    Create Request →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Currently Active Requests */}
          <Link href="/student/dashboard/active-requests">
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 border border-green-100 overflow-hidden">
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300 shadow-lg">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Currently Active</h3>
                  <p className="text-gray-600 mb-6">
                    View and manage your pending and approved visitor requests
                  </p>
                  <div className="text-green-600 font-bold text-lg group-hover:text-green-700 transition-colors">
                    View Active →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Recent History */}
          <Link href="/student/dashboard/history">
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 border border-blue-100 overflow-hidden">
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-blue-200 group-hover:to-cyan-200 transition-all duration-300 shadow-lg">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Recent History</h3>
                  <p className="text-gray-600 mb-6">
                    Browse through your past visitor requests and completed visits
                  </p>
                  <div className="text-blue-600 font-bold text-lg group-hover:text-blue-700 transition-colors">
                    View History →
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Info Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto border border-indigo-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about the visitor management process, please contact the administration office.
            </p>
            <div className="flex justify-center space-x-4">
              <a href="mailto:admin@iith.ac.in" className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors border border-indigo-200">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
