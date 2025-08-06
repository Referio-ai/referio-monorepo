import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PatientService } from '@/lib/api/client/custom-services/patients';
import { Patient } from '@/lib/api/client/models/Patient';
import { PatientUpdate } from '@/lib/api/client/models/PatientUpdate';
import { toast } from 'sonner';

const MAX_PATIENTS = 1000; // Limit to prevent memory issues

export const useGetPatients = () => {
    return useQuery({
        queryKey: ['patients'],
        queryFn: async () => {
            try {
                const patients = await PatientService.apiV1GetPatients();
                
                // Check for excessive data size
                if (patients.length > MAX_PATIENTS) {
                    console.warn(`Large dataset detected: ${patients.length} patients. Consider implementing pagination.`);
                    toast.warning(`Loading ${patients.length} patients. Consider using filters to reduce the dataset.`);
                }
                
                return patients;
            } catch (error: any) {
                console.error('Error fetching patients:', error);
                
                // Handle specific error types
                if (error?.status === 500) {
                    toast.error('Server error occurred. Please try again in a moment.');
                } else if (error?.status === 413) {
                    toast.error('Request too large. Please use filters to reduce the dataset.');
                } else if (error?.status === 429) {
                    toast.error('Too many requests. Please wait a moment before trying again.');
                } else if (error?.message?.includes('timeout')) {
                    toast.error('Request timed out. Please check your connection and try again.');
                } else {
                    toast.error('Failed to load patients. Please try again.');
                }
                
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error: any) => {
            // Don't retry on client errors (4xx)
            if (error?.status >= 400 && error?.status < 500) {
                return false;
            }
            // Retry up to 3 times for server errors or network issues
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });
};

export const useGetPatientById = (patientId: string) => {
    return useQuery({
        queryKey: ['patient', patientId],
        queryFn: async () => {
            try {
                return await PatientService.apiV1GetPatientById({ patientId });
            } catch (error: any) {
                console.error('Error fetching patient:', error);
                
                if (error?.status === 404) {
                    toast.error('Patient not found.');
                } else if (error?.status === 500) {
                    toast.error('Server error occurred. Please try again.');
                } else {
                    toast.error('Failed to load patient details.');
                }
                
                throw error;
            }
        },
        retry: (failureCount, error: any) => {
            if (error?.status === 404) return false;
            return failureCount < 2;
        },
    });
};

export const useUpdatePatient = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ patientId, patient }: { patientId: string; patient: PatientUpdate }) =>
            PatientService.apiV1UpdatePatient({ patientId, patient }),
        onSuccess: (data, variables) => {
            // Invalidate and refetch patient data
            queryClient.invalidateQueries({ queryKey: ['patient', variables.patientId] });
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            toast.success("Patient updated successfully!");
            return data;
        },
        onError: (error: any) => {
            const errorMessage = error?.body?.detail || error?.message || "Failed to update patient";
            
            if (error?.status === 500) {
                toast.error('Server error occurred. Please try again.');
            } else if (error?.status === 413) {
                toast.error('Data too large. Please reduce the information size.');
            } else if (error?.status === 422) {
                toast.error('Invalid data provided. Please check your input.');
            } else {
                toast.error(errorMessage);
            }
            
            console.error("Update patient error:", error);
        },
    });
};