'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export default function NewRequest() {
  const { user, logout } = useAuth();

  // If user is not authenticated, show loading or redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    relationship: '',
    customRelationship: '',
    purposeOfVisit: '',
    visitDate: '',
    visitTime: '',
    numberOfVisitors: '1',
    stayingInGuestHouse: '',
    guestHouseProof: null as File | null,
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Phone number validation - only allow digits and limit to 10 characters
    if (name === 'visitorPhone') {
      const phoneValue = value.replace(/\D/g, ''); // Remove non-digits
      if (phoneValue.length <= 10) {
        setFormData({
          ...formData,
          [name]: phoneValue
        });
      }
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Indian mobile number validation: 10 digits, starting with 6-9
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file type (PDF or image)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload only PDF or image files (JPG, PNG, PDF)');
        e.target.value = '';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
    }
    
    setFormData({
      ...formData,
      guestHouseProof: file
    });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    if (!validatePhoneNumber(formData.visitorPhone)) {
      alert('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)');
      return;
    }
    
    // Validate custom relationship when "Other" is selected
    if (formData.relationship === 'Other' && !formData.customRelationship.trim()) {
      alert('Please specify your relationship to the visitor');
      return;
    }
    
    // Validate guest house proof when staying in guest house
    if (formData.stayingInGuestHouse === 'Yes' && !formData.guestHouseProof) {
      alert('Please upload proof of guest house booking');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the data for API submission
      const requestData = {
        visitorName: formData.visitorName,
        visitorEmail: formData.visitorEmail,
        visitorPhone: formData.visitorPhone,
        relationship: formData.relationship,
        customRelationship: formData.customRelationship,
        purposeOfVisit: formData.purposeOfVisit,
        visitDate: formData.visitDate,
        visitTime: formData.visitTime,
        numberOfVisitors: formData.numberOfVisitors,
        stayingInGuestHouse: formData.stayingInGuestHouse,
        additionalNotes: formData.additionalNotes
      };

      const response = await fetch('/api/visitor-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit request');
      }

      // Success
      alert('Request submitted successfully! Your request is now pending admin approval. You will receive an email confirmation shortly.');
      
      // Reset form
      setFormData({
        visitorName: '',
        visitorEmail: '',
        visitorPhone: '',
        relationship: '',
        customRelationship: '',
        purposeOfVisit: '',
        visitDate: '',
        visitTime: '',
        numberOfVisitors: '1',
        stayingInGuestHouse: '',
        guestHouseProof: null,
        additionalNotes: ''
      });
      
      // Reset file input
      const fileInput = document.getElementById('guestHouseProof') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      // Redirect to dashboard
      window.location.href = '/student/dashboard';
      
    } catch (error) {
      console.error('Error submitting request:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <span className="text-lg font-semibold text-gray-700">New Request</span>
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
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                  window.location.href = '/';
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/student/dashboard" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Dashboard
                </Link>
              </li>
              <li>
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-gray-700 font-medium">New Request</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Visitor Request</h2>
          <p className="text-gray-600">
            Fill out the form below to request a visitor pass. All fields marked with * are required.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="p-8">
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
              {/* Visitor Information Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Visitor Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="visitorName" className="block text-sm font-medium text-gray-700 mb-2">
                      Visitor Name *
                    </label>
                    <input
                      type="text"
                      id="visitorName"
                      name="visitorName"
                      value={formData.visitorName}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 placeholder-gray-500"
                      placeholder="Enter visitor's full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="visitorEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Visitor Email *
                    </label>
                    <input
                      type="email"
                      id="visitorEmail"
                      name="visitorEmail"
                      value={formData.visitorEmail}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 placeholder-gray-500"
                      placeholder="visitor@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="visitorPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Visitor Phone *
                    </label>
                    <input
                      type="tel"
                      id="visitorPhone"
                      name="visitorPhone"
                      value={formData.visitorPhone}
                      onChange={handleChange}
                      required
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      autoComplete="off"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 placeholder-gray-500 ${
                        formData.visitorPhone && !validatePhoneNumber(formData.visitorPhone) 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300'
                      }`}
                      placeholder="9876543210"
                    />
                    {formData.visitorPhone && !validatePhoneNumber(formData.visitorPhone) && (
                      <p className="text-red-600 text-xs mt-1">
                        Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9
                      </p>
                    )}
                    {formData.visitorPhone && validatePhoneNumber(formData.visitorPhone) && (
                      <p className="text-green-600 text-xs mt-1">
                        ✓ Valid phone number
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship *
                    </label>
                    <select
                      id="relationship"
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                    >
                      <option value="">Select relationship</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Relative">Relative</option>
                      <option value="Friend">Friend</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Custom Relationship Field - Only show when "Other" is selected */}
                  {formData.relationship === 'Other' && (
                    <div className="md:col-span-2">
                      <label htmlFor="customRelationship" className="block text-sm font-medium text-gray-700 mb-2">
                        Please specify relationship *
                      </label>
                      <input
                        type="text"
                        id="customRelationship"
                        name="customRelationship"
                        value={formData.customRelationship}
                        onChange={handleChange}
                        required={formData.relationship === 'Other'}
                        autoComplete="off"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 placeholder-gray-500"
                        placeholder="Enter your relationship to the visitor"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Visit Details Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 12a7 7 0 110-14M5 21a7 7 0 1110-14" />
                  </svg>
                  Visit Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Visit Date *
                    </label>
                    <input
                      type="date"
                      id="visitDate"
                      name="visitDate"
                      value={formData.visitDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      autoComplete="off"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="visitTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Visit Time *
                    </label>
                    <input
                      type="time"
                      id="visitTime"
                      name="visitTime"
                      value={formData.visitTime}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Visitor can arrive ±1 hour from this time.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="numberOfVisitors" className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Visitors *
                    </label>
                    <select
                      id="numberOfVisitors"
                      name="numberOfVisitors"
                      value={formData.numberOfVisitors}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                    >
                      <option value="1">1 person</option>
                      <option value="2">2 people</option>
                      <option value="3">3 people</option>
                      <option value="4">4 people</option>
                      <option value="5+">5+ people</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="purposeOfVisit" className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose of Visit *
                  </label>
                  <textarea
                    id="purposeOfVisit"
                    name="purposeOfVisit"
                    value={formData.purposeOfVisit}
                    onChange={handleChange}
                    required
                    rows={3}
                    autoComplete="off"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 placeholder-gray-500"
                    placeholder="Briefly describe the purpose of the visit"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Staying in Guest House? *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="stayingInGuestHouse"
                        value="Yes"
                        checked={formData.stayingInGuestHouse === 'Yes'}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-900">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="stayingInGuestHouse"
                        value="No"
                        checked={formData.stayingInGuestHouse === 'No'}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-900">No</span>
                    </label>
                  </div>
                </div>

                {/* Guest House Proof Upload - Only show when "Yes" is selected */}
                {formData.stayingInGuestHouse === 'Yes' && (
                  <div className="mt-6">
                    <label htmlFor="guestHouseProof" className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Guest House Booking Proof *
                    </label>
                    <div className="mt-2">
                      <input
                        type="file"
                        id="guestHouseProof"
                        name="guestHouseProof"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        required={formData.stayingInGuestHouse === 'Yes'}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload PDF or image files (JPG, PNG). Maximum file size: 5MB
                      </p>
                      {formData.guestHouseProof && (
                        <p className="text-sm text-green-600 mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          File uploaded: {formData.guestHouseProof.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleChange}
                    rows={3}
                    autoComplete="off"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 placeholder-gray-500"
                    placeholder="Any additional information or special requirements"
                  />
                </div>
              </div>

              {/* Submit Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <Link
                    href="/student/dashboard"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    ← Back to Dashboard
                  </Link>
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          visitorName: '',
                          visitorEmail: '',
                          visitorPhone: '',
                          relationship: '',
                          customRelationship: '',
                          purposeOfVisit: '',
                          visitDate: '',
                          visitTime: '',
                          numberOfVisitors: '1',
                          stayingInGuestHouse: '',
                          guestHouseProof: null,
                          additionalNotes: ''
                        });
                        // Reset file input
                        const fileInput = document.getElementById('guestHouseProof') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.value = '';
                        }
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Clear Form
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Information Box */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Important Information</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your request will be reviewed by the administration within 24 hours</li>
                <li>• You and your visitor will receive email notifications about the approval status</li>
                <li>• Once approved, a QR code will be generated for campus entry</li>
                <li>• Visitors must carry valid ID and show the QR code at the campus entrance</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
