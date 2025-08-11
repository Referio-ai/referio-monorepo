import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Paperclip, FileText, Send, Loader2, X, Upload } from 'lucide-react';
import { Referral } from '@/constants/referral';
import { useMessagesByReferralId, useAddMessageToReferral, useUploadMessageAttachments, useMessageAttachments } from '@/lib/hooks/referrals-messages';
import { useUser } from '@propelauth/nextjs/client';
import { useLatestMessagesByReferralId } from '@/lib/hooks/referrals-messages';

interface CommunicationTabProps {
  referral: Referral;
  onSendMessage?: (message: string) => void;
  onUploadFiles?: (files: File[]) => void;
  isActive?: boolean; // Add prop to detect when tab is active
}

interface Message {
  id: string;
  message: string;
  sender: string;
  sender_id: string;
  created_at: string;
  user_info?: any;
  attachments?: Array<{
    id?: string;
    document_id?: string;
    filename?: string;
    name?: string;
    type?: string;
    content_type?: string;
    signed_url?: string;
    url?: string;
  }>;
}

interface FileUploadState {
  files: File[];
  isUploading: boolean;
  uploadProgress: number;
}

const MESSAGES_PER_PAGE = 10;

export const CommunicationTab: React.FC<CommunicationTabProps> = ({
  referral,
  onSendMessage,
  onUploadFiles,
  isActive = true
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [fileUploadState, setFileUploadState] = useState<FileUploadState>({
    files: [],
    isUploading: false,
    uploadProgress: 0
  });
  const { user } = useUser();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastProcessedMessagesRef = useRef<string>('');

  // Fetch messages for this referral
  const { data: messagesResponse, isLoading: isLoadingMessages, error, refetch } = useLatestMessagesByReferralId(referral.referral_id, MESSAGES_PER_PAGE);
  
  // Extract messages from the response
  const messages = messagesResponse?.messages || [];
  const totalCount = messagesResponse?.total_count || 0;
  const hasMore = messagesResponse?.has_more || false;
  
  // Add message mutation
  const addMessageMutation = useAddMessageToReferral();
  
  // Upload attachments mutation
  const uploadAttachmentsMutation = useUploadMessageAttachments();

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Update local messages when server messages change
  useEffect(() => {
    // Create a hash of the current messages to compare
    const messagesHash = JSON.stringify(messages.map(m => m.id));
    
    // Only update if the messages have actually changed
    if (messagesHash !== lastProcessedMessagesRef.current) {
      if (messages.length > 0) {
        // Messages come from API in latest-first order, but we want oldest-first for display
        // So we reverse them to show chronological order (oldest first, newest last)
        const chronologicalMessages = [...messages].reverse();
        setLocalMessages(chronologicalMessages);
        
        // Show all messages in chronological order
        setDisplayedMessages(chronologicalMessages);
        setHasMoreMessages(hasMore);
      } else {
        setLocalMessages([]);
        setDisplayedMessages([]);
        setHasMoreMessages(false);
      }
      
      // Update the ref to track what we've processed
      lastProcessedMessagesRef.current = messagesHash;
    }
  }, [messages, hasMore]);

  // Refresh messages when tab becomes active
  useEffect(() => {
    if (isActive) {
      refetch();
    }
  }, [isActive, refetch]);

  // Scroll to bottom when messages change (only for new messages)
  useEffect(() => {
    if (displayedMessages.length > 0) {
      scrollToBottom();
    }
  }, [displayedMessages.length]);

  // Load more messages function
  const loadMoreMessages = useCallback(() => {
    if (isLoadingMore || !hasMoreMessages) return;

    setIsLoadingMore(true);
    
    // Calculate the next offset to fetch older messages
    const nextOffset = displayedMessages.length;
    
    // Fetch older messages from the API
    fetch(`/api/v1/referrals-messages/${referral.referral_id}?limit=${MESSAGES_PER_PAGE}&offset=${nextOffset}`)
      .then(response => response.json())
      .then(data => {
        if (data.messages && data.messages.length > 0) {
          // API returns latest-first, but we want oldest-first for display
          // So we reverse the new messages and add them to the beginning
          const reversedNewMessages = [...data.messages].reverse();
          
          // Add older messages to the beginning of the list (they appear at the top)
          setDisplayedMessages(prev => {
            // Check if we're not adding duplicate messages
            const existingIds = new Set(prev.map(m => m.id));
            const newMessages = reversedNewMessages.filter(m => !existingIds.has(m.id));
            return [...newMessages, ...prev];
          });
          setLocalMessages(prev => {
            // Check if we're not adding duplicate messages
            const existingIds = new Set(prev.map(m => m.id));
            const newMessages = reversedNewMessages.filter(m => !existingIds.has(m.id));
            return [...newMessages, ...prev];
          });
          setHasMoreMessages(data.has_more);
        } else {
          setHasMoreMessages(false);
        }
      })
      .catch(error => {
        console.error('Failed to load more messages:', error);
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  }, [displayedMessages.length, hasMoreMessages, isLoadingMore, referral.referral_id]);

  // Scroll handler for lazy loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    
    // If user scrolls to the top (within 50px), load more messages
    if (scrollTop < 50 && hasMoreMessages && !isLoadingMore) {
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages]);

  const handleSendMessage = async () => {
    if (!message.trim() && fileUploadState.files.length === 0) return;

    const newMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID for optimistic update
      message: message.trim(),
      sender: `${user?.firstName} ${user?.lastName}` || 'Current User',
      sender_id: user?.userId || '',
      created_at: new Date().toISOString(),
      user_info: {
        sender_id: user?.userId,
        user_name: `${user?.firstName} ${user?.lastName}` || 'Current User',
      }
    };

    // Clear the message input immediately for better UX
    setMessage('');
    setIsSending(true);

    try {
      // If there are files to upload, upload them first
      if (fileUploadState.files.length > 0) {
        setFileUploadState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));
        
        // Create the message first to get the message ID
        const response = await addMessageMutation.mutateAsync({
          referralId: referral.referral_id,
          requestBody: {
            message: newMessage.message,
            sender: newMessage.sender,
            sender_id: newMessage.sender_id,
            user_info: newMessage.user_info
          }
        });

        const realMessageId = response.referrals_messages_id || response.id || newMessage.id;
        
        try {
          // Upload attachments
          const uploadResponse = await uploadAttachmentsMutation.mutateAsync({
            messageId: realMessageId,
            files: fileUploadState.files,
            documentCategory: 'message_attachment'
          });

          // Use the server response to get the correct attachment data
          const serverAttachments = uploadResponse.document_records || [];
          
          // Add the message with attachments to local state after upload is complete
          const updatedMessage = {
            ...newMessage,
            id: realMessageId,
            attachments: serverAttachments.map((doc: any) => ({
              id: doc.document_id,
              filename: doc.filename,
              type: doc.type || 'application/octet-stream',
              signed_url: doc.source,
            }))
          };
          
          setLocalMessages(prev => [...prev, updatedMessage]);
          setDisplayedMessages(prev => [...prev, updatedMessage]);
        } catch (uploadError) {
          console.error('Failed to upload attachments:', uploadError);
          // Add the message without attachments if upload failed
          const updatedMessage = {
            ...newMessage,
            id: realMessageId
          };
          setLocalMessages(prev => [...prev, updatedMessage]);
          setDisplayedMessages(prev => [...prev, updatedMessage]);
        } finally {
          setFileUploadState({ files: [], isUploading: false, uploadProgress: 0 });
        }
      } else {
        // No files to upload, just send the message
        const response = await addMessageMutation.mutateAsync({
          referralId: referral.referral_id,
          requestBody: {
            message: newMessage.message,
            sender: newMessage.sender,
            sender_id: newMessage.sender_id,
            user_info: newMessage.user_info
          }
        });

        const realMessageId = response.referrals_messages_id || response.id || newMessage.id;
        
        // Add the message to local state
        const updatedMessage = {
          ...newMessage,
          id: realMessageId
        };
        setLocalMessages(prev => [...prev, updatedMessage]);
        setDisplayedMessages(prev => [...prev, updatedMessage]);
      }

      if (onSendMessage) {
        onSendMessage(newMessage.message);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // You might want to show a toast notification here
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setFileUploadState(prev => ({
        ...prev,
        files: [...prev.files, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFileUploadState(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (msg: Message) => {
    const isCurrentUser = msg.sender_id === user?.userId;
    const messageAlignment = isCurrentUser ? 'ml-auto' : 'mr-auto';
    const messageBgColor = isCurrentUser ? 'bg-blue-600 text-white' : 'bg-blue-50 border border-blue-200';
    const textColor = isCurrentUser ? 'text-white' : 'text-gray-800';
    const senderTextColor = isCurrentUser ? 'text-blue-100' : 'text-gray-900';
    const dateTextColor = isCurrentUser ? 'text-blue-200' : 'text-gray-500';
    const typeTextColor = isCurrentUser ? 'text-blue-200' : 'text-gray-600';
    const badgeColor = isCurrentUser ? 'bg-white text-blue-600' : 'bg-gray-800 text-white';

    const handleAttachmentClick = (attachment: any) => {
      if (attachment.signed_url) {
        window.open(attachment.signed_url, '_blank');
      }
    };

    return (
      <div key={msg.id} className={`${messageBgColor} rounded-lg p-4 min-w-[100px] w-fit ${messageAlignment}`}>
        <div className="flex justify-between items-start">
          <div className="flex flex-row gap-3">
            <p className={`font-medium ${senderTextColor}`}>{msg.sender}</p>
            <p className={`text-sm ${typeTextColor}`}></p>
          </div>
          <p className={`text-sm ${dateTextColor}`}>{formatDate(msg.created_at)}</p>
        </div>
        <div className="mt-3 rounded-lg">
          <p className={textColor}>{msg.message}</p>
        </div>
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {msg.attachments.map((attachment, index) => {
              // Handle both server and local attachment structures
              const filename = attachment.filename || attachment.name || `File ${index + 1}`;
              const fileType = attachment.type || attachment.content_type || 'application/octet-stream';
              const signedUrl = attachment.signed_url || attachment.url;
              
              return (
                <Badge 
                  key={attachment.id || attachment.document_id || index} 
                  className={`${badgeColor} flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => handleAttachmentClick(attachment)}
                >
                  {fileType.startsWith('image/') ? (
                    <FileText className="h-3 w-3" />
                  ) : (
                    <Paperclip className="h-3 w-3" />
                  )}
                  {filename}
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Communication History</CardTitle>
        <CardDescription>Messages and referral letters</CardDescription>
      </CardHeader>
      <CardContent 
        className="flex-1 overflow-y-scroll max-h-[calc(80vh-350px)]"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        <div className="space-y-4">
          {/* Loading more messages indicator */}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">Loading more messages...</span>
            </div>
          )}

          {isLoadingMessages ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading messages...</span>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-4">
              Failed to load messages. Please try again.
            </div>
          ) : displayedMessages.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            displayedMessages.map(renderMessage)
          )} 
    
          {/* Scroll anchor for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full">
          {/* File upload area */}
          {fileUploadState.files.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Attachments ({fileUploadState.files.length})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFileUploadState({ files: [], isUploading: false, uploadProgress: 0 })}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {fileUploadState.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload progress */}
          {fileUploadState.isUploading && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700">Uploading attachments...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${fileUploadState.uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

 
          <div className="flex gap-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-blue-200 text-blue-600"
              onClick={() => fileInputRef.current?.click()}
              disabled={fileUploadState.isUploading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
            <Input 
              placeholder="Type your message..." 
              className="flex-1"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending || fileUploadState.isUploading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={(!message.trim() && fileUploadState.files.length === 0) || isSending || fileUploadState.isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSending || fileUploadState.isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="*/*"
      />
    </Card>
  );
};

export default CommunicationTab; 