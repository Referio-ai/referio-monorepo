import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ReferralsService } from "@/lib/api/client/services/ReferralsService";
import { BatchesService } from "@/lib/api/client/services/BatchesService";
import { ReferralService } from "@/lib/api/client/custom-services/referral";
import { ApiV1Service } from '@/lib/api/client'
import { useFacilityStore } from '@/lib/stores/facilityStore';

export const useReferrals = ({ page, page_size, search }: { page: number, page_size: number, search: string }) => {
  const { activeFacilityId } = useFacilityStore();
  
  return useQuery({
    queryKey: ["referrals", page, page_size, search, activeFacilityId],
    queryFn: () => {
      if (activeFacilityId) {
        // Use facility-specific endpoint when facility is selected
        return ReferralService.getFacilitatorInboundReferrals({
          page,
          page_size,
          search,
          status: 'all', // You might want to make this configurable
          facilitator_facility_id: activeFacilityId
        });
      } else {
        // Use regular endpoint when no facility is selected
        return ReferralsService.apiV1GetReferrals({ page, page_size, search });
      }
    },
    enabled: true, // Always enabled, but behavior changes based on facility selection
  });
};

export const useReferralsWithDetails = ({ page, page_size, search, batch_prefix }: { page: number, page_size: number, search: string, batch_prefix: string }) => useQuery({
  queryKey: ["referrals-with-details", page, page_size, search, batch_prefix],
  queryFn: () => ReferralService.getReferralsWithDetails({ page, page_size, search, batch_prefix }),
  staleTime: 1000 * 60 * 2, // Cache for 2 minutes
});

export const useReferralsByBatch = (batchId: string) => useQuery({
  queryKey: ["referrals", "batch", batchId],
  queryFn: () => ReferralsService.apiV1GetReferralsByBatch({ batchId }),
  enabled: !!batchId,
});

export const useReferral = (referralId: string) => useQuery({
  queryKey: ["referrals", referralId],
  queryFn: () => ReferralsService.apiV1GetReferral({ referralId }),
  enabled: !!referralId,
});

export const useReferralBySlug = (slug: string) => useQuery({
  queryKey: ["referrals", "slug", slug],
  queryFn: () => {

    //slug is the batch-prefix-referral-id
    const batchPrefix = slug.split('-')[0]
    const referralId = slug.split('-')[1]

    const response = ReferralService.apiV1GetReferralBySlug({ slug: referralId, batchPrefix })
    console.log(response)
    return response
  },
  enabled: !!slug,
});

export const useBatchReferrals = (batchId: string) => useQuery({
  queryKey: ["batches", batchId, "referrals"],
  queryFn: () => BatchesService.apiV1GetBatchReferrals({ batchId }),
  enabled: !!batchId,
});

//create referral

// Upload referral form with Reducto extraction
export const useUploadReferralForm = () => {
  return useMutation({
    mutationFn: async ({ referralId, files, is_urgent }: { referralId: string; files: File[]; is_urgent?: boolean }) => {
      const response = await ReferralService.apiV1UploadReferralFormWithExtraction({
        referralId,
        files,
        is_urgent,
      })
      console.log(response)
      return response
    },
  })
}

export const useMarkReferralAsScanned = () => {
  return useMutation({
    mutationFn: async ({ slug }: { slug: string }) => {
      const response = await ReferralService.markReferralAsScanned({ slug })
      return response
    },
  })
}

export const useUploadDocument = () => {
  return useMutation({
    mutationFn: async ({ referralId, formData, documentType, documentCategory }: { referralId: string, formData: File[], documentType: string, documentCategory: string }) => {
      const response = await ReferralService.uploadDocument({ referralId, formData, documentType, documentCategory })
      return response
    },
  })
} 

export const useScannedReferralsCount = () => {
  return useQuery({
    queryKey: ["scanned-referrals-count"],
    queryFn: () => ReferralService.getScannedReferralsCount(),
  })
}

export const useScannedReferrals = ({ page, page_size, search, status }: { page: number, page_size: number, search: string, status: string }) => useQuery({ 
  queryKey: ["scanned-referrals", page, page_size, search, status],
  queryFn: () => ReferralService.getScannedReferrals({ page, page_size, search, status }),
})

export const useReferralsForQrPrinting = ({ batchPrefix }: { batchPrefix: string }) => useQuery({
  queryKey: ["referrals-for-qr-printing", batchPrefix],
  queryFn: () => ReferralService.getReferralsForQrPrinting({ batchPrefix }),
})

