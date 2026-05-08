'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, RotateCcw } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'How much protein should I eat to build muscle?',
  'What is RPE and how do I use it?',
  'How long should I rest between strength sets?',
  'What are the best foods to eat before training?',
  'How do I programme a deload week?',
  'What causes DOMS and how do I recover faster?',
]

export default function AskBodyologyPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const userText = text ?? input.trim()
    if (!userText || loading) return
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setLoading(true)

    const assistantMessage: Message = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMessage])

    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages }),
    })

    if (!res.body) { setLoading(false); return }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: updated[updated.length - 1].content + chunk,
        }
        return updated
      })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" aria-hidden="true" />
            <h1 className="text-xl font-medium">Ask Bodyology</h1>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">AI-powered fitness and nutrition guidance</p>
        </div>
        {messages.length > 0 && (
          <button className="btn-ghost" onClick={() => setMessages([])}>
            <RotateCcw size={12} aria-hidden="true" /> New chat
          </button>
        )}
      </div>

      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center pb-8">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-4">
            <Sparkles size={20} className="text-purple-400" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">What would you like to know?</p>
          <p className="text-xs text-gray-400 mb-6">Ask anything about training, nutrition, or recovery.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-left px-3 py-2.5 rounded-lg border border-gray-100 bg-white hover:border-purple-200 hover:bg-purple-50 text-xs text-gray-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex-1 flex flex-col gap-4 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-purple-400" aria-hidden="true" />
                </div>
              )}
              <div className={`max-w-[82%] px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-teal-400 text-white rounded-tr-sm'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
              }`}>
                {msg.content}
                {loading && i === messages.length - 1 && msg.role === 'assistant' && msg.content === '' && (
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="sticky bottom-0 bg-gray-50 pb-2 pt-3">
        <div className="flex gap-2 bg-white border border-gray-200 rounded-xl p-1.5">
          <input
            className="flex-1 px-2 py-1.5 text-sm outline-none bg-transparent placeholder-gray-400"
            placeholder="Ask about training, nutrition, recovery…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-lg bg-purple-400 text-white flex items-center justify-center hover:bg-purple-600 transition-colors disabled:opacity-40 flex-shrink-0"
            aria-label="Send"
          >
            <Send size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
