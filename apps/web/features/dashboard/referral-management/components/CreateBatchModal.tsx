import React, { useMemo } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useGetFacilities } from '@/lib/hooks/facilities';
import { Facility as ApiFacility } from '@/lib/api/client/models/Facility';
import { SearchableSelect } from '@/components/custom-components';
import { useCreateBatch, transformBatchFormToCreate } from '@/lib/hooks/batch';
import { BatchForm } from '../types';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: BatchForm;
  onFormChange: (form: BatchForm) => void;
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  onFormChange,
}) => {
  // Fetch facilities with search support
  const { data: facilitiesResponse, isLoading: isFacilitiesLoading } = useGetFacilities({
    page: 1,
    pageSize: 100, // Get a large number to avoid pagination issues
    search: ''
  });

  // Create batch mutation
  const createBatchMutation = useCreateBatch();

  const facilities = facilitiesResponse?.items || [];

  // Transform API facilities to dropdown options
  const facilityOptions = useMemo(() => {
    return facilities.map((facility: ApiFacility) => ({
      value: facility.facility_id,
      label: facility.facility_name
    }));
  }, [facilities]);

  // Validate form
  const isFormValid = useMemo(() => {
    return (
      form.outboundFacility &&
      form.inboundFacility &&
      form.outboundFacility !== form.inboundFacility &&
      form.numberOfReferrals > 0 &&
      form.numberOfReferrals <= 100
    );
  }, [form]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid) {
      return;
    }

    try {
      const batchData = transformBatchFormToCreate(form);
      await createBatchMutation.mutateAsync(batchData, {
        onSuccess: () => {
          // Close the modal
          onClose();
          
          // Reset form
          onFormChange({
            outboundFacility: '',
            inboundFacility: '',
            numberOfReferrals: 1,
            description: ''
          });

          // Call the parent onSubmit callback
          onSubmit();

        },
        onError: () => {
          // Error is already handled by the mutation's onError
        }
      });
    
      
      // Close the modal
      onClose();
      
      // Reset form
      onFormChange({
        outboundFacility: '',
        inboundFacility: '',
        numberOfReferrals: 1,
        description: ''
      });
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error('Failed to create batch:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Create New Batch
            </h2>
            <button
              onClick={onClose}
              disabled={createBatchMutation.isPending}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Outbound Facility *
              </label>
              {isFacilitiesLoading ? (
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                  Loading facilities...
                </div>
              ) : (
                <SearchableSelect
                  value={form.outboundFacility}
                  onValueChange={(value) => onFormChange({...form, outboundFacility: value})}
                  placeholder="Select outbound facility..."
                  searchPlaceholder="Search facilities..."
                  options={facilityOptions}
                  disabled={createBatchMutation.isPending}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Inbound Facility *
              </label>
              {isFacilitiesLoading ? (
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                  Loading facilities...
                </div>
              ) : (
                <SearchableSelect
                  value={form.inboundFacility}
                  onValueChange={(value) => onFormChange({...form, inboundFacility: value})}
                  placeholder="Select inbound facility..."
                  searchPlaceholder="Search facilities..."
                  options={facilityOptions}
                  disabled={createBatchMutation.isPending}
                />
              )}
              {form.outboundFacility && form.inboundFacility && form.outboundFacility === form.inboundFacility && (
                <p className="text-red-500 text-sm mt-1">
                  Outbound and inbound facilities must be different
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Referrals *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.numberOfReferrals}
                onChange={(e) => onFormChange({...form, numberOfReferrals: parseInt(e.target.value) || 1})}
                disabled={createBatchMutation.isPending}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-gray-500 text-sm mt-1">
                Maximum 100 referrals per batch
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => onFormChange({...form, description: e.target.value})}
                placeholder="Add notes about this batch..."
                rows={3}
                disabled={createBatchMutation.isPending}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Error display */}
          {createBatchMutation.isError && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <p className="text-red-700 text-sm">
                {createBatchMutation.error?.message || 'Failed to create batch. Please try again.'}
              </p>
            </div>
          )}

          <div className="mt-8 flex gap-4 justify-end">
            <button
              onClick={onClose}
              disabled={createBatchMutation.isPending}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isFacilitiesLoading || createBatchMutation.isPending}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            >
              {createBatchMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Batch...
                </>
              ) : (
                'Generate Batch'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 