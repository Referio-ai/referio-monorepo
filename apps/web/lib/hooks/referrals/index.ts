import { useQuery, useMutation } from '@tanstack/react-query'
import { ReferralsService } from "@/lib/api/client/services/ReferralsService";
import { BatchesService } from "@/lib/api/client/services/BatchesService";
import { ReferralService } from "@/lib/api/client/custom-services/referral";
import { ApiV1Service } from '@/lib/api/client'

export const useReferrals = ({ page, page_size, search }: { page: number, page_size: number, search: string }) => useQuery({
  queryKey: ["referrals", page, page_size, search],
  queryFn: () => ReferralsService.apiV1GetReferrals({ page, page_size, search }),
});

export const useReferralsWithDetails = ({ page, page_size, search }: { page: number, page_size: number, search: string }) => useQuery({
  queryKey: ["referrals-with-details", page, page_size, search],
  queryFn: () => ReferralService.getReferralsWithDetails({ page, page_size, search }),
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
  queryFn: () => ReferralService.apiV1GetReferralBySlug({ slug }),
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
    mutationFn: async ({ referralId, files }: { referralId: string; files: File[] }) => {
      const response = await ReferralService.apiV1UploadReferralFormWithExtraction({
        referralId,
        files,
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