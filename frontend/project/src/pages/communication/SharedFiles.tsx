import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Image, File, Download } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/cn';
import { useConversationFiles } from '../../services/message-hooks';
import { useConversationsList } from '../../services/conversation-hooks';
import { Avatar } from '../../components/ui/Avatar';
import { formatRelativeTime, formatFileSize } from '../../lib/format';

export function SharedFiles() {
  const [searchParams] = useSearchParams();
  const wsId = searchParams.get('ws') ?? '';
  const [selectedConvId, setSelectedConvId] = useState<string | undefined>();

  const { data: conversations } = useConversationsList(wsId);
  const { data: filesData, isLoading } = useConversationFiles(wsId, selectedConvId ?? '');

  const files = filesData?.content ?? [];
  const [filter, setFilter] = useState<'all' | 'images' | 'documents'>('all');

  const filteredFiles = files.filter((f) => {
    if (filter === 'images') return f.mimeType?.startsWith('image/');
    if (filter === 'documents') return f.mimeType && !f.mimeType.startsWith('image/');
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={cn('rounded-lg px-3 py-1.5 text-body font-medium transition-colors', filter === 'all' ? 'bg-accent-50 text-accent-700 dark:bg-accent-100 dark:text-accent-200' : 'text-text-tertiary hover:text-text-primary')}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('images')}
            className={cn('rounded-lg px-3 py-1.5 text-body font-medium transition-colors', filter === 'images' ? 'bg-accent-50 text-accent-700 dark:bg-accent-100 dark:text-accent-200' : 'text-text-tertiary hover:text-text-primary')}
          >
            <Image className="mr-1.5 inline h-4 w-4" />
            Images
          </button>
          <button
            type="button"
            onClick={() => setFilter('documents')}
            className={cn('rounded-lg px-3 py-1.5 text-body font-medium transition-colors', filter === 'documents' ? 'bg-accent-50 text-accent-700 dark:bg-accent-100 dark:text-accent-200' : 'text-text-tertiary hover:text-text-primary')}
          >
            <FileText className="mr-1.5 inline h-4 w-4" />
            Documents
          </button>
        </div>
        {conversations && conversations.content.length > 0 && (
          <select
            value={selectedConvId ?? ''}
            onChange={(e) => setSelectedConvId(e.target.value || undefined)}
            className="rounded-lg border border-border-subtle bg-elevated px-3 py-1.5 text-body text-text-primary"
          >
            <option value="">All Channels</option>
            {conversations.content.map((conv) => (
              <option key={conv.id} value={conv.id}>{conv.name}</option>
            ))}
          </select>
        )}
      </div>

      <Card>
        <CardBody>
          {filteredFiles.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="No shared files"
              description="Files shared in conversations will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFiles.map((msg) => (
                <Card key={msg.id}>
                  <CardBody className="p-3">
                    {msg.mimeType?.startsWith('image/') && msg.fileUrl ? (
                      <img src={msg.fileUrl} alt={msg.fileName ?? ''} className="w-full h-32 object-cover rounded-lg mb-2" />
                    ) : (
                      <div className="flex h-32 items-center justify-center rounded-lg bg-surface-2 mb-2">
                        <File className="h-8 w-8 text-text-tertiary" />
                      </div>
                    )}
                    <p className="text-body font-medium text-text-primary truncate">{msg.fileName ?? 'Untitled'}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-2xs text-text-tertiary">
                        {msg.fileSize ? formatFileSize(msg.fileSize) : ''}
                        {' · '}
                        {formatRelativeTime(msg.createdAt)}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => window.open(msg.fileUrl, '_blank')}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-2xs text-text-tertiary">
                      <Avatar
                        name={`${msg.senderFirstName} ${msg.senderLastName}`}
                        src={msg.senderProfilePicture}
                        alt={`${msg.senderFirstName} ${msg.senderLastName}`}
                        size="xs"
                        fallback={`${msg.senderFirstName[0]}${msg.senderLastName[0]}`}
                      />
                      {msg.senderFirstName} {msg.senderLastName}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
