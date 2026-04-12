'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Plane } from 'lucide-react'
import { DeltaJob } from '@/lib/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AdvisorPanelProps {
  jobs: DeltaJob[]
  onClose: () => void
}

const ADVISOR_SYSTEM = `You are Captain Advisor, an expert Delta Air Lines career coach and aviation professional.

You have deep knowledge of:
- Delta Air Lines career pathways from regional FO to Delta Captain
- ATP certificate requirements and the 1,500-hour rule
- Delta Propel program (regional airline partnerships)
- Specific regional partners: SkyWest, Endeavor Air, GoJet, Republic, Mesa, PSA, Piedmont
- First Officer (FO) requirements at Delta: ATP, 1,500 TT, 1,000 multi-engine, type rating
- Delta Captain upgrade timeline: typically 7–15 years depending on seniority
- DPE (Designated Pilot Examiner) credentials — FAA designation, practical test standards, examiner renewal
- CMEL, CSEL, CFI, CFII, MEI ratings and their career value
- Airline seniority systems and how they affect pay, schedule, base, and equipment
- Delta pay scales: FO Year 1 ~$91/hr to Captain Year 12+ ~$349/hr (B-757/767/A330 widebody)
- ALPA (Air Line Pilots Association) contract specifics
- Flight hour building strategies: CFI, charter, cargo, regional airlines
- FAA medical certificate classes and requirements
- CRM (Crew Resource Management) and airline interview preparation
- Delta's hiring minimums and competitive applicants typically have 3,000+ TT, 1,000+ multi

When analyzing job pipeline data, look for:
- Regional airline positions that build toward Delta minimums
- Aviation companies with clear upgrade paths
- Jobs that offer multi-engine turbine time
- Positions with strong ALPA contracts
- Companies on Delta's Propel preferred list

Always be specific, actionable, and encouraging. Use your aviation knowledge to give real strategic advice.`

const QUICK_PROMPTS = [
  '✈ What should I focus on next to reach Delta minimums?',
  '📋 Analyze my current pipeline — what jobs are highest priority?',
  '🎯 Which regional airline partner gives the fastest path to Delta?',
  '💰 What\'s the realistic income timeline from regional FO to Delta Captain?',
  '📚 What ratings should I get next for my DPE credentials roadmap?',
  '🏆 How do I make my Delta application most competitive?',
]

function buildContext(jobs: DeltaJob[]): string {
  if (!jobs.length) return 'No jobs in pipeline yet.'
  const summary = jobs.slice(0, 20).map(j =>
    `- ${j.title} @ ${j.company || 'Unknown'} (${j.status}, score: ${j.score ?? 'N/A'}${j.pay_rate ? ', pay: ' + j.pay_rate : ''})`
  ).join('\n')
  const counts: Record<string, number> = {}
  jobs.forEach(j => { counts[j.status] = (counts[j.status] || 0) + 1 })
  const breakdown = Object.entries(counts).map(([s, n]) => `${s}: ${n}`).join(', ')
  return `Pipeline (${jobs.length} jobs): ${breakdown}\n\nTop listings:\n${summary}`
}

export function AdvisorPanel({ jobs, onClose }: AdvisorPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Good day, I'm Captain Advisor — your personal Delta career coach. I have full visibility into your job pipeline and I'm ready to help you chart the fastest course to the left seat at Delta.\n\nWhat can I help you with today?`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    const pipelineContext = buildContext(jobs)
    const userMessage: Message = { role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const history = [...messages, userMessage]
      const ollamaMessages = [
        { role: 'system', content: `${ADVISOR_SYSTEM}\n\nCurrent pipeline context:\n${pipelineContext}` },
        ...history.map(m => ({ role: m.role, content: m.content })),
      ]

      const res = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          messages: ollamaMessages,
          stream: false,
        }),
      })

      if (!res.ok) throw new Error(`Ollama error: ${res.status}`)
      const data = await res.json()
      const reply = data.message?.content ?? 'No response received.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Could not reach Ollama (localhost:11434). Make sure Ollama is running with `ollama serve` and a model is installed (e.g. `ollama pull llama3`).',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-950 border-l border-gray-800 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-blue-950/40">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-white">Captain Advisor</p>
              <p className="text-xs text-blue-400">Delta Career Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 px-3 py-2 rounded-xl rounded-bl-sm">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => sendMessage(p)}
                className="text-xs px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full border border-gray-700 hover:border-blue-600 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Captain Advisor anything…"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="mb-0.5 p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-gray-600 text-center">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </>
  )
}
