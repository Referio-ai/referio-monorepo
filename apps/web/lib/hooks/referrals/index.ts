import { useQuery, useMutation } from '@tanstack/react-query'
import { ReferralsService } from "@/lib/api/client/services/ReferralsService";
import { BatchesService } from "@/lib/api/client/services/BatchesService";
import { ReferralService } from "@/lib/api/client/custom-services/referral";
import { ApiV1Service } from '@/lib/api/client'

export const useReferrals = ({ page, page_size, search }: { page: number, page_size: number, search: string }) => useQuery({
  queryKey: ["referrals", page, page_size, search],
  queryFn: () => ReferralsService.apiV1GetReferrals({ page, page_size, search }),
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