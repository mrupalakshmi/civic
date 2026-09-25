import { BrainCircuit, SendHorizonal, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const starterMessages = [
  { from: 'bot', text: 'Hi! I can help you understand your civic rights, route a complaint, or explain legal terms.' },
]

type AIChatWidgetProps = {
  inline?: boolean
  title?: string
  placeholder?: string
}

export function AIChatWidget({ inline = false, title = 'Nyaya & Civic AI', placeholder = 'Ask about government services...' }: AIChatWidgetProps) {
  const [messages, setMessages] = useState(starterMessages)
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onPrompt = (event: Event) => {
      const customEvent = event as CustomEvent<string>
      const nextValue = customEvent.detail?.trim()
      if (!nextValue) return
      setIsOpen(true)
      setValue(nextValue)
      window.setTimeout(() => {
        void handleSubmit(nextValue)
      }, 0)
    }

    window.addEventListener('yuva-chat-question', onPrompt)
    return () => window.removeEventListener('yuva-chat-question', onPrompt)
  }, [])

  const handleSubmit = async (customValue?: string) => {
    const trimmed = (customValue ?? value).trim()
    if (!trimmed || isLoading) return

    setMessages((current) => [...current, { from: 'user', text: trimmed }])
    setValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = await response.json().catch(() => ({ reply: 'I can help route your civic issue to the right authority.' }))
      setMessages((current) => [
        ...current,
        { from: 'bot', text: data.reply || 'I can help route your civic issue to the right authority.' },
      ])
    } catch (error) {
      console.error(error)
      setMessages((current) => [
        ...current,
        { from: 'bot', text: 'The AI assistant is temporarily unavailable, but you can still report the issue through the citizen portal and the system will route it to the correct department.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (inline) {
    return (
      <div className="w-full rounded-[28px] border border-white/10 bg-slate-950/85 p-4 shadow-[0_0_35px_rgba(168,85,247,0.12)] backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <BrainCircuit className="h-4 w-4 text-cyan-300" />
            <span className="font-medium">{title}</span>
          </div>
          <button className="text-xs uppercase tracking-[0.18em] text-slate-400">Online</button>
        </div>

        <div className="max-h-[420px] space-y-3 overflow-auto pr-1 text-sm">
          {messages.map((message, index) => (
            <div
              key={`${message.from}-${index}`}
              className={`rounded-2xl p-3 ${message.from === 'bot' ? 'bg-violet-500/10 text-violet-100' : 'bg-cyan-500/10 text-cyan-50'}`}
            >
              {message.text}
            </div>
          ))}
          {isLoading ? <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-100">Thinking...</div> : null}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleSubmit()
              }
            }}
            placeholder={placeholder}
            className="flex-1 rounded-full border border-white/10 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <button onClick={() => void handleSubmit()} disabled={isLoading} className="rounded-full bg-cyan-500 p-2 text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
            <SendHorizonal className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          aria-label="Open AI chatbot"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/40 bg-gradient-to-br from-cyan-500 via-violet-500 to-[#641C2A] shadow-[0_0_30px_rgba(34,211,238,0.4)] transition hover:scale-105"
        >
          <BrainCircuit className="h-7 w-7 text-white" />
        </button>
      ) : (
        <div className="fixed bottom-5 right-5 z-50 w-[340px] rounded-[28px] border border-white/10 bg-slate-950/85 p-4 shadow-[0_0_40px_rgba(168,85,247,0.12)] backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <BrainCircuit className="h-4 w-4 text-cyan-300" />
              <span className="font-medium">{title}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs uppercase tracking-[0.18em] text-slate-400">Online</button>
              <button type="button" aria-label="Close AI chatbot" onClick={() => setIsOpen(false)} className="rounded-full border border-white/10 bg-white/5 p-1 text-slate-300 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-48 space-y-3 overflow-auto pr-1 text-sm">
            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}`}
                className={`rounded-2xl p-3 ${message.from === 'bot' ? 'bg-violet-500/10 text-violet-100' : 'bg-cyan-500/10 text-cyan-50'}`}
              >
                {message.text}
              </div>
            ))}
            {isLoading ? <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-100">Thinking...</div> : null}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void handleSubmit()
                }
              }}
              placeholder={placeholder}
              className="flex-1 rounded-full border border-white/10 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <button onClick={() => void handleSubmit()} disabled={isLoading} className="rounded-full bg-cyan-500 p-2 text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
              <SendHorizonal className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
