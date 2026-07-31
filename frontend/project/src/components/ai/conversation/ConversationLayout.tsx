import { useState, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { ConversationSidebar } from './ConversationSidebar';
import { ConversationContextPanel } from './ConversationContextPanel';
import { ConversationContextProvider, useConversationContext } from './ConversationContext';
import type { Conversation } from './ConversationTypes';

function ConversationLayoutInner() {
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen, contextPanelOpen, toggleContextPanel } = useConversationContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const handleNewConversation = useCallback(() => {
    navigate('/app/ai/chat');
    setSidebarOpen(false);
  }, [navigate, setSidebarOpen]);

  const handleTogglePin = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    );
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)),
    );
  }, []);

  return (
    <div className="flex gap-0 xl:gap-5 h-full">
      <ConversationSidebar
        conversations={conversations}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewConversation={handleNewConversation}
        onTogglePin={handleTogglePin}
        onToggleFavorite={handleToggleFavorite}
      />

      <div className="flex flex-1 min-w-0 flex-col rounded-xl border border-border-subtle bg-elevated dark:bg-surface overflow-hidden h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle xl:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open conversation sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2 transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Sparkles className="h-4 w-4 text-accent-600" />
          <p className="text-caption font-medium text-text-primary">Conversations</p>
        </div>
        <Outlet context={{ toggleContextPanel, contextPanelOpen }} />
      </div>

      <ConversationContextPanel open={contextPanelOpen} onClose={() => toggleContextPanel()} />
    </div>
  );
}

export function ConversationLayout() {
  return (
    <ConversationContextProvider>
      <ConversationLayoutInner />
    </ConversationContextProvider>
  );
}
