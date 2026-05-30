'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { WsServerMessage } from '@/types/api'

export interface DetectedStudent {
  id: number
  name: string
  similarity: number
}

interface UseWebSocketOptions {
  courseId: number
  onStudentDetected: (student: DetectedStudent) => void
  onStatusChange: (msg: string, type: 'info' | 'error') => void
}

export function useWebSocket({
  courseId,
  onStudentDetected,
  onStatusChange,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connect = useCallback(() => {
    const wsUrl = typeof window !== 'undefined'
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/attendance/`
      : 'ws://127.0.0.1:8000/ws/attendance/'
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      onStatusChange('Connected to server', 'info')
    }

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data: WsServerMessage = JSON.parse(event.data as string)
        if (data.type === 'student_detected') {
          onStudentDetected(data.student)
        } else if (data.type === 'error') {
          onStatusChange(data.message, 'error')
        }
        // stream_started / stream_stopped are acks — no UI action needed
      } catch {
        // ignore malformed messages
      }
    }

    ws.onerror = () => {
      onStatusChange('Connection error', 'error')
    }

    ws.onclose = () => {
      setIsConnected(false)
      onStatusChange('Disconnected', 'info')
    }
  }, [onStudentDetected, onStatusChange])

  const startStream = useCallback(() => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: 'start_stream', courseid: courseId }))
  }, [courseId])

  const sendFrame = useCallback((dataUrl: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: 'frame', data: dataUrl }))
  }, [])

  const stopStream = useCallback(() => {
    const ws = wsRef.current
    if (!ws) return
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'stop_stream' }))
    }
    ws.close()
    wsRef.current = null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [])

  return { isConnected, connect, startStream, sendFrame, stopStream }
}
