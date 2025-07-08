import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BatchesService } from "@/lib/api/client/services/BatchesService";
import { ReferralBatchCreate } from "@/lib/api/client/models/ReferralBatchCreate";
import { ReferralBatchUpdate } from "@/lib/api/client/models/ReferralBatchUpdate";
import { GenerateBatchRequest } from "@/lib/api/client/models/GenerateBatchRequest";
import { toast } from "sonner";

// Query Keys
const BATCH_KEYS = {
  all: ['batches'] as const,
  lists: () => [...BATCH_KEYS.all, 'list'] as const,
  list: (filters: string) => [...BATCH_KEYS.lists(), { filters }] as const,
  details: () => [...BATCH_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...BATCH_KEYS.details(), id] as const,
  referrals: (id: string) => [...BATCH_KEYS.detail(id), 'referrals'] as const,
  summary: (id: string) => [...BATCH_KEYS.detail(id), 'summary'] as const,
};

// Get all batches
export const useBatches = () => useQuery({
  queryKey: BATCH_KEYS.lists(),
  queryFn: () => BatchesService.apiV1GetBatches(),
  staleTime: 1000 * 60 * 5, // 5 minutes
});

// Get all batches with pagination (for future use when client is updated)
export const useBatchesPaginated = ({ page, page_size, search }: { page?: number, page_size?: number, search?: string } = {}) => useQuery({
  queryKey: BATCH_KEYS.list(`${page || 1}-${page_size || 10}-${search || ''}`),
  queryFn: () => BatchesService.apiV1GetBatches(), // Will be updated when client supports pagination
  staleTime: 1000 * 60 * 5, // 5 minutes
});

// Get single batch
export const useBatch = (batchId: string) => useQuery({
  queryKey: BATCH_KEYS.detail(batchId),
  queryFn: () => BatchesService.apiV1GetBatch({ batchId }),
  enabled: !!batchId,
  staleTime: 1000 * 60 * 5,
});

// Get batch referrals
export const useBatchReferrals = (batchId: string) => useQuery({
  queryKey: BATCH_KEYS.referrals(batchId),
  queryFn: () => BatchesService.apiV1GetBatchReferrals({ batchId }),
  enabled: !!batchId,
  staleTime: 1000 * 60 * 2,
});

// Get batch summary
export const useBatchSummary = (batchId: string) => useQuery({
  queryKey: BATCH_KEYS.summary(batchId),
  queryFn: () => BatchesService.apiV1GetBatchSummary({ batchId }),
  enabled: !!batchId,
  staleTime: 1000 * 60 * 1, // 1 minute for summary data
});

// Create batch mutation
export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (batch: ReferralBatchCreate) => 
      BatchesService.apiV1CreateBatch({ requestBody: batch }),
    onSuccess: (data) => {
      // Invalidate and refetch batches list
      queryClient.invalidateQueries({ queryKey: BATCH_KEYS.lists() });
      toast.success("Batch created successfully!");
      return data;
    },
    onError: (error: any) => {
      const errorMessage = error?.body?.detail || error?.message || "Failed to create batch";
      toast.error(errorMessage);
      console.error("Create batch error:", error);
    },
  });
};

// Generate batch mutation (alternative to create)
export const useGenerateBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: GenerateBatchRequest) => 
      BatchesService.apiV1GenerateBatch({ requestBody: request }),
    onSuccess: (data) => {
      // Invalidate and refetch batches list
      queryClient.invalidateQueries({ queryKey: BATCH_KEYS.lists() });
      toast.success(`Batch generated successfully! Created ${data.referrals_created || 0} referrals.`);
      return data;
    },
    onError: (error: any) => {
      const errorMessage = error?.body?.detail || error?.message || "Failed to generate batch";
      toast.error(errorMessage);
      console.error("Generate batch error:", error);
    },
  });
};

// Update batch mutation
export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ batchId, batch }: { batchId: string; batch: ReferralBatchUpdate }) =>
      BatchesService.apiV1UpdateBatch({ batchId, requestBody: batch }),
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: BATCH_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BATCH_KEYS.detail(variables.batchId) });
      toast.success("Batch updated successfully!");
      return data;
    },
    onError: (error: any) => {
      const errorMessage = error?.body?.detail || error?.message || "Failed to update batch";
      toast.error(errorMessage);
      console.error("Update batch error:", error);
    },
  });
};

// Delete batch mutation
export const useDeleteBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (batchId: string) => BatchesService.apiV1DeleteBatch({ batchId }),
    onSuccess: (data, batchId) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: BATCH_KEYS.lists() });
      queryClient.removeQueries({ queryKey: BATCH_KEYS.detail(batchId) });
      queryClient.removeQueries({ queryKey: BATCH_KEYS.referrals(batchId) });
      queryClient.removeQueries({ queryKey: BATCH_KEYS.summary(batchId) });
      toast.success("Batch deleted successfully!");
      return data;
    },
    onError: (error: any) => {
      const errorMessage = error?.body?.detail || error?.message || "Failed to delete batch";
      toast.error(errorMessage);
      console.error("Delete batch error:", error);
    },
  });
};

// Utility function to transform form data to API format
export const transformBatchFormToCreate = (form: {
  outboundFacility: string;
  inboundFacility: string;
  numberOfReferrals: number;
  description?: string;
}): ReferralBatchCreate => ({
  referral_batch_size: form.numberOfReferrals,
  referral_outbound_facility_id: form.outboundFacility,
  referral_inbound_facility_id: form.inboundFacility,
});

// Utility function to transform form data to GenerateBatchRequest format
export const transformBatchFormToGenerate = (form: {
  outboundFacility: string;
  inboundFacility: string;
  numberOfReferrals: number;
  description?: string;
}): GenerateBatchRequest => ({
  referral_batch_size: form.numberOfReferrals,
  referral_outbound_facility_id: form.outboundFacility,
  referral_inbound_facility_id: form.inboundFacility,
});