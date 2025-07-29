"use client"

import React, { useState, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  QrCode, Download, Copy, Check, Plus, Trash2, Users, Building, Filter, Package,
  FileText, Calendar, ChevronRight, Sparkles, Menu, Bell,
  Search, Home, BarChart3, Settings, LogOut, User, ChevronDown, LayoutDashboard,
  ClipboardList, MapPin, Activity, HelpCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { QRCodeSVG } from 'qrcode.react';
import { CreateBatchModal, BatchList, ReferralList, PrintPreviewModal } from './components';
import { useGetFacilities } from '@/lib/hooks/facilities';
import { useBatchesPaginated, useDeleteBatch } from '@/lib/hooks/batch';
import { useReferrals, useReferralsByBatch, useReferralsWithDetails } from '@/lib/hooks/referrals';
import { Facility as ApiFacility } from '@/lib/api/client/models/Facility';
import { ReferralBatch } from '@/lib/api/client/models/ReferralBatch';
import { Referral as ApiReferral } from '@/lib/api/client/models/Referral';
import { BASE_URL } from '@/constants';

interface Referral {
  id: string;
  url: string;
  qrCode: React.ReactElement;
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
  const [selectedBatchPrefix, setSelectedBatchPrefix] = useState<string | null>(null);
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
  const { data: batchesData, isLoading: isBatchesLoading, refetch: refetchBatches } = useBatchesPaginated({
    page: batchPage,
    page_size: batchPageSize,
    search: ''
  });

  const { data: facilitiesResponse, isLoading: isFacilitiesLoading } = useGetFacilities({
    page: 1,
    pageSize: 5,
    search: ''
  });

  const { data: allReferralsData, isLoading: isReferralsLoading } = useReferralsWithDetails({
    page: referralPage,
    page_size: referralPageSize,
    search: '',
    batch_prefix: selectedBatchPrefix || ''
  });

  // Delete batch mutation
  const deleteBatchMutation = useDeleteBatch();

  const apiFacilities = facilitiesResponse?.items || [];
  const pagination = (allReferralsData as any)?.pagination || {
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 0
  };
  const apiBatches = (batchesData as any)?.items || batchesData || [];
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

  // Generate QR code using qrcode.react
  const generateQRCode = (text) => {
    return (
      <QRCodeSVG
        value={text}
        size={256}
        level="M"
        bgColor="#ffffff"
        fgColor="#1e293b"
        includeMargin={true}
        style={{
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      />
    );
  };

  // Helper functions for patient information
  const formatPatientInitials = (fname?: string, mname?: string, lname?: string): string => {
    if (!fname && !lname) return '';
    const firstInitial = fname ? fname.charAt(0).toUpperCase() : '';
    const middleInitial = mname ? mname.charAt(0).toUpperCase() : '';
    const lastInitial = lname ? lname.charAt(0).toUpperCase() : '';
    return `${firstInitial}${middleInitial}${lastInitial}`.trim();
  };

  const formatSubmissionYear = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.getFullYear().toString();
    } catch {
      return '';
    }
  };

  const formatSubmissionDisplay = (referral: any): string => {
    if (!referral.referral_submitted) return '';

    const initials = formatPatientInitials(
      referral.patient_fname,
      referral.patient_mname,
      referral.patient_lname
    );
    const year = formatSubmissionYear(referral.referral_submitted_date);

    if (initials && year) {
      return `${initials} (${year})`;
    } else if (initials) {
      return initials;
    } else if (year) {
      return `(${year})`;
    }
    return '';
  };

  // Transform API referrals to component format
  const transformReferral = (apiReferral: ApiReferral): Referral => {
    const referralUrl = `${BASE_URL}/r/${apiReferral.referral_batch_prefix}-${apiReferral.referral_slug}/`;
    const submissionDisplay = formatSubmissionDisplay(apiReferral);
    const baseStatus = apiReferral.referral_status || (apiReferral.referral_submitted ? 'Submitted' : apiReferral.referral_scanned ? 'Scanned' : 'Active');
    const statusWithSubmission = submissionDisplay ? `${baseStatus} - ${submissionDisplay}` : baseStatus;

    return {
      id: apiReferral.referral_slug,
      url: referralUrl,
      qrCode: generateQRCode(referralUrl),
      status: statusWithSubmission
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

    Swal.fire({
      title: 'Batch created successfully',
      icon: 'success',
      confirmButtonText: 'OK'
    });
    refetchBatches();
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
  const printFromPreview = (qrPrintData: any) => {
    const printWindow = window.open('', 'PRINT', 'height=600,width=800');
    const htmlContent = generatePrintHTML(previewBatch, qrPrintData);

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
  const generatePrintHTML = (batch: any, qrPrintData: any) => {
    // Get QR print data for the batch
    const batchPrefix = batch?.referral_batch_prefix;
    if (!batchPrefix) {
      return '<html><body><p>Invalid batch data</p></body></html>';
    }

    // Generate QR codes for printing using the API data structure
    const generateQRCodeSVG = (qrCodeUrl: string) => {
      // Create QR code SVG using qrcode.react
      const QRCode = require('qrcode.react').QRCodeSVG;
      const React = require('react');
      const ReactDOMServer = require('react-dom/server');
      
      const qrCodeElement = React.createElement(QRCode, {
        value: qrCodeUrl,
        size: 200,
        level: "M",
        bgColor: "#ffffff",
        fgColor: "#1e293b",
        includeMargin: true
      });
      
      return ReactDOMServer.renderToString(qrCodeElement);
    };

    // Extract data from QR print data
    const referrals = qrPrintData?.referrals || [];
    const totalReferrals = qrPrintData?.total_referrals || 0;
    const outboundFacilityName = qrPrintData?.outbound_facility_name || batch.outboundFacility?.name;
    const inboundFacilityName = qrPrintData?.inbound_facility_name || batch.inboundFacility?.name;
    const batchSize = qrPrintData?.batch_size || 0;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes - ${batchPrefix}</title>
          <style>
            @page {
              size: A4;
              margin: 0.25in;
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
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #333;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 24px;
              color: #333;
            }
            .header-info {
              color: #666;
              font-size: 14px;
              line-height: 1.4;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: repeat(6, 1fr);
              gap: 8px;
              page-break-inside: avoid;
            }
            .qr-item {
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 8px;
              text-align: center;
              page-break-inside: avoid;
              background: #fff;
            }
            .qr-code {
              width: 80px;
              height: 80px;
              margin: 0 auto;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-code svg {
              width: 100% !important;
              height: 100% !important;
            }
            .qr-info {
              font-size: 10px;
              color: #666;
              margin-top: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #999;
            }
            @media print {
              body {
                background: white;
              }
              .qr-item {
                border: 1px solid #333;
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Referral QR Codes</h1>
            <div class="header-info">
              <p><strong>Batch ID:</strong> ${batch.id}</p>
              <p><strong>Batch Prefix:</strong> ${batchPrefix}</p>
              ${batch.description ? `<p><strong>Description:</strong> ${batch.description}</p>` : ''}
              <p><strong>Route:</strong> ${outboundFacilityName || 'Unknown'} → ${inboundFacilityName || 'Unknown'}</p>
              <p><strong>Generated:</strong> ${batch.createdAt ? new Date(batch.createdAt).toLocaleString() : 'Unknown'}</p>
              <p><strong>Total QR Codes:</strong> ${totalReferrals}</p>
              <p><strong>Batch Size:</strong> ${batchSize}</p>
            </div>
          </div>
          
          <div class="qr-grid">
            ${referrals.map((referral: any) => {
              const qrCodeString = generateQRCodeSVG(referral.qr_code_url);
              return `
                <div class="qr-item">
                  <div class="qr-code">${qrCodeString}</div>
                  <div class="qr-info">
                    <div>ID: ${referral.referral_slug}</div>
                    <div>Status: ${referral.status || 'Pending'}</div>
                    ${referral.scanned ? '<div style="color: #059669;">✓ Scanned</div>' : ''}
                    ${referral.submitted ? '<div style="color: #2563eb;">✓ Submitted</div>' : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} | Total QR Codes: ${totalReferrals} | Batch Size: ${batchSize}</p>
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
  const downloadQRCode = (qrCodeElement, id) => {
    // Convert React element to SVG string
    const svgString = qrCodeElement.props.value;

    // Create a new QR code SVG for download
    const downloadQR = (
      <QRCodeSVG
        value={svgString}
        size={256}
        level="M"
        bgColor="#ffffff"
        fgColor="#1e293b"
        includeMargin={true}
      />
    );

    // Convert React element to string
    const svgStringForDownload = ReactDOMServer.renderToString(downloadQR);

    // Create a Blob from the SVG
    const blob = new Blob([svgStringForDownload], { type: 'image/svg+xml' });
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

  // Delete batch - Updated with API call using SweetAlert2
  const deleteBatch = async (batchId: string) => {
    try {

      // Find the batch to get its name for the confirmation dialog
      const batch = batches.find(b => b.id === batchId);
      const batchName = batch?.referral_batch_prefix || 'this batch';

      // Show SweetAlert2 confirmation dialog
      const result = await Swal.fire({
        title: 'Delete Batch?',
        text: `Are you sure you want to delete ${batchName}? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      });

      if (!result.isConfirmed) {
        return;
      }

      // Show loading state
      Swal.fire({
        title: 'Deleting...',
        text: 'Please wait while we delete the batch.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Call the delete API
      await deleteBatchMutation.mutateAsync(batchId, {
        onSuccess: () => {
          // Close the loading dialog
          Swal.fire({
            title: 'Batch deleted successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          });

          // Refresh the batches
          refetchBatches();
        },
        onError: () => {
          // Close loading dialog and show error
          Swal.fire({
            title: 'Error',
            text: 'Failed to delete batch',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });

      // Clear selected batch if it was deleted
      if (selectedBatchId === batchId) {
        setSelectedBatchId(null);
      }

      // Close the loading dialog
      Swal.close();
    } catch (error) {
      // Close loading dialog and show error
      Swal.close();

      // Error is already handled by the mutation hook, but we can show additional feedback
      console.error('Failed to delete batch:', error);
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
        <PrintPreviewModal
          isOpen={showPrintPreview}
          onClose={() => {
            setShowPrintPreview(false);
            setPreviewBatch(null);
          }}
          onPrint={printFromPreview}
          batch={previewBatch}
        />

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('batches')}
                  className={`px-6 py-4 text-sm font-semibold transition-all relative ${activeTab === 'batches'
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
                  className={`px-6 py-4 text-sm font-semibold transition-all relative ${activeTab === 'referrals'
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
              setSelectedBatchPrefix={setSelectedBatchPrefix}
              currentPage={batchPage}
              pageSize={batchPageSize}
              onPageChange={setBatchPage}
              totalItems={batches.length}
              onPageSizeChange={setBatchPageSize}
            />
          )}

          {/* Referrals List Tab */}
          {activeTab === 'referrals' && (
            <ReferralList
              batches={batches}
              selectedBatchPrefix={selectedBatchPrefix}
              setSelectedBatchPrefix={setSelectedBatchPrefix}
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
              isLoading={isReferralsLoading}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ReferralDashboard;