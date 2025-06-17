import { useMutation, useQuery } from '@tanstack/react-query';
import { FacilitiesService } from '@/lib/api/client/services/FacilitiesService';
import { Facility } from '@/lib/api/client/models/Facility';
import { FacilityCreate } from '@/lib/api/client/models/FacilityCreate';
import type { CancelablePromise } from '@/lib/api/client/core/CancelablePromise';

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

export const createFacility = () => {
  return useMutation({
    mutationFn: (facility: FacilityCreate) => FacilitiesService.apiV1CreateFacility({ requestBody: facility }),
  });
};