'use client'

import React, { useEffect, useState } from 'react'
import { MessageCenter } from '@/components/Messages/MessageCenter'
import { ConversationsList } from '@/components/Messages/ConversationsList'
import { createWs } from '@/lib/ws'
import apiClient from '@/lib/api'

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)

  useEffect(() => {
    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000') + '/ws/conversations'
    const ws = createWs(wsUrl)
    ws.onMessage((evt) => {
      if (evt?.type === 'message.new') {
        setMessages((prev: any) => [evt.payload, ...prev])
      }
    })
    return () => ws.close()
  }, [])
  
  useEffect(() => {
    const load = async () => {
      try {
        const conv = await apiClient.getConversations()
        setConversations(conv)
        if (conv.length) setActiveConversationId(conv[0].id)
      } catch {}
    }
    load()
  }, [])

  useEffect(() => {
    const loadMsgs = async () => {
      if (!activeConversationId) return
      try {
        const msgs = await apiClient.getConversationMessages(activeConversationId)
        setMessages(msgs as any)
      } catch {}
    }
    loadMsgs()
  }, [activeConversationId])
  return (
    <div className="h-[calc(100vh-160px)] bg-white rounded-lg shadow-sm border flex">
      <ConversationsList
        conversations={conversations as any}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
      />
      <div className="flex-1">
        <MessageCenter
          messages={messages as any}
          onReply={async (_id, reply) => {
            if (!activeConversationId) return
            await apiClient.sendMessage(activeConversationId, reply)
          }}
          onMarkAsRead={async (id) => {
            const numericId = Number(id)
            if (!Number.isNaN(numericId)) await apiClient.markMessageRead(numericId)
          }}
        />
      </div>
    </div>
  )
}


