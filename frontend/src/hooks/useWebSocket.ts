'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'
import { WebSocketMessage, NewMessageEvent, PaymentNotificationEvent, TypingIndicatorEvent } from '@/types'

export function useWebSocket() {
  const { user, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    const connect = () => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
        const ws = new WebSocket(`${wsUrl}/ws/communications/${user.id}/`)

        ws.onopen = () => {
          console.log('WebSocket connected')
          setIsConnected(true)
          setSocket(ws)
          reconnectAttempts.current = 0
        }

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            setLastMessage(message)
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        ws.onclose = () => {
          console.log('WebSocket disconnected')
          setIsConnected(false)
          setSocket(null)
          
          // Attempt to reconnect
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++
            const delay = Math.pow(2, reconnectAttempts.current) * 1000 // Exponential backoff
            reconnectTimeoutRef.current = setTimeout(connect, delay)
          }
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
        }

      } catch (error) {
        console.error('Error creating WebSocket connection:', error)
      }
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socket) {
        socket.close()
      }
    }
  }, [isAuthenticated, user])

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message))
    }
  }

  const sendTypingIndicator = (conversationId: number, isTyping: boolean) => {
    sendMessage({
      type: 'typing',
      conversation_id: conversationId,
      is_typing: isTyping
    })
  }

  const joinConversation = (conversationId: number) => {
    sendMessage({
      type: 'join_conversation',
      conversation_id: conversationId
    })
  }

  const markMessagesRead = (conversationId: number, messageIds: number[]) => {
    sendMessage({
      type: 'mark_read',
      conversation_id: conversationId,
      message_ids: messageIds
    })
  }

  return {
    socket,
    isConnected,
    lastMessage,
    sendMessage,
    sendTypingIndicator,
    joinConversation,
    markMessagesRead,
  }
}
