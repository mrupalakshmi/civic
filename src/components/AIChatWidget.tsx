import { BrainCircuit, SendHorizonal } from 'lucide-react'
import { useState } from 'react'

const starterMessages = [
  { from: 'bot', text: 'Hi! I can help you understand your civic rights, route a complaint, or explain legal terms.' },
]

export function AIChatWidget() {
  const [messages, setMessages] = useState(starterMessages)
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (!value.trim()) return

    setMessages((current) => [...current, { from: 'user', text: value }])
    setValue('')

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          from: 'bot',
          text: 'For this issue, the relevant authority is the Municipal Roads Department. You can track the complaint in your dashboard and receive updates once it is reviewed.',
        },
      ])
    }, 350)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[340px] rounded-[28px] border border-white/10 bg-slate-950/85 p-4 shadow-[0_0_40px_rgba(168,85,247,0.12)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <BrainCircuit className="h-4 w-4 text-cyan-300" />
          <span className="font-medium">Nyaya & Civic AI</span>
        </div>
        <button className="text-xs uppercase tracking-[0.18em] text-slate-400">Online</button>
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
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask about government services..."
          className="flex-1 rounded-full border border-white/10 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
        />
        <button onClick={handleSubmit} className="rounded-full bg-cyan-500 p-2 text-slate-950">
          <SendHorizonal className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
