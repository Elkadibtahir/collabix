export type ConversationType = 'WORKSPACE' | 'DEPARTMENT' | 'TEAM' | 'DIRECT';
export type MessageType = 'TEXT' | 'SYSTEM' | 'FILE' | 'IMAGE';
export type MessageStatus = 'ACTIVE' | 'EDITED' | 'DELETED';

export interface ConversationResponse {
  id: string;
  workspaceId: string;
  name: string;
  topic?: string;
  type: ConversationType;
  departmentId?: string;
  teamId?: string;
  isPrivate: boolean;
  isArchived: boolean;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  memberCount: number;
  unreadCount: number;
}

export interface CreateConversationRequest {
  name: string;
  topic?: string;
  type: ConversationType;
  departmentId?: string;
  teamId?: string;
  isPrivate?: boolean;
  memberIds?: string[];
}

export interface UpdateConversationRequest {
  name?: string;
  topic?: string;
  isArchived?: boolean;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  senderFirstName: string;
  senderLastName: string;
  senderProfilePicture?: string;
  parentMessageId?: string;
  content: string;
  messageType: MessageType;
  status: MessageStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isPinned: boolean;
  mentions?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateMessageRequest {
  content: string;
  messageType?: MessageType;
  parentMessageId?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isPinned?: boolean;
  mentions?: string;
}

export interface UpdateMessageRequest {
  content?: string;
  isPinned?: boolean;
}

export interface ConversationMemberResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  role: string;
  joinedAt: string;
  lastReadAt?: string;
}
