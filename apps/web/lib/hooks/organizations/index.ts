import { useMutation, useQuery } from '@tanstack/react-query';
import { OrganizationsService } from '@/lib/api/client/custom-services/organizations';
import { Organization } from '@/lib/api/client/models/Organization';
import { OrganizationCreate } from '@/lib/api/client/models/OrganizationCreate';
import { OrganizationUpdate } from '@/lib/api/client/models/OrganizationUpdate';

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
  };
}

export const useGetOrganizations = ({
  page,
  pageSize,
  search
}: {
  page: number;
  pageSize: number;
  search: string;
}) => {
  return useQuery({
    queryKey: ['organizations', page, pageSize, search],
    queryFn: async () => {
      const response = await OrganizationsService.apiV1GetOrganizations({ page, pageSize, search });
      return response as unknown as PaginatedResponse<Organization>;
    },
  });
};

export const useGetAllOrganizations = () => {
  return useQuery({
    queryKey: ['all-organizations'],
    queryFn: () => OrganizationsService.apiV1GetAllOrganizations(),
  });
};

export const createOrganization = () => {
  return useMutation({
    mutationFn: (organization: OrganizationCreate) => OrganizationsService.apiV1CreateOrganization({ requestBody: organization }),
  });
};

export const updateOrganization = () => {
  return useMutation({
    mutationFn: ({ organizationId, organization }: { organizationId: string; organization: OrganizationUpdate }) => 
      OrganizationsService.apiV1UpdateOrganization({ organizationId, requestBody: organization }),
  });
};

export const deleteOrganization = () => {
  return useMutation({
    mutationFn: (organizationId: string) => OrganizationsService.apiV1DeleteOrganization({ organizationId }),
  });
};