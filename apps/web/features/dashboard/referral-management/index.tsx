"use client"

import React, { useState, useRef } from 'react';
import { 
  QrCode, Download, Copy, Check, Plus, Trash2, Users, Building, Filter, Package, 
  FileText, Calendar, ChevronRight, X, Printer, Eye, Sparkles, Menu, Bell, 
  Search, Home, BarChart3, Settings, LogOut, User, ChevronDown, LayoutDashboard,
  ClipboardList, MapPin, Activity, HelpCircle
} from 'lucide-react';
import { CreateBatchModal, BatchList, ReferralList } from './components';
import { useGetFacilities } from '@/lib/hooks/facilities';
import { useBatches } from '@/lib/hooks/batch';
import { useReferrals, useReferralsByBatch } from '@/lib/hooks/referrals';
import { Facility as ApiFacility } from '@/lib/api/client/models/Facility';
import { ReferralBatch } from '@/lib/api/client/models/ReferralBatch';
import { Referral as ApiReferral } from '@/lib/api/client/models/Referral';

interface Referral {
  id: string;
  url: string;
  qrCode: string;
  status: string;
}

interface Facility {
  id: string;
  name: string;
}

interface Batch {
  id: string;
  referral_batch_id: string;
  referral_batch_prefix: string;
  referral_batch_size: number;
  referral_outbound_facility_id: string;
  referral_inbound_facility_id: string;
  outboundFacility?: Facility;
  inboundFacility?: Facility;
  referrals?: Referral[];
  createdAt?: string;
  totalReferrals?: number;
  usedReferrals?: number;
  description?: string;
}

