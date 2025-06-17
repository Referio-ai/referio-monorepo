import { useQuery } from "@tanstack/react-query";
import {OrganizationsService} from "@/lib/api/client/services/OrganizationsService";


export const useOrganizations = () => useQuery({
  queryKey: ["organizations"],
  queryFn: () => OrganizationsService.apiV1GetOrganizations(),
});