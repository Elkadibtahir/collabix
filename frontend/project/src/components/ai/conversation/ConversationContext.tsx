import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ConversationContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  contextPanelOpen: boolean;
  setContextPanelOpen: (open: boolean) => void;
  toggleContextPanel: () => void;
  streaming: boolean;
  setStreaming: (v: boolean) => void;
}

const ConversationContext = createContext<ConversationContextValue | null>(null);

export function useConversationContext() {
  const ctx = useContext(ConversationContext);
  if (!ctx) throw new Error('useConversationContext must be used within ConversationLayout');
  return ctx;
}

export function ConversationContextProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const toggleContextPanel = useCallback(() => setContextPanelOpen((v) => !v), []);

  return (
    <ConversationContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        contextPanelOpen,
        setContextPanelOpen,
        toggleContextPanel,
        streaming,
        setStreaming,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
