export const runtime = 'nodejs'

import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are the Bodyology AI assistant — a knowledgeable, concise, and encouraging fitness and nutrition expert built into the Bodyology coaching platform.

You help both coaches and clients with:
- Exercise technique, programming, and periodisation
- Nutrition, macros, meal timing, and supplementation
- Recovery, sleep, and injury prevention
- Goal setting and progress tracking
- Understanding training concepts (RPE, 1RM, progressive overload, etc.)

Guidelines:
- Keep answers practical and actionable
- Use clear, plain language — avoid unnecessary jargon
- Always recommend consulting a medical professional for injury or health concerns
- Never prescribe specific medical treatment
- Be encouraging and supportive
- If a question is outside fitness/nutrition/health, politely redirect
- Keep responses focused and concise — bullet points work well for lists`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages } = await req.json()

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}