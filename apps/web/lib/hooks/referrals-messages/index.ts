import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ReferralMessagesService } from "@/lib/api/client/custom-services/referral-messages";
import type { ReferralMessagesCreate } from "@/lib/api/client/models/ReferralMessagesCreate";

// Types for the service
export interface AddMessageRequest {
  message: string;
  sender: string;
  sender_id: string;
  user_info?: any;
}

export interface AddMessageWithContextRequest {
  message: string;
  sender_id: string;
  user_name: string;
  user_role: string;
  additional_context?: any;
}

export interface AddSystemMessageRequest {
  message: string;
  system_action: string;
}

export interface UpdateMessageRequest {
  updated_message: string;
  sender_id: string;
}

export interface MessageHistoryResponse {
  messages: any[];
  total_count: number;
  has_more: boolean;
}

// Get messages by referral ID with pagination
export const useMessagesByReferralId = (referralId: string, limit: number = 10, offset: number = 0) => {
  return useQuery({
    queryKey: ["referral-messages", referralId, limit, offset],
    queryFn: () => ReferralMessagesService.apiV1GetMessagesByReferralId({ 
      referralId,
      limit,
      offset 
    }),
    enabled: !!referralId,
  });
};

// Get latest messages by referral ID (defaults to 10 latest messages)
export const useLatestMessagesByReferralId = (referralId: string, limit: number = 10) => {
  return useQuery({
    queryKey: ["referral-messages-latest", referralId, limit],
    queryFn: () => ReferralMessagesService.apiV1GetMessagesByReferralId({ 
      referralId,
      limit,
      offset: 0 
    }),
    enabled: !!referralId,
  });
};

// Get message history with pagination
export const useMessageHistory = ({ 
  referralId, 
  limit, 
  offset 
}: { 
  referralId: string; 
  limit?: number; 
  offset?: number; 
}) => {
  return useQuery({
    queryKey: ["referral-message-history", referralId, limit, offset],
    queryFn: () => ReferralMessagesService.apiV1GetMessageHistory({ referralId, limit, offset }),
    enabled: !!referralId,
  });
};

// Create a new message
export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestBody: ReferralMessagesCreate) => {
      const response = await ReferralMessagesService.apiV1CreateMessage({ requestBody });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch messages for the referral
      queryClient.invalidateQueries({ queryKey: ["referral-messages", variables.referral_id] });
      queryClient.invalidateQueries({ queryKey: ["referral-message-history", variables.referral_id] });
    },
  });
};

// Add message to referral
export const useAddMessageToReferral = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      referralId, 
      requestBody 
    }: { 
      referralId: string; 
      requestBody: AddMessageRequest; 
    }) => {
      const response = await ReferralMessagesService.apiV1AddMessageToReferral({ 
        referralId, 
        requestBody 
      });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch messages for the referral
      queryClient.invalidateQueries({ queryKey: ["referral-messages", variables.referralId] });
      queryClient.invalidateQueries({ queryKey: ["referral-message-history", variables.referralId] });
    },
  });
};

// Add message with user context
export const useAddMessageWithContext = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      referralId, 
      requestBody 
    }: { 
      referralId: string; 
      requestBody: AddMessageWithContextRequest; 
    }) => {
      const response = await ReferralMessagesService.apiV1AddMessageWithContext({ 
        referralId, 
        requestBody 
      });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch messages for the referral
      queryClient.invalidateQueries({ queryKey: ["referral-messages", variables.referralId] });
      queryClient.invalidateQueries({ queryKey: ["referral-message-history", variables.referralId] });
    },
  });
};

// Add system message
export const useAddSystemMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      referralId, 
      requestBody 
    }: { 
      referralId: string; 
      requestBody: AddSystemMessageRequest; 
    }) => {
      const response = await ReferralMessagesService.apiV1AddSystemMessage({ 
        referralId, 
        requestBody 
      });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch messages for the referral
      queryClient.invalidateQueries({ queryKey: ["referral-messages", variables.referralId] });
      queryClient.invalidateQueries({ queryKey: ["referral-message-history", variables.referralId] });
    },
  });
};

// Update message
export const useUpdateMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      messageId, 
      requestBody 
    }: { 
      messageId: string; 
      requestBody: UpdateMessageRequest; 
    }) => {
      const response = await ReferralMessagesService.apiV1UpdateMessage({ 
        messageId, 
        requestBody 
      });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate all message queries since we don't know which referral this message belongs to
      queryClient.invalidateQueries({ queryKey: ["referral-messages"] });
      queryClient.invalidateQueries({ queryKey: ["referral-message-history"] });
    },
  });
};

// Upload referral document
export const useUploadReferralDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      messageId, 
      type, 
      files, 
      documentCategory 
    }: { 
      messageId: string; 
      type: string; 
      files: File[]; 
      documentCategory?: string; 
    }) => {
      const response = await ReferralMessagesService.apiV1UploadReferralDocument({ 
        messageId, 
        type, 
        files, 
        documentCategory 
      });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate all message queries since we don't know which referral this message belongs to
      queryClient.invalidateQueries({ queryKey: ["referral-messages"] });
      queryClient.invalidateQueries({ queryKey: ["referral-message-history"] });
    },
  });
};

// Upload message attachments
export const useUploadMessageAttachments = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      messageId, 
      files, 
      documentCategory 
    }: { 
      messageId: string; 
      files: File[]; 
      documentCategory?: string; 
    }) => {
      const response = await ReferralMessagesService.apiV1UploadMessageAttachments({ 
        messageId, 
        files, 
        documentCategory 
      });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate all message queries since we don't know which referral this message belongs to
      queryClient.invalidateQueries({ queryKey: ["referral-messages"] });
      queryClient.invalidateQueries({ queryKey: ["referral-message-history"] });
      queryClient.invalidateQueries({ queryKey: ["message-attachments", variables.messageId] });
    },
  });
};

// Get message attachments
export const useMessageAttachments = (messageId: string) => {
  return useQuery({
    queryKey: ["message-attachments", messageId],
    queryFn: () => ReferralMessagesService.apiV1GetMessageAttachments({ messageId }),
    enabled: !!messageId,
  });
};

// Get referral files
export const useReferralFiles = ({ 
  messageId, 
  type 
}: { 
  messageId: string; 
  type: string; 
}) => {
  return useQuery({
    queryKey: ["referral-files", messageId, type],
    queryFn: () => ReferralMessagesService.apiV1GetReferralFiles({ messageId, type }),
    enabled: !!messageId && !!type,
  });
};
