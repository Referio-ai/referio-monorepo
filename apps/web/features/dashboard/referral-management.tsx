"use client"

import React, { useState, useRef } from 'react';
import { 
  QrCode, Download, Copy, Check, Plus, Trash2, Users, Building, Filter, Package, 
  FileText, Calendar, ChevronRight, X, Printer, Eye, Sparkles, Menu, Bell, 
  Search, Home, BarChart3, Settings, LogOut, User, ChevronDown, LayoutDashboard,
  ClipboardList, MapPin, Activity, HelpCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard';

const ReferralDashboard = () => {
  const [activeTab, setActiveTab] = useState('batches');
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewBatch, setPreviewBatch] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [batchFilters, setBatchFilters] = useState({
    outboundFacility: '',
    inboundFacility: ''
  });
  const [batchForm, setBatchForm] = useState({
    outboundFacility: '',
    inboundFacility: '',
    numberOfReferrals: 1,
    description: ''
  });
  const [copiedId, setCopiedId] = useState(null);

  // Sample facilities - in real app, these would come from an API
  const facilities = [
    { id: 'FAC001', name: 'Main Hospital - Downtown' },
    { id: 'FAC002', name: 'North Medical Center' },
    { id: 'FAC003', name: 'South Community Clinic' },
    { id: 'FAC004', name: 'West Urgent Care' },
    { id: 'FAC005', name: 'East Specialty Center' }
  ];

  // Sidebar navigation items
  const sidebarItems = [
    { icon: Home, label: 'Dashboard', active: false },
    { icon: QrCode, label: 'Referrals', active: true },
    { icon: Building, label: 'Facilities', active: false },
    { icon: Users, label: 'Patients', active: false },
    { icon: BarChart3, label: 'Analytics', active: false },
    { icon: ClipboardList, label: 'Reports', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  // Generate a unique batch ID
  const generateBatchId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `BATCH-${timestamp}-${random}`.toUpperCase();
  };

  // Generate a unique slug
  const generateSlug = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `REF-${timestamp}-${random}`.toUpperCase();
  };

  // Generate QR code as SVG with enhanced design
  const generateQRCode = (text) => {
    const size = 256;
    const modules = 25;
    const moduleSize = size / modules;
    const padding = moduleSize * 2;
    const innerSize = size - (padding * 2);
    const innerModuleSize = innerSize / modules;
    
    const pattern: boolean[][] = Array(modules).fill(null).map(() => Array(modules).fill(false));
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        const charCode = text.charCodeAt((i * modules + j) % text.length);
        pattern[i][j] = (charCode * (i + 1) * (j + 1)) % 2 === 0;
      }
    }
    
    const addMarker = (row, col) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
            pattern[row + i][col + j] = true;
          } else {
            pattern[row + i][col + j] = false;
          }
        }
      }
    };
    
    addMarker(0, 0);
    addMarker(0, modules - 7);
    addMarker(modules - 7, 0);
    
    let svg = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Add gradient definitions
    svg += `<defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
      </filter>
    </defs>`;
    
    // Background with gradient
    svg += `<rect width="${size}" height="${size}" fill="url(#bgGradient)" rx="16"/>`;
    
    // White inner background
    svg += `<rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" fill="white" rx="8" filter="url(#shadow)"/>`;
    
    // QR pattern
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        if (pattern[i][j]) {
          svg += `<rect x="${padding + j * innerModuleSize}" y="${padding + i * innerModuleSize}" width="${innerModuleSize}" height="${innerModuleSize}" fill="#1e293b" rx="1"/>`;
        }
      }
    }
    
    svg += '</svg>';
    return svg;
  };

  // Handle batch generation
  const handleBatchGenerate = () => {
    if (!batchForm.outboundFacility || !batchForm.inboundFacility) {
      alert('Please select both outbound and inbound facilities');
      return;
    }
    
    const batchId = generateBatchId();
    const timestamp = new Date().toISOString();
    const referrals = [];
    
    for (let i = 0; i < batchForm.numberOfReferrals; i++) {
      const slug = generateSlug();
      const referralUrl = `https://referral.example.com/${slug}`;
      
      referrals.push({
        id: slug,
        url: referralUrl,
        qrCode: generateQRCode(referralUrl),
        status: 'active'
      });
    }
    
    const newBatch = {
      id: batchId,
      outboundFacility: facilities.find(f => f.id === batchForm.outboundFacility),
      inboundFacility: facilities.find(f => f.id === batchForm.inboundFacility),
      referrals: referrals,
      createdAt: timestamp,
      totalReferrals: batchForm.numberOfReferrals,
      usedReferrals: 0,
      description: batchForm.description
    };
    
    setBatches([newBatch, ...batches]);
    setBatchForm({ outboundFacility: '', inboundFacility: '', numberOfReferrals: 1, description: '' });
    setShowCreateModal(false);
  };

  // Show print preview
  const showPrintPreviewModal = (batch) => {
    setPreviewBatch(batch);
    setShowPrintPreview(true);
  };

  // Print from preview
  const printFromPreview = () => {
    const printWindow = window.open('', 'PRINT', 'height=600,width=800');
    const htmlContent = generatePrintHTML(previewBatch);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.focus();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  };

  // Generate HTML for printing
  const generatePrintHTML = (batch) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes - ${batch.id}</title>
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #333;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
              color: #333;
            }
            .header p {
              margin: 5px 0;
              color: #666;
              font-size: 14px;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              page-break-inside: avoid;
            }
            .qr-item {
              border: 2px solid #ddd;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              page-break-inside: avoid;
              background: #fff;
            }
            .qr-code {
              width: 150px;
              height: 150px;
              margin: 0 auto 15px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-code svg {
              width: 100% !important;
              height: 100% !important;
            }
            .qr-id {
              font-size: 12px;
              font-family: 'Courier New', monospace;
              color: #333;
              margin-bottom: 10px;
              font-weight: bold;
              word-break: break-all;
            }
            .facility-info {
              font-size: 11px;
              color: #555;
              margin-top: 10px;
              line-height: 1.5;
            }
            .facility-info strong {
              color: #333;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #999;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
            @media print {
              body {
                background: white;
              }
              .qr-item {
                border: 2px solid #333;
                break-inside: avoid;
              }
              .header {
                break-after: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Referral QR Codes</h1>
            <p><strong>Batch ID:</strong> ${batch.id}</p>
            ${batch.description ? `<p><strong>Description:</strong> ${batch.description}</p>` : ''}
            <p><strong>Route:</strong> ${batch.outboundFacility.name} → ${batch.inboundFacility.name}</p>
            <p><strong>Generated:</strong> ${new Date(batch.createdAt).toLocaleString()}</p>
          </div>
          <div class="qr-grid">
            ${batch.referrals.map(referral => `
              <div class="qr-item">
                <div class="qr-code">${referral.qrCode}</div>
                <div class="qr-id">${referral.id}</div>
                <div class="facility-info">
                  <strong>From:</strong> ${batch.outboundFacility.name}<br>
                  <strong>To:</strong> ${batch.inboundFacility.name}
                </div>
              </div>
            `).join('')}
          </div>
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} | Total QR Codes: ${batch.referrals.length}</p>
          </div>
        </body>
      </html>
    `;
  };

  // Get all referrals from all batches
  const getAllReferrals = () => {
    const allReferrals = [];
    batches.forEach(batch => {
      batch.referrals.forEach(referral => {
        allReferrals.push({
          ...referral,
          batchId: batch.id,
          outboundFacility: batch.outboundFacility,
          inboundFacility: batch.inboundFacility,
          createdAt: batch.createdAt
        });
      });
    });
    return allReferrals;
  };

  // Get filtered referrals
  const getFilteredReferrals = () => {
    if (!selectedBatchId) return getAllReferrals();
    
    const batch = batches.find(b => b.id === selectedBatchId);
    if (!batch) return [];
    
    return batch.referrals.map(referral => ({
      ...referral,
      batchId: batch.id,
      outboundFacility: batch.outboundFacility,
      inboundFacility: batch.inboundFacility,
      createdAt: batch.createdAt
    }));
  };

  // Copy referral URL to clipboard
  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download QR code as image
  const downloadQRCode = (qrCode, id) => {
    // Create a Blob from the SVG
    const blob = new Blob([qrCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-${id}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Cleanup
    URL.revokeObjectURL(url);
  };

  // Delete batch
  const deleteBatch = (batchId) => {
    setBatches(batches.filter(b => b.id !== batchId));
    if (selectedBatchId === batchId) {
      setSelectedBatchId(null);
    }
  };

  // Delete individual referral
  const deleteReferral = (batchId, referralId) => {
    setBatches(batches.map(batch => {
      if (batch.id === batchId) {
        return {
          ...batch,
          referrals: batch.referrals.filter(r => r.id !== referralId),
          totalReferrals: batch.totalReferrals - 1
        };
      }
      return batch;
    }));
  };

  // Get filtered batches
  const getFilteredBatches = () => {
    return batches.filter(batch => {
      const matchesOutbound = !batchFilters.outboundFacility || batch.outboundFacility.id === batchFilters.outboundFacility;
      const matchesInbound = !batchFilters.inboundFacility || batch.inboundFacility.id === batchFilters.inboundFacility;
      return matchesOutbound && matchesInbound;
    });
  };

  const totalReferrals = batches.reduce((sum, batch) => sum + batch.totalReferrals, 0);
  const todaysBatches = batches.filter(b => new Date(b.createdAt).toDateString() === new Date().toDateString());

  return (
    <DashboardLayout
      title="Referral Management"
      onSearch={(query) => {
        // Implement search functionality
        console.log('Search:', query);
      }}
      sidebarItems={[
        { icon: Home, label: 'Dashboard', active: false },
        { icon: QrCode, label: 'Referrals', active: true },
        { icon: Building, label: 'Facilities', active: false },
        { icon: Users, label: 'Patients', active: false },
        { icon: BarChart3, label: 'Analytics', active: false },
        { icon: ClipboardList, label: 'Reports', active: false },
        { icon: Settings, label: 'Settings', active: false },
      ]}
      onLogout={() => {
        // Implement logout functionality
        console.log('Logout clicked');
      }}
      onProfileClick={() => {
        // Implement profile click functionality
        console.log('Profile clicked');
      }}
      onSettingsClick={() => {
        // Implement settings click functionality
        console.log('Settings clicked');
      }}
    >
      <div className="p-6">
        {/* Page Title and Stats */}
        <div className="mb-8">
          {/* Inline Statistics */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between gap-4 overflow-x-auto">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex-1 min-w-[160px] text-white">
                <div>
                  <p className="text-xs font-medium opacity-90 whitespace-nowrap">Total Batches</p>
                  <p className="text-3xl font-bold">{batches.length}</p>
                </div>
                <Package className="w-10 h-10 opacity-80" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex-1 min-w-[160px] text-white">
                <div>
                  <p className="text-xs font-medium opacity-90 whitespace-nowrap">Total Referrals</p>
                  <p className="text-3xl font-bold">{totalReferrals}</p>
                </div>
                <QrCode className="w-10 h-10 opacity-80" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex-1 min-w-[160px] text-white">
                <div>
                  <p className="text-xs font-medium opacity-90 whitespace-nowrap">Active Facilities</p>
                  <p className="text-3xl font-bold">{facilities.length}</p>
                </div>
                <Building className="w-10 h-10 opacity-80" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex-1 min-w-[160px] text-white">
                <div>
                  <p className="text-xs font-medium opacity-90 whitespace-nowrap">Today's Batches</p>
                  <p className="text-3xl font-bold">{todaysBatches.length}</p>
                </div>
                <Calendar className="w-10 h-10 opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Create Batch Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all">
              <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    Create New Batch
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Outbound Facility
                    </label>
                    <select
                      value={batchForm.outboundFacility}
                      onChange={(e) => setBatchForm({...batchForm, outboundFacility: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select facility...</option>
                      {facilities.map(facility => (
                        <option key={facility.id} value={facility.id}>
                          {facility.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Inbound Facility
                    </label>
                    <select
                      value={batchForm.inboundFacility}
                      onChange={(e) => setBatchForm({...batchForm, inboundFacility: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select facility...</option>
                      {facilities.map(facility => (
                        <option key={facility.id} value={facility.id}>
                          {facility.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Referrals
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={batchForm.numberOfReferrals}
                      onChange={(e) => setBatchForm({...batchForm, numberOfReferrals: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={batchForm.description}
                      onChange={(e) => setBatchForm({...batchForm, description: e.target.value})}
                      placeholder="Add notes about this batch..."
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-4 justify-end">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBatchGenerate}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    Generate Batch
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Print Preview Modal */}
        {showPrintPreview && previewBatch && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 bg-gradient-to-r from-green-500 to-blue-600 text-white flex items-center justify-between flex-shrink-0">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  Print Preview - {previewBatch.id}
                </h2>
                <button
                  onClick={() => {
                    setShowPrintPreview(false);
                    setPreviewBatch(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden bg-gray-100 p-4">
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                  <div className="bg-white shadow-xl mx-auto rounded-lg max-w-5xl">
                    <div className="sticky top-0 bg-white z-10 px-12 pt-12 pb-8 rounded-t-lg">
                      <div className="text-center pb-8 border-b-2 border-gray-200">
                        <h1 className="text-3xl font-bold mb-4 text-gray-800">Referral QR Codes</h1>
                        <div className="space-y-2 text-gray-600">
                          <p className="text-lg"><strong className="font-semibold">Batch ID:</strong> {previewBatch.id}</p>
                          {previewBatch.description && (
                            <p className="text-lg"><strong className="font-semibold">Description:</strong> {previewBatch.description}</p>
                          )}
                          <p className="text-lg"><strong className="font-semibold">Route:</strong> {previewBatch.outboundFacility.name} → {previewBatch.inboundFacility.name}</p>
                          <p className="text-lg"><strong className="font-semibold">Generated:</strong> {new Date(previewBatch.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-12 py-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {previewBatch.referrals.map((referral) => (
                          <div key={referral.id} className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative bg-white border-2 border-gray-200 p-6 text-center rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                              <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
                                <div 
                                  className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                                  dangerouslySetInnerHTML={{ __html: referral.qrCode }}
                                />
                              </div>
                              <p className="text-sm font-mono font-bold text-gray-800 break-all mb-3 bg-gray-100 px-3 py-2 rounded-lg">{referral.id}</p>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><strong className="font-semibold text-blue-600">From:</strong> {previewBatch.outboundFacility.name}</p>
                                <p><strong className="font-semibold text-purple-600">To:</strong> {previewBatch.inboundFacility.name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="sticky bottom-0 bg-white px-12 pt-8 pb-12 rounded-b-lg">
                      <div className="text-center pt-8 border-t border-gray-200">
                        <p className="text-gray-500">
                          Generated on {new Date().toLocaleString()} | Total QR Codes: {previewBatch.referrals.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-between bg-gray-50 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowPrintPreview(false);
                    setPreviewBatch(null);
                  }}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition-all font-medium"
                >
                  Close
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      const blob = new Blob([generatePrintHTML(previewBatch)], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `QR-Codes-${previewBatch.id}.html`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download HTML
                  </button>
                  <button
                    onClick={printFromPreview}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Printer className="w-5 h-5" />
                    Print QR Codes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('batches')}
                  className={`px-6 py-4 text-sm font-semibold transition-all relative ${
                    activeTab === 'batches'
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Batches
                  </div>
                  {activeTab === 'batches' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('referrals')}
                  className={`px-6 py-4 text-sm font-semibold transition-all relative ${
                    activeTab === 'referrals'
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    All Referrals
                  </div>
                  {activeTab === 'referrals' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  )}
                </button>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mr-4 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Batch
              </button>
            </div>
          </div>

          {/* Batch List Tab */}
          {activeTab === 'batches' && (
            <div>
              {/* Batch Filters */}
              {batches.length > 0 && (
                <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                  <div className="flex items-center gap-4 flex-wrap">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <label className="text-sm font-semibold text-gray-700">Filter by:</label>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Outbound:</label>
                      <select
                        value={batchFilters.outboundFacility}
                        onChange={(e) => setBatchFilters({...batchFilters, outboundFacility: e.target.value})}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">All Facilities</option>
                        {facilities.map(facility => (
                          <option key={facility.id} value={facility.id}>
                            {facility.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Inbound:</label>
                      <select
                        value={batchFilters.inboundFacility}
                        onChange={(e) => setBatchFilters({...batchFilters, inboundFacility: e.target.value})}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">All Facilities</option>
                        {facilities.map(facility => (
                          <option key={facility.id} value={facility.id}>
                            {facility.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {(batchFilters.outboundFacility || batchFilters.inboundFacility) && (
                      <button
                        onClick={() => setBatchFilters({ outboundFacility: '', inboundFacility: '' })}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {batches.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <Package className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-6">No batches created yet.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    Create Your First Batch
                  </button>
                </div>
              ) : getFilteredBatches().length === 0 ? (
                <div className="p-16 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <Filter className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-6">No batches match the selected filters.</p>
                  <button
                    onClick={() => setBatchFilters({ outboundFacility: '', inboundFacility: '' })}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Batch ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Outbound → Inbound
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Referrals
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Scanned QR
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getFilteredBatches().map((batch) => (
                        <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm font-medium text-gray-900">{batch.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 max-w-xs truncate" title={batch.description}>
                              {batch.description || '-'}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-blue-600">{batch.outboundFacility.name}</span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-purple-600">{batch.inboundFacility.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{batch.totalReferrals}</span>
                              <span className="text-xs text-gray-500">referrals</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">{batch.usedReferrals || 0}</span>
                              <span className="text-xs text-gray-500">/ {batch.totalReferrals}</span>
                              <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-300"
                                  style={{ width: `${(batch.usedReferrals || 0) / batch.totalReferrals * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(batch.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setActiveTab('referrals');
                                  setSelectedBatchId(batch.id);
                                }}
                                className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                              >
                                View Referrals
                              </button>
                              <button
                                onClick={() => showPrintPreviewModal(batch)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Print QR Codes"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteBatch(batch.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Batch"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Referrals List Tab */}
          {activeTab === 'referrals' && (
            <div>
              {/* Filter by Batch */}
              <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <label className="text-sm font-semibold text-gray-700">Filter by Batch:</label>
                    <select
                      value={selectedBatchId || ''}
                      onChange={(e) => setSelectedBatchId(e.target.value || null)}
                      className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">All Batches</option>
                      {batches.map(batch => (
                        <option key={batch.id} value={batch.id}>
                          {batch.id} ({batch.totalReferrals} referrals)
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedBatchId && (
                    <button
                      onClick={() => {
                        const batch = batches.find(b => b.id === selectedBatchId);
                        if (batch) showPrintPreviewModal(batch);
                      }}
                      className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-2 transition-colors font-medium"
                    >
                      <Printer className="w-4 h-4" />
                      Print Batch QR Codes
                    </button>
                  )}
                </div>
              </div>

              {getFilteredReferrals().length === 0 ? (
                <div className="p-16 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <QrCode className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No referrals found. {selectedBatchId ? 'Try selecting a different batch.' : 'Create a batch to generate referrals.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Referral ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Batch ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Facilities
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getFilteredReferrals().map((referral) => (
                        <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium text-gray-900">{referral.id}</span>
                              <button
                                onClick={() => copyToClipboard(referral.url, referral.id)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Copy URL"
                              >
                                {copiedId === referral.id ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{referral.batchId}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="font-medium text-blue-600">{referral.outboundFacility.name}</div>
                              <div className="text-gray-500">→ <span className="text-purple-600">{referral.inboundFacility.name}</span></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white">
                              {referral.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => downloadQRCode(referral.qrCode, referral.id)}
                                className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 font-medium"
                                title="Download QR Code"
                              >
                                <Download className="w-4 h-4" />
                                Download QR
                              </button>
                              <button
                                onClick={() => deleteReferral(referral.batchId, referral.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Referral"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReferralDashboard;