import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FacilitatorService } from "../../api/client/custom-services/facilitator";
import { FacilitatorCreate } from "@/lib/api/client/models/FacilitatorCreate";
import { FacilitatorUpdate } from "@/lib/api/client/models/FacilitatorUpdate";

export const useGetFacilitators = ({ page, pageSize, search, facilityId }: { page: number, pageSize: number, search: string, facilityId: string }) => {
    return useQuery({
        queryKey: ['facilitators', page, pageSize, search, facilityId],
        queryFn: () => FacilitatorService.apiV1GetFacilitators({ 
            page, 
            pageSize, 
            search, 
            facilityId: facilityId === 'all' ? undefined : facilityId 
        }),
    });
};
    
export const useGetFacilitatorById = (facilitatorId: string) => {
    return useQuery({
        queryKey: ['facilitator', facilitatorId],
        queryFn: () => FacilitatorService.apiV1GetFacilitatorById({ facilitatorId }),
    });
};

export const useCreateFacilitator = () => {
    return useMutation({
        mutationFn: (facilitator: FacilitatorCreate) => FacilitatorService.apiV1CreateFacilitator({ requestBody: facilitator }),
    });
};

export const useCreateFacilitatorWithMultipleFacilities = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: {
            facilitator_first_name: string;
            facilitator_last_name: string;
            facilitator_full_name: string;
            facilitator_email: string;
            facilitator_status: string;
            deleted: boolean;
            password: string;
            facilitator_phone_number: string;
            propelauth_user_id?: string;
            facility_ids: string[];
        }) => FacilitatorService.apiV1CreateFacilitatorWithMultipleFacilities({ requestBody: data }),
        onSuccess: () => {
            // Invalidate and refetch facilitators list
            queryClient.invalidateQueries({ queryKey: ['facilitators'] });
        },
    });
};

export const useUpdateFacilitator = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ facilitatorId, facilitator }: { facilitatorId: string, facilitator: FacilitatorUpdate }) => 
            FacilitatorService.apiV1UpdateFacilitator({ 
                facilitatorId, 
                requestBody: facilitator 
            }),
        onSuccess: () => {
            // Invalidate and refetch facilitators list
            queryClient.invalidateQueries({ queryKey: ['facilitators'] });
        },
    });
};

export const useChangeFacilitatorPassword = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ facilitatorId, newPassword }: { facilitatorId: string, newPassword: string }) => 
            FacilitatorService.apiV1ChangeFacilitatorPassword({ 
                facilitatorId, 
                requestBody: { new_password: newPassword }
            }),
        onSuccess: () => {
            // Invalidate and refetch facilitators list
            queryClient.invalidateQueries({ queryKey: ['facilitators'] });
        },
    });
};

export const useUpdateFacilitatorWithMultipleFacilities = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ facilitatorId, facilitator }: { 
            facilitatorId: string, 
            facilitator: {
                facilitator_first_name?: string;
                facilitator_last_name?: string;
                facilitator_full_name?: string;
                facilitator_email?: string;
                facilitator_status?: string;
                facilitator_phone_number?: string;
                deleted?: boolean;
                facility_ids?: string[];
            }
        }) => 
            FacilitatorService.apiV1UpdateFacilitatorWithMultipleFacilities({ 
                facilitatorId, 
                requestBody: facilitator 
            }),
        onSuccess: () => {
            // Invalidate and refetch facilitators list
            queryClient.invalidateQueries({ queryKey: ['facilitators'] });
        },
    });
};

export const useGetUserFacilitiesByFacilitatorId = (facilitatorId: string) => {
    return useQuery({
        queryKey: ['user-facilities', facilitatorId],
        queryFn: () => FacilitatorService.apiV1GetUserFacilitiesByFacilitatorId({ facilitatorId }),
        enabled: !!facilitatorId,
    });
};

export const useDeleteFacilitator = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (facilitatorId: string) => 
            FacilitatorService.apiV1DeleteFacilitator({ facilitatorId }),
        onSuccess: () => {
            // Invalidate and refetch facilitators list
            queryClient.invalidateQueries({ queryKey: ['facilitators'] });
        },
    });
};