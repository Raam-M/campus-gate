'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface VerificationResult {
  valid: boolean;
  error?: string;
  request?: {
    id: number;
    visitorName: string;
    mobile: string;
    purpose: string;
    visitDate: string;
    visitTime: string;
    additionalVisitors: number;
    vehicleType: string;
    vehicleNo: string | null;
    guestHouse: boolean;
    visitors: Array<{ name: string; relationship: string }>;
    requestedBy: {
      name: string;
      email: string;
    };
    createdAt: string;
    approvedAt: string;
  };
}

export default function QRVerifyPage() {
  const [qrId, setQrId] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  // Parse QR code from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const qrParam = urlParams.get('qr');
    if (qrParam) {
      setQrId(qrParam);
      verifyQR(qrParam);
    }
  }, []);

  const verifyQR = async (qrCode?: string) => {
    const codeToVerify = qrCode || qrId;
    if (!codeToVerify.trim()) {
      setResult({ valid: false, error: 'Please enter a QR code' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/verify-qr?qr=${encodeURIComponent(codeToVerify)}`, {
        credentials: 'include'
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Verification error:', error);
      setResult({ 
        valid: false, 
        error: 'Failed to verify QR code. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!result?.request?.id) return;

    try {
      const response = await fetch('/api/verify-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          qrId: qrId,
          action: 'checkin'
        })
      });

      if (response.ok) {
        alert('Visitor checked in successfully!');
      } else {
        alert('Failed to check in visitor');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Failed to check in visitor');
    }
  };

  const handleCheckOut = async () => {
    if (!result?.request?.id) return;

    try {
      const response = await fetch('/api/verify-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          qrId: qrId,
          action: 'checkout'
        })
      });

      if (response.ok) {
        alert('Visitor checked out successfully!');
      } else {
        alert('Failed to check out visitor');
      }
    } catch (error) {
      console.error('Check-out error:', error);
      alert('Failed to check out visitor');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-emerald-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                Vis-IITH
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-lg font-semibold text-gray-700">QR Verification</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-600">Security Portal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">QR Code Verification</h2>
          <p className="text-gray-600">
            Scan or enter a visitor QR code to verify entry permissions and manage check-in/out.
          </p>
        </div>

        {/* QR Input Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code or Visitor ID
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={qrId}
                  onChange={(e) => setQrId(e.target.value)}
                  placeholder="Enter QR code or scan with camera"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  onKeyPress={(e) => e.key === 'Enter' && verifyQR()}
                />
                <button
                  onClick={() => verifyQR()}
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                💡 Tip: You can also scan QR codes directly with your device camera
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {result.valid && result.request ? (
              // Valid QR Code - Show Visitor Details
              <div>
                <div className="bg-green-50 border-b border-green-200 px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-green-900">Valid Visitor Pass</h3>
                      <p className="text-sm text-green-700">This visitor is authorized for entry</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Visitor Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Visitor Information</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Name</span>
                          <p className="text-gray-900 font-medium">{result.request.visitorName}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Mobile</span>
                          <p className="text-gray-900">{result.request.mobile}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Purpose</span>
                          <p className="text-gray-900 capitalize">{result.request.purpose}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Additional Visitors</span>
                          <p className="text-gray-900">{result.request.additionalVisitors}</p>
                        </div>
                        {result.request.vehicleType && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Vehicle</span>
                            <p className="text-gray-900">
                              {result.request.vehicleType}
                              {result.request.vehicleNo && ` - ${result.request.vehicleNo}`}
                            </p>
                          </div>
                        )}
                        {result.request.guestHouse && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Guest House</span>
                            <p className="text-green-600 font-medium">Required</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Visit Details */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Visit Details</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Visit Date</span>
                          <p className="text-gray-900 font-medium">{formatDate(result.request.visitDate)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Visit Time</span>
                          <p className="text-gray-900">{result.request.visitTime}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Requested By</span>
                          <p className="text-gray-900">{result.request.requestedBy.name}</p>
                          <p className="text-sm text-gray-500">{result.request.requestedBy.email}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Request Created</span>
                          <p className="text-gray-900">{formatDateTime(result.request.createdAt)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Approved On</span>
                          <p className="text-gray-900">{formatDateTime(result.request.approvedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex space-x-4">
                      <button
                        onClick={handleCheckIn}
                        className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>Check In</span>
                      </button>
                      <button
                        onClick={handleCheckOut}
                        className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Check Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Invalid QR Code
              <div>
                <div className="bg-red-50 border-b border-red-200 px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-red-900">Invalid QR Code</h3>
                      <p className="text-sm text-red-700">This visitor is not authorized for entry</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 font-medium">Error:</p>
                    <p className="text-red-600">{result.error}</p>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Possible reasons:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• QR code has expired or visit date has passed</li>
                      <li>• Visitor request was not approved</li>
                      <li>• QR code is invalid or corrupted</li>
                      <li>• Visit time is outside allowed hours (9 AM - 6 PM)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to use QR Verification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">For Security Staff:</h4>
              <ul className="space-y-1">
                <li>• Ask visitors to show their QR code</li>
                <li>• Scan or manually enter the QR code</li>
                <li>• Verify visitor details match ID</li>
                <li>• Use Check In/Out buttons to log entry</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">QR Code Validity:</h4>
              <ul className="space-y-1">
                <li>• Valid only on the approved visit date</li>
                <li>• Allowed during 9 AM - 6 PM hours</li>
                <li>• Must be approved by admin</li>
                <li>• Single-use for each visit</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