export const useUploadReferralFormAsync = () => {
  return useMutation({
    mutationFn: async ({ referralId, files, is_urgent }: { referralId: string; files: File[]; is_urgent?: boolean }) => {
      const response = await ReferralService.uploadReferralFormAsync({ referralId, files, is_urgent })
      return response
    },
  })
}

export const useUpdateReferralStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ referralId, status, notes, appointmentDate, appointmentType }: { 
      referralId: string, 
      status: string, 
      notes: string,
      appointmentDate?: string,
      appointmentType?: string 
    }) => {
      const response = await ReferralService.updateReferralStatus({ 
        referralId, 
        status, 
        notes,
        appointmentDate,
        appointmentType
      })
      return response
    },
    onSuccess: (data, variables) => {
      // Only invalidate status history for this specific referral to refresh the modal
      // Don't invalidate other queries to avoid refreshing the referral details
      queryClient.invalidateQueries({ queryKey: ["referral-status-history", variables.referralId] });
    },
  })
}

/**
 * Hook to mark communication updates as read for a referral
 */
export const useMarkCommunicationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ referralId, userId }: { 
      referralId: string, 
      userId: string 
    }) => {
      const response = await ReferralService.markCommunicationAsRead({ 
        referralId, 
        userId 
      })
      return response
    },
    onSuccess: (data, variables) => {
      // Invalidate referral queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
      queryClient.invalidateQueries({ queryKey: ["referrals", variables.referralId] });
      queryClient.invalidateQueries({ queryKey: ["referrals-with-details"] });
      queryClient.invalidateQueries({ queryKey: ["facilitator-inbound-referrals"] });
      queryClient.invalidateQueries({ queryKey: ["facilitator-outbound-referrals"] });
    },
  })
}

/**
 * Hook to get communication update status for a referral
 */
export const useCommunicationUpdateStatus = (referralId: string) => {
  return useQuery({
    queryKey: ["referral-communication-status", referralId],
    queryFn: () => ReferralService.getCommunicationUpdateStatus({ referralId }),
    enabled: !!referralId,
    staleTime: 1000 * 60 * 1, // Cache for 1 minute
  })
}

/**
 * Hook to mark file updates as read for a referral
 */
export const useMarkFileUpdateAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ referralId, userId }: { 
      referralId: string, 
      userId: string 
    }) => {
      const response = await ReferralService.markFileUpdateAsRead({ 
        referralId, 
        userId 
      })
      return response
    },
    onSuccess: (data, variables) => {
      // Invalidate referral queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
      queryClient.invalidateQueries({ queryKey: ["referrals", variables.referralId] });
      queryClient.invalidateQueries({ queryKey: ["referrals-with-details"] });
      queryClient.invalidateQueries({ queryKey: ["facilitator-inbound-referrals"] });
      queryClient.invalidateQueries({ queryKey: ["facilitator-outbound-referrals"] });
    },
  })
}

/**
 * Hook to get file update status for a referral
 */
export const useFileUpdateStatus = (referralId: string) => {
  return useQuery({
    queryKey: ["referral-file-update-status", referralId],
    queryFn: () => ReferralService.getFileUpdateStatus({ referralId }),
    enabled: !!referralId,
    staleTime: 1000 * 60 * 1, // Cache for 1 minute
  })
}

export const useFacilitatorInboundReferrals = ({ page, page_size, search, status, facilitator_facility_id, sort_by }: { page: number, page_size: number, search: string, status: string, facilitator_facility_id: string, sort_by?: string }) => useQuery({
  queryKey: ["facilitator-inbound-referrals", page, page_size, search, status, facilitator_facility_id, sort_by],
  queryFn: () => ReferralService.getFacilitatorInboundReferrals({ page, facilitator_facility_id, page_size, search, status, sort_by }),
})

export const useFacilitatorOutboundReferrals = ({ page, page_size, search, status, facilitator_facility_id, sort_by }: { page: number, page_size: number, search: string, status: string, facilitator_facility_id: string, sort_by?: string }) => useQuery({
  queryKey: ["facilitator-outbound-referrals", page, page_size, search, status, facilitator_facility_id, sort_by],
  queryFn: () => ReferralService.getFacilitatorOutboundReferrals({ page, facilitator_facility_id, page_size, search, status, sort_by }),
})

export const useReferralStatusHistory = (referralId: string) => useQuery({
  queryKey: ["referral-status-history", referralId],
  queryFn: () => ReferralService.getReferralStatusHistory({ referralId }),
  enabled: !!referralId,
  staleTime: 1000 * 60 * 5, // Cache for 5 minutes
});  