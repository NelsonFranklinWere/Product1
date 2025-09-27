import React from 'react'

interface ConversationItem {
  id: number
  title?: string
  contact_name?: string
  source_platform?: string
  last_message?: string
}

export function ConversationsList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: ConversationItem[]
  activeId: number | null
  onSelect: (id: number) => void
}) {
  const getPlatformBadge = (platform?: string) => {
    const map: Record<string, string> = {
      facebook: 'bg-blue-100 text-blue-800',
      whatsapp: 'bg-green-100 text-green-800',
    }
    return map[platform || ''] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="w-80 border-r h-full overflow-auto">
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`w-full text-left p-3 border-b hover:bg-gray-50 ${
            activeId === c.id ? 'bg-gray-100' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs rounded ${getPlatformBadge(c.source_platform)}`}>
              {c.source_platform || 'unknown'}
            </span>
            <span className="font-medium text-sm">{c.contact_name || c.title || `Conversation #${c.id}`}</span>
          </div>
          {c.last_message && (
            <div className="text-xs text-gray-500 mt-1 truncate">{c.last_message}</div>
          )}
        </button>
      ))}
    </div>
  )
}


