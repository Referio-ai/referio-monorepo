import { useMutation, useQuery } from '@tanstack/react-query';
import { FacilitiesService } from '@/lib/api/client/services/FacilitiesService';
import { Facility } from '@/lib/api/client/models/Facility';
import { FacilityCreate } from '@/lib/api/client/models/FacilityCreate';
import { FacilityUpdate } from '@/lib/api/client/models/FacilityUpdate';
import type { CancelablePromise } from '@/lib/api/client/core/CancelablePromise';
import { FacilitiesService as CustomFacilitiesService } from '@/lib/api/client/custom-services/facilities';

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
  };
}

export const useGetFacilities = ({
  page,
  pageSize,
  search
}: {
  page: number;
  pageSize: number;
  search: string;
}) => {
  return useQuery({
    queryKey: ['facilities', page, pageSize, search],
    queryFn: async () => {
      const response = await FacilitiesService.apiV1GetFacilities({ page, pageSize, search });
      return response as unknown as PaginatedResponse<Facility>;
    },
  });
};

export const useGetFacilitiesByUserId = (userId: string) => {
  return useQuery({
    queryKey: ['facilities-by-user', userId],
    queryFn: () => CustomFacilitiesService.apiV1GetFacilitiesByUserId({ userId }),
    enabled: !!userId,
  });
};

export const createFacility = () => {
  return useMutation({
    mutationFn: (facility: FacilityCreate) => FacilitiesService.apiV1CreateFacility({ requestBody: facility }),
  });
};

export const updateFacility = () => {
  return useMutation({
    mutationFn: ({ facilityId, facility }: { facilityId: string; facility: FacilityUpdate }) => 
      FacilitiesService.apiV1UpdateFacility({ facilityId, requestBody: facility }),
  });
};

export const deleteFacility = () => {
  return useMutation({
    mutationFn: (facilityId: string) => FacilitiesService.apiV1DeleteFacility({ facilityId }),
  });
};