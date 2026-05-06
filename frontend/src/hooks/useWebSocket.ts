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
  onFrameUpdate: (frame: string) => void
  onStatusChange: (msg: string, type: 'info' | 'error') => void
}

export function useWebSocket({
  courseId,
  onStudentDetected,
  onFrameUpdate,
  onStatusChange,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connect = useCallback(() => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL ?? 'ws://127.0.0.1:8000'}/ws/attendance/`
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
          onFrameUpdate(data.frame)
        } else if (data.type === 'frame_update' || data.type === 'no_detected') {
          onFrameUpdate(data.frame)
        } else if (data.type === 'error') {
          onStatusChange(data.message, 'error')
        }
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
  }, [courseId, onStudentDetected, onFrameUpdate, onStatusChange])

  const startStream = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: 'start_stream', courseid: courseId }))
  }, [courseId])

  const stopStream = useCallback(() => {
    if (!wsRef.current) return
    wsRef.current.send(JSON.stringify({ type: 'stop_stream' }))
    wsRef.current.close()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close()
    }
  }, [])

  return { isConnected, connect, startStream, stopStream }
}
