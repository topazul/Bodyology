'use client'
import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/types'

interface Props {
  coachClientId: string
  currentUserId: string
  otherName: string
}

export default function MessageThread({ coachClientId, currentUserId, otherName }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(full_name)')
      .eq('coach_client_id', coachClientId)
      .order('sent_at', { ascending: true })
      .then(({ data }) => {
        setMessages((data ?? []) as Message[])
        setTimeout(() => bottomRef.current?.scrollIntoView(), 50)
      })

    const channel = supabase
      .channel(`messages:${coachClientId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `coach_client_id=eq.${coachClientId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [coachClientId])

  async function send() {
    const text = input.trim()
    if (!text) return
    setInput('')
    setSending(true)
    await supabase.from('messages').insert({
      coach_client_id: coachClientId,
      sender_id: currentUserId,
      body: text,
    })
    setSending(false)
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{otherName}</span>
        <span className="text-xs text-gray-400">Messages</span>
      </div>
      <div className="flex flex-col gap-2 p-3 max-h-48 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-xs text-gray-300 text-center py-4">No messages yet. Say hello!</p>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed max-w-[80%] ${
                isMe
                  ? 'bg-teal-400 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                {msg.body}
              </div>
              <span className="text-[10px] text-gray-300 mt-0.5 px-1">
                {new Date(msg.sent_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-gray-100 p-2 flex gap-2">
        <input
          className="input flex-1 text-xs py-1.5"
          placeholder={`Message ${otherName}…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="w-7 h-7 rounded-lg bg-teal-400 text-white flex items-center justify-center hover:bg-teal-600 transition-colors disabled:opacity-40"
          aria-label="Send"
        >
          <Send size={12} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
