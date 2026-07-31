import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ConversationHeader } from './ConversationHeader';
import { ConversationComposer } from './ConversationComposer';
import { ConversationMessages } from './ConversationMessages';
import { ConversationStreaming } from './ConversationStreaming';
import { ConversationLoadingThinking } from './ConversationLoading';
import { ConversationErrorCard } from './ConversationErrorCard';
import { ConversationEmptyState } from './ConversationEmptyStates';
import { useConversationContext } from './ConversationContext';
import type { Message, ErrorType, LoadingState } from './ConversationTypes';

interface OutletContext {
  toggleContextPanel: () => void;
  contextPanelOpen: boolean;
}

export function ConversationChatView() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { toggleContextPanel, contextPanelOpen } = useOutletContext<OutletContext>();
  const { streaming, setStreaming } = useConversationContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<LoadingState | null>(null);
  const [error, setError] = useState<ErrorType | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!conversationId) return;
    setMessages([]);
    setTitle('Conversation');
    setFavorite(false);
    setError(null);
    setLoading(null);
    setStreaming(false);
  }, [conversationId, setStreaming]);

  const handleSend = useCallback((content: string) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, newMsg]);
    setLoading('thinking');
    setError(null);
    setTimeout(() => {
      setLoading(null);
      setStreaming(false);
    }, 3000);
  }, [setStreaming]);

  const handleStopGeneration = useCallback(() => {
    setLoading(null);
    setStreaming(false);
  }, [setStreaming]);

  const handleCopy = useCallback((id: string, content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  const handleRegenerate = useCallback((id: string) => {
    setLoading('generating');
    setError(null);
    setTimeout(() => {
      setLoading(null);
    }, 2000);
  }, []);

  const handleLike = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => m.role === 'ai' && m.id === id ? { ...m, liked: !m.liked, disliked: false } : m),
    );
  }, []);

  const handleDislike = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => m.role === 'ai' && m.id === id ? { ...m, disliked: !m.disliked, liked: false } : m),
    );
  }, []);

  const handleBookmark = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => m.role === 'ai' && m.id === id ? { ...m, bookmarked: !m.bookmarked } : m),
    );
  }, []);

  const handleContinueConversation = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        role: 'ai',
        content: 'I\'d be happy to continue. What would you like to explore further?',
        timestamp: 'Just now',
        followUps: [],
      },
    ]);
  }, []);

  const handleFollowUpSelect = useCallback((id: string, question: string) => {
    handleSend(question);
  }, [handleSend]);

  const handleRename = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const handleDelete = useCallback(() => {
    navigate('/app/ai/chat');
  }, [navigate]);

  const handleFollowUpQuestion = useCallback((question: string) => {
    handleSend(question);
  }, [handleSend]);

  const handleErrorRetry = useCallback(() => {
    setError(null);
    setLoading('thinking');
    setTimeout(() => {
      setLoading(null);
    }, 2000);
  }, []);

  const handleErrorDismiss = useCallback(() => {
    setError(null);
  }, []);

  const getTimestamp = () => {
    const h = new Date().getHours();
    return `${h}:${String(new Date().getMinutes()).padStart(2, '0')}`;
  };

  const hasMessages = messages.length > 0 || loading !== null || error !== null;

  return (
    <div className="flex h-full flex-col">
      {hasMessages ? (
        <>
          <ConversationHeader
            title={title}
            updatedAt={messages[0]?.timestamp || 'Just now'}
            favorite={favorite}
            onRename={handleRename}
            onToggleFavorite={() => setFavorite(!favorite)}
            onDelete={handleDelete}
            onToggleContextPanel={toggleContextPanel}
            contextPanelOpen={contextPanelOpen}
          />

          <ConversationMessages
            messages={messages}
            onCopy={handleCopy}
            onRegenerate={handleRegenerate}
            onLike={handleLike}
            onDislike={handleDislike}
            onBookmark={handleBookmark}
            onContinueConversation={handleContinueConversation}
            onFollowUpSelect={handleFollowUpSelect}
          />

          {loading && <ConversationLoadingThinking state={loading} />}
          {error && (
            <div className="px-4 sm:px-6 py-4">
              <ConversationErrorCard type={error} onRetry={handleErrorRetry} onDismiss={handleErrorDismiss} />
            </div>
          )}
          {streaming && <ConversationStreaming visible={streaming} onStop={handleStopGeneration} />}

          <ConversationComposer
            onSend={handleSend}
            onStopGeneration={handleStopGeneration}
            streaming={streaming || loading !== null}
            suggestedPrompts={undefined}
          />
        </>
      ) : (
        <ConversationEmptyState variant="no-messages" onAction={() => {}} />
      )}
    </div>
  );
}
