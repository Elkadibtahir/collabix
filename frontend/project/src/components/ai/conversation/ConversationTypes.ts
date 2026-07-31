export interface Conversation {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  pinned: boolean;
  favorite: boolean;
  unread: boolean;
}

export interface MessageAI {
  id: string;
  role: 'ai';
  content: string;
  timestamp: string;
  liked?: boolean;
  disliked?: boolean;
  bookmarked?: boolean;
  followUps?: string[];
}

export interface MessageUser {
  id: string;
  role: 'user';
  content: string;
  timestamp: string;
  edited?: boolean;
}

export interface MessageSystem {
  id: string;
  role: 'system';
  content: string;
  timestamp: string;
  variant?: 'info' | 'warning' | 'error';
}

export type Message = MessageAI | MessageUser | MessageSystem;

export type LoadingState =
  | 'thinking'
  | 'analyzing'
  | 'searching'
  | 'summarizing'
  | 'reviewing'
  | 'generating'
  | 'preparing';

export const LoadingMessages: Record<LoadingState, string> = {
  thinking: 'Thinking...',
  analyzing: 'Analyzing...',
  searching: 'Searching knowledge...',
  summarizing: 'Generating summary...',
  reviewing: 'Reviewing documentation...',
  generating: 'Creating executive report...',
  preparing: 'Preparing recommendations...',
};

export type ErrorType = 'generation_failed' | 'connection_lost' | 'timeout' | 'unexpected' | 'unavailable';

export interface ConversationError {
  type: ErrorType;
  title: string;
  description: string;
  canRetry: boolean;
  canDismiss: boolean;
}

export const ErrorConfig: Record<ErrorType, Omit<ConversationError, 'type'>> = {
  generation_failed: {
    title: 'Generation Failed',
    description: 'The AI was unable to generate a response. Please try again.',
    canRetry: true,
    canDismiss: true,
  },
  connection_lost: {
    title: 'Connection Lost',
    description: 'Your connection to Collabix AI was interrupted. Please check your network.',
    canRetry: true,
    canDismiss: false,
  },
  timeout: {
    title: 'Request Timeout',
    description: 'The request took too long to complete. Please try again.',
    canRetry: true,
    canDismiss: true,
  },
  unexpected: {
    title: 'Unexpected Error',
    description: 'Something went wrong. Please try again or contact support.',
    canRetry: true,
    canDismiss: true,
  },
  unavailable: {
    title: 'Service Unavailable',
    description: 'Collabix AI is temporarily unavailable. Please try again later.',
    canRetry: true,
    canDismiss: false,
  },
};
