'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { apiClient } from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Conversation, Message, Product } from '@/types'

type Props = {
  conversations: Conversation[]
  onConversationsUpdate: (conversations: Conversation[]) => void
}

export function CommunicationsHub({ conversations, onConversationsUpdate }: Props) {
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [composer, setComposer] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isSharingProduct, setIsSharingProduct] = useState(false)

  const { lastMessage, joinConversation, sendMessage, sendTypingIndicator } = useWebSocket()
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === activeConversationId) || null
  }, [conversations, activeConversationId])

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [convs, prods] = await Promise.all([
          apiClient.getConversations(),
          apiClient.getProducts(),
        ])
        onConversationsUpdate(convs)
        setProducts(prods)
        if (convs.length && activeConversationId == null) {
          setActiveConversationId(convs[0].id)
        }
      } catch (e) {
        console.error('Failed to load initial data', e)
      }
    }
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConversationId) return
      try {
        const msgs = await apiClient.getConversationMessages(activeConversationId)
        // API returns newest first; ensure chronological ASC for rendering
        setMessages([...msgs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()))
        joinConversation(activeConversationId)
      } catch (e) {
        console.error('Failed to load messages', e)
      }
    }
    loadMessages()
  }, [activeConversationId, joinConversation])

  useEffect(() => {
    if (!lastMessage) return
    if (lastMessage.type === 'new_message') {
      const { conversation_id, message } = lastMessage as any
      if (conversation_id === activeConversationId) {
        setMessages(prev => [...prev, message])
      }
      // bump conversation ordering/unread counts (simplified)
      onConversationsUpdate(
        conversations.map(c => c.id === conversation_id ? { ...c, last_message_at: new Date().toISOString(), unread_count: c.id === activeConversationId ? 0 : (c.unread_count || 0) + 1 } : c)
      )
    }
    if (lastMessage.type === 'recent_conversations') {
      const { conversations: recent } = lastMessage as any
      // merge by id, prefer existing extra fields
      const byId: Record<number, Conversation> = {}
      ;[...conversations, ...recent].forEach((c: Conversation) => { byId[c.id] = { ...byId[c.id], ...c } })
      onConversationsUpdate(Object.values(byId))
    }
    if (lastMessage.type === 'payment_notification') {
      // could toast or append system message
      if (activeConversationId) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: `Payment ${lastMessage.status} - KES ${lastMessage.amount} (${lastMessage.receipt_number || ''})`,
          direction: 'inbound',
          message_type: 'text',
          timestamp: new Date().toISOString(),
          is_read: false,
          is_delivered: true,
          metadata: { event: 'payment_notification' }
        } as unknown as Message])
      }
    }
  }, [lastMessage, activeConversationId, conversations, onConversationsUpdate])

  const handleSend = async () => {
    if (!activeConversationId || !composer.trim() || isSending) return
    const text = composer.trim()
    setIsSending(true)
    try {
      // optimistic render
      const tempId = Date.now()
      setMessages(prev => [...prev, {
        id: tempId,
        text,
        direction: 'outbound',
        message_type: 'text',
        timestamp: new Date().toISOString(),
        is_read: true,
        is_delivered: true,
        metadata: { optimistic: true }
      } as unknown as Message])
      setComposer('')

      // via REST to persist
      await apiClient.sendMessage(activeConversationId, text, 'text')
      // via WS to broadcast; backend will no-op if redundant
      sendMessage({ type: 'send_message', conversation_id: activeConversationId, message: text, message_type: 'text' })
    } catch (e) {
      console.error('Send failed', e)
    } finally {
      setIsSending(false)
    }
  }

  const handleShareProduct = async (productId: number) => {
    if (!activeConversationId) return
    try {
      setIsSharingProduct(true)
      await apiClient.shareProduct(productId, activeConversationId)
      const product = products.find(p => p.id === productId)
      if (product) {
        const snippet = `${product.name} - KES ${product.price}\n${product.description}`
        setComposer(prev => prev ? `${prev}\n\n${snippet}` : snippet)
      }
    } catch (e) {
      console.error('Share product failed', e)
    } finally {
      setIsSharingProduct(false)
    }
  }

  const handleRequestPayment = async () => {
    if (!activeConversationId || !activeConversation) return
    try {
      const amount = prompt('Enter amount (KES)')
      if (!amount) return
      const parsed = Number(amount)
      if (!Number.isFinite(parsed) || parsed <= 0) return
      const { checkout_request_id } = await apiClient.requestPaymentFromConversation(activeConversationId, { amount: parsed })
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Payment request sent. CheckoutRequestID: ${checkout_request_id}`,
        direction: 'outbound',
        message_type: 'text',
        timestamp: new Date().toISOString(),
        is_read: true,
        is_delivered: true,
        metadata: { event: 'payment_request' }
      } as unknown as Message])
    } catch (e) {
      console.error('Payment request failed', e)
    }
  }

  const onComposerChange = (val: string) => {
    setComposer(val)
    if (!activeConversationId) return
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    sendTypingIndicator(activeConversationId, true)
    typingTimeoutRef.current = setTimeout(() => sendTypingIndicator(activeConversationId, false), 1200)
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
      <aside className="col-span-4 bg-white border rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Conversations</h2>
        </div>
        <div className="overflow-y-auto">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${conv.id === activeConversationId ? 'bg-gray-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{(conv as any).contact_name || 'Customer'}</div>
                  <div className="text-xs text-gray-500 capitalize">{conv.source_platform}</div>
                </div>
                {conv.unread_count ? (
                  <span className="text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">{conv.unread_count}</span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="col-span-8 bg-white border rounded-lg flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="font-semibold">{(activeConversation as any)?.contact_name || 'Select a conversation'}</div>
            {activeConversation ? (
              <div className="text-xs text-gray-500 capitalize">{activeConversation.source_platform}</div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                onChange={(e) => e.target.value && handleShareProduct(Number(e.target.value))}
                className="text-sm border rounded px-2 py-1"
                defaultValue=""
                disabled={!activeConversation || isSharingProduct}
              >
                <option value="" disabled>Share product…</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — KES {p.price}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRequestPayment}
              className="text-sm bg-green-600 text-white px-3 py-1.5 rounded disabled:opacity-60"
              disabled={!activeConversation}
            >
              Request Payment
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded px-3 py-2 text-sm ${msg.direction === 'outbound' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                <div className={`mt-1 text-[10px] ${msg.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'}`}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t">
          <div className="flex items-end gap-2">
            <textarea
              value={composer}
              onChange={(e) => onComposerChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder={activeConversation ? 'Type a message…' : 'Select a conversation to start chatting'}
              className="flex-1 border rounded px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              disabled={!activeConversation}
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
              disabled={!activeConversation || !composer.trim() || isSending}
            >
              Send
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}