const ReferralDashboard = () => {
  const [activeTab, setActiveTab] = useState('batches');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewBatch, setPreviewBatch] = useState<Batch | null>(null);
  const [batchPage, setBatchPage] = useState(1);
  const [batchPageSize, setBatchPageSize] = useState(10);
  const [referralPage, setReferralPage] = useState(1);
  const [referralPageSize, setReferralPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
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

  // Fetch batches, facilities and referrals from API
  const { data: batchesData, isLoading: isBatchesLoading } = useBatches();
  const { data: facilitiesResponse, isLoading: isFacilitiesLoading } = useGetFacilities({
    page: 1,
    pageSize: 5,
    search: ''
  });
  const { data: allReferralsData, isLoading: isReferralsLoading } = useReferrals({
    page: referralPage,
    page_size: referralPageSize,
    search: ''
  });

  const apiFacilities = facilitiesResponse?.items || [];
  const pagination = (allReferralsData as any)?.pagination || {
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 0
  };
  const apiBatches = batchesData || [];
  const apiReferrals = (allReferralsData as any)?.items || allReferralsData || [];
  
  // Transform API facilities for backward compatibility
  const facilities = apiFacilities.map((facility: ApiFacility) => ({
    id: facility.facility_id,
    name: facility.facility_name
  }));

  // Generate a unique slug for referrals
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

  // Transform API referrals to component format
  const transformReferral = (apiReferral: ApiReferral): Referral => {
    const referralUrl = `${window.location.origin}/qr-scan?id=${apiReferral.referral_slug}`;
    return {
      id: apiReferral.referral_slug,
      url: referralUrl,
      qrCode: generateQRCode(referralUrl),
      status: apiReferral.referral_status || (apiReferral.referral_submitted ? 'Submitted' : apiReferral.referral_scanned ? 'Scanned' : 'Active')
    };
  };

  // Group referrals by batch prefix
  const referralsByBatch = apiReferrals.reduce((acc, referral) => {
    const batchPrefix = referral.referral_batch_prefix;
    if (!acc[batchPrefix]) {
      acc[batchPrefix] = [];
    }
    acc[batchPrefix].push(transformReferral(referral));
    return acc;
  }, {} as Record<string, Referral[]>);

  // Transform API batches to include facility details and real referrals
  const batches: Batch[] = apiBatches.map((batch: ReferralBatch) => {
    const outboundFacility = facilities.find(f => f.id === batch.referral_outbound_facility_id);
    const inboundFacility = facilities.find(f => f.id === batch.referral_inbound_facility_id);
    const batchReferrals = referralsByBatch[batch.referral_batch_prefix] || [];
    const usedReferrals = batchReferrals.filter(r => r.status !== 'Active').length;
    
    return {
      ...batch,
      id: batch.referral_batch_id,
      outboundFacility: outboundFacility || { id: batch.referral_outbound_facility_id, name: 'Unknown Facility' },
      inboundFacility: inboundFacility || { id: batch.referral_inbound_facility_id, name: 'Unknown Facility' },
      referrals: batchReferrals,
      totalReferrals: batch.referral_batch_size,
      usedReferrals: usedReferrals,
      description: '', // TODO: Add description field to API
      createdAt: new Date().toISOString() // TODO: Add created_at field to API
    };
  });

  // Handle batch generation - TODO: Replace with API call
  const handleBatchGenerate = () => {
    if (!batchForm.outboundFacility || !batchForm.inboundFacility) {
      alert('Please select both outbound and inbound facilities');
      return;
    }
    
    const outboundFacility = facilities.find(f => f.id === batchForm.outboundFacility);
    const inboundFacility = facilities.find(f => f.id === batchForm.inboundFacility);
    
    if (!outboundFacility || !inboundFacility) {
      alert('Invalid facility selection');
      return;
    }

    // TODO: Implement API call to create batch using BatchesService
    // For now, just close the modal
    setBatchForm({ outboundFacility: '', inboundFacility: '', numberOfReferrals: 1, description: '' });
    setShowCreateModal(false);
    
    alert('Batch creation will be implemented with API integration');
  };

  // Handle page size change for referrals
  const handleReferralPageSizeChange = (newPageSize: number) => {
    setReferralPageSize(newPageSize);
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
    
    printWindow?.document.write(htmlContent);
    printWindow?.document.close();
    
    printWindow?.focus();
    
    // Wait for content to load, then print
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow?.print();
          printWindow?.close();
        }, 250);
      };
    }
  };

  // Generate HTML for printing
  const generatePrintHTML = (batch) => {
    if (!batch?.outboundFacility || !batch?.inboundFacility || !batch?.referrals) {
      return '<html><body><p>Invalid batch data</p></body></html>';
    }
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes - ${batch.referral_batch_prefix}</title>
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
            <p><strong>Batch Prefix:</strong> ${batch.referral_batch_prefix}</p>
            ${batch.description ? `<p><strong>Description:</strong> ${batch.description}</p>` : ''}
            <p><strong>Route:</strong> ${batch.outboundFacility.name} → ${batch.inboundFacility.name}</p>
            <p><strong>Generated:</strong> ${batch.createdAt ? new Date(batch.createdAt).toLocaleString() : 'Unknown'}</p>
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

  // Delete batch - TODO: Replace with API call
  const deleteBatch = (batchPrefix) => {
    // TODO: Implement API call to delete batch
    alert('Batch deletion will be implemented with API integration');
    if (selectedBatchId === batchPrefix) {
      setSelectedBatchId(null);
    }
  };

  // Delete individual referral - TODO: Replace with API call
  const deleteReferral = (batchPrefix, referralId) => {
    // TODO: Implement API call to delete referral
    alert('Referral deletion will be implemented with API integration');
  };

  const totalReferrals = batches.reduce((sum, batch) => sum + (batch.totalReferrals || 0), 0);
  const todaysBatches = batches.filter(b => b.createdAt && new Date(b.createdAt).toDateString() === new Date().toDateString());

  return (
    <>
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
        <CreateBatchModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleBatchGenerate}
          form={batchForm}
          onFormChange={setBatchForm}
        />

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
                          <p className="text-lg"><strong className="font-semibold">Route:</strong> {previewBatch.outboundFacility?.name || 'Unknown'} → {previewBatch.inboundFacility?.name || 'Unknown'}</p>
                          <p className="text-lg"><strong className="font-semibold">Generated:</strong> {previewBatch.createdAt ? new Date(previewBatch.createdAt).toLocaleString() : 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-12 py-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(previewBatch.referrals || []).map(referral => (
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
                                <p><strong className="font-semibold text-blue-600">From:</strong> {previewBatch.outboundFacility?.name || 'Unknown'}</p>
                                <p><strong className="font-semibold text-purple-600">To:</strong> {previewBatch.inboundFacility?.name || 'Unknown'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="sticky bottom-0 bg-white px-12 pt-8 pb-12 rounded-b-lg">
                      <div className="text-center pt-8 border-t border-gray-200">
                        <p className="text-gray-500">
                          Generated on {new Date().toLocaleString()} | Total QR Codes: {previewBatch.referrals?.length || 0}
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
            <BatchList
              batches={batches}
              facilities={facilities}
              batchFilters={batchFilters}
              setBatchFilters={setBatchFilters}
              setShowCreateModal={setShowCreateModal}
              showPrintPreviewModal={showPrintPreviewModal}
              deleteBatch={deleteBatch}
              setActiveTab={setActiveTab}
              setSelectedBatchId={setSelectedBatchId}
            />
          )}

          {/* Referrals List Tab */}
          {activeTab === 'referrals' && (
            <ReferralList
              batches={batches}
              selectedBatchId={selectedBatchId}
              setSelectedBatchId={setSelectedBatchId}
              copiedId={copiedId}
              copyToClipboard={copyToClipboard}
              downloadQRCode={downloadQRCode}
              deleteReferral={deleteReferral}
              showPrintPreviewModal={showPrintPreviewModal}
              currentPage={referralPage}
              pageSize={referralPageSize}
              onPageChange={setReferralPage}
              totalItems={pagination.total_count}
              onPageSizeChange={handleReferralPageSizeChange}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ReferralDashboard;