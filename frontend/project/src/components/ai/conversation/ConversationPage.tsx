import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConversationComposer } from './ConversationComposer';
import { ConversationWelcome } from './ConversationWelcome';

export function ConversationPage() {
  const navigate = useNavigate();

  const handleStartConversation = () => {
    const newId = `conv-${Date.now()}`;
    navigate(`/app/ai/chat/${newId}`);
  };

  const handlePromptClick = (prompt: string) => {
    const newId = `conv-${Date.now()}`;
    navigate(`/app/ai/chat/${newId}`);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <ConversationWelcome
          onStartConversation={handleStartConversation}
          onPromptClick={handlePromptClick}
        />
      </div>
      <ConversationComposer
        onSend={handlePromptClick}
        suggestedPrompts={undefined}
      />
    </div>
  );
}
