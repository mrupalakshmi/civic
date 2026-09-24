import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Filter,
  Landmark,
  LogOut,
  MapPin,
  Menu,
  MessageSquareText,
  Newspaper,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AIChatWidget } from './components/AIChatWidget'
import { SectionHeader } from './components/SectionHeader'
import {
  caseStudies,
  chartData,
  complaintStats,
  departmentData,
  initialComplaintForm,
  legalTopics,
  mapMarkers,
  newsData,
  notificationSeed,
  transparencyData,
  workflowSteps,
} from './data/mockData'
import { addCommentToComplaint, fetchComplaints, loginUser, submitComplaint, updateComplaintStatus } from './services/api'
import type { Complaint, ComplaintInput, ComplaintPriority, ComplaintStatus, Role, User } from './types'

const priorityColors: Record<ComplaintPriority, string> = {
  Critical: '#f97316',
  High: '#facc15',
  Medium: '#38bdf8',
  Low: '#4ade80',
}

const judiciaryCases = [
  {
    title: 'Public Interest Petition on Urban Drainage',
    court: 'High Court',
    status: 'Pending',
    keyIssue: 'Flooding and environmental health risks',
    summary: 'The matter concerns civic negligence in drainage maintenance and repeated waterlogging.',
    provisions: ['Article 21', 'Article 32', 'Municipal Act'],
  },
  {
    title: 'Digital Governance Transparency Appeal',
    court: 'Supreme Court',
    status: 'Heard',
    keyIssue: 'Public access to records and service accountability',
    summary: 'The case looks into digital service transparency and procedural fairness for citizens.',
    provisions: ['Article 19', 'RTI Act', 'PIL jurisprudence'],
  },
]

function App() {
  const [currentRole, setCurrentRole] = useState<Role>('citizen')
  const [user, setUser] = useState<User | null>({
    id: 'cit-1',
    name: 'Citizen User',
    email: 'citizen@yuva.in',
    role: 'citizen',
  })
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [selectedComplaintId, setSelectedComplaintId] = useState('')
  const [responseDraft, setResponseDraft] = useState('')
  const [formData, setFormData] = useState<ComplaintInput>(initialComplaintForm)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([])

  useEffect(() => {
    if (!isLoggedIn) return

    fetchComplaints()
      .then(({ complaints: nextComplaints }) => {
        setComplaints(nextComplaints)
        if (nextComplaints[0]) setSelectedComplaintId(nextComplaints[0].id)
      })
      .catch(() => setComplaints([]))
  }, [isLoggedIn])

  const activeComplaint = complaints.find((complaint) => complaint.id === selectedComplaintId) ?? complaints[0]

  const totalResolved = useMemo(
    () => complaints.filter((complaint) => complaint.status === 'RESOLVED').length,
    [complaints],
  )

  const handleLogin = async (role: Role) => {
    try {
      const emailMap: Record<Role, string> = {
        citizen: 'citizen@yuva.in',
        authority: 'authority@yuva.in',
        admin: 'admin@yuva.in',
      }

      const result = await loginUser(role, emailMap[role], '123456')
      setUser(result.user)
      setCurrentRole(role)
      setIsLoggedIn(true)

      const { complaints: nextComplaints } = await fetchComplaints()
      setComplaints(nextComplaints)
      if (nextComplaints[0]) setSelectedComplaintId(nextComplaints[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setCurrentRole('citizen')
  }

  const triggerAiAnalysis = async () => {
    const steps = [
      'Understanding problem...',
      'Identifying category...',
      'Analyzing urgency...',
      'Finding responsible authority...',
      'Checking similar complaints...',
      'Routing complaint...',
    ]

    setIsAnalyzing(true)
    setAnalysisSteps([])

    steps.forEach((step, index) => {
      window.setTimeout(() => {
        setAnalysisSteps((current) => [...current, step])
      }, index * 500)
    })

    try {
      const { complaint } = await submitComplaint(formData)
      setComplaints((current) => [complaint, ...current])
      setSelectedComplaintId(complaint.id)
      setAnalysisSteps(['Complaint successfully routed to the appropriate authority.'])
    } catch (error) {
      console.error(error)
      setAnalysisSteps(['Submission failed. Please retry.'])
    } finally {
      window.setTimeout(() => setIsAnalyzing(false), 1200)
    }
  }

  const handleStatusUpdate = async (newStatus: ComplaintStatus) => {
    if (!activeComplaint) return

    try {
      const { complaint } = await updateComplaintStatus(
        activeComplaint.id,
        newStatus,
        responseDraft || `Status updated to ${newStatus}.`,
      )
      setComplaints((current) => current.map((item) => (item.id === complaint.id ? complaint : item)))
      setSelectedComplaintId(complaint.id)
      setResponseDraft('')
    } catch (error) {
      console.error(error)
    }
  }

  const handleResponseAdd = async () => {
    if (!responseDraft.trim() || !activeComplaint) return

    try {
      const { complaint } = await addCommentToComplaint(activeComplaint.id, responseDraft)
      setComplaints((current) => current.map((item) => (item.id === complaint.id ? complaint : item)))
      setSelectedComplaintId(complaint.id)
      setResponseDraft('')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-[#040914] text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 shadow-[0_0_30px_rgba(56,189,248,0.45)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-[0.18em] text-cyan-300">YUVA</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Youth Unified for Visionary Administration</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#how-it-works" className="transition hover:text-cyan-300">How it works</a>
            <a href="#ai-routing" className="transition hover:text-cyan-300">AI Routing</a>
            <a href="#judiciary" className="transition hover:text-cyan-300">Judiciary</a>
            <a href="#case-studies" className="transition hover:text-cyan-300">Case Studies</a>
            <a href="#news" className="transition hover:text-cyan-300">News</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="hidden rounded-full border border-cyan-400/40 bg-slate-900/80 px-4 py-2 text-sm text-cyan-200 md:inline-flex">
              <Search className="mr-2 h-4 w-4" /> Search
            </button>
            <button className="rounded-full border border-violet-400/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-100 shadow-[0_0_26px_rgba(168,85,247,0.4)]">
              <Bell className="mr-2 inline h-4 w-4" /> 4 alerts
            </button>
            <button onClick={() => handleLogin(currentRole)} className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.5)]">
              {isLoggedIn ? 'Portal Access' : 'Login'}
            </button>
            <button className="rounded-full border border-white/10 p-2 md:hidden">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-shell relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),transparent_35%)]" />
          <div className="absolute inset-0 opacity-30"><div className="network-grid" /></div>

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="mb-6 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> AI-powered civic platform
              </div>
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.06em] text-white md:text-6xl">AI-Powered Civic Governance & Justice</h1>
              <p className="mt-6 max-w-xl text-lg text-slate-300">Connect citizens, authorities and the justice ecosystem through intelligent technology.</p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a href="#report-issue" className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 font-medium text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.45)]">Report a Problem <ArrowRight className="ml-2 h-4 w-4" /></a>
                <a href="#judiciary" className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-3 font-medium text-white">Explore Judiciary</a>
                <a href="#case-studies" className="inline-flex items-center rounded-full border border-violet-400/40 bg-violet-500/10 px-6 py-3 font-medium text-violet-100">View Case Studies</a>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {complaintStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
                    <div className="mt-3 text-2xl font-semibold text-white">{stat.value}</div>
                    <div className="mt-2 text-xs text-emerald-300">{stat.change}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="rounded-[28px] border border-white/10 bg-slate-950/80 p-5 shadow-[0_0_40px_rgba(34,211,238,0.16)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Demo access</div>
                  <h3 className="mt-1 text-xl font-semibold text-white">Login to platform</h3>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-300">LIVE</div>
              </div>

              <div className="grid gap-3">
                {(['citizen', 'authority', 'admin'] as Role[]).map((role) => (
                  <button key={role} onClick={() => handleLogin(role)} className={`rounded-2xl border p-4 text-left transition ${currentRole === role && isLoggedIn ? 'border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.28)]' : 'border-white/10 bg-white/5 hover:border-violet-400/30'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-medium capitalize text-white">{role}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{role === 'citizen' ? 'Public portal' : role === 'authority' ? 'Government dashboard' : 'System control'}</div>
                      </div>
                      <div className="rounded-full bg-slate-900 p-2">{role === 'citizen' ? <UserRound className="h-4 w-4 text-cyan-300" /> : role === 'authority' ? <Building2 className="h-4 w-4 text-violet-300" /> : <ShieldCheck className="h-4 w-4 text-emerald-300" />}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3"><div className="flex items-center justify-between"><span>Civic profile</span><span className="text-cyan-300">{user ? 'Active' : 'Offline'}</span></div></div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3"><div className="flex items-center justify-between"><span>AI routing engine</span><span className="text-emerald-300">Operational</span></div></div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="How It Works" title="Fast, transparent, accountable civic resolution" />
          <div className="mt-10 grid gap-4 md:grid-cols-7">
            {workflowSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex-1 rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4 text-center text-sm font-medium tracking-[0.2em] text-slate-200 shadow-[0_0_24px_rgba(34,211,238,0.12)]">{step}</div>
                {index < workflowSteps.length - 1 ? <ChevronRight className="h-5 w-5 text-cyan-300" /> : null}
              </div>
            ))}
          </div>
        </section>

        <section id="ai-routing" className="border-y border-white/10 bg-slate-950/60">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-violet-300">AI Complaint Routing</div>
              <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Smart routing based on severity, jurisdiction, and urgency</h2>
              <p className="mt-4 max-w-xl text-slate-300">Every grievance is scanned for category, location, urgency, duplicate risk, and responsible department before being forwarded to the right authority.</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  ['Category detection', 'Road Infrastructure', 'AI identifies the most relevant issue type using NLP and complaint context.'],
                  ['Priority engine', 'HIGH', 'Risk-based scoring flags impact to public safety, school zones, health areas, and emergencies.'],
                  ['Department mapping', 'Municipal Roads Department', 'Location and category are matched to the correct authority or field team.'],
                  ['Duplicate review', '2 similar reports', 'Similar complaints are clustered to improve response quality and reduce backlog.'],
                ].map(([title, value, description]) => (
                  <div key={String(title)} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.14em] text-slate-400">{String(title)}</div>
                    <div className="mt-3 text-xl font-semibold text-white">{String(value)}</div>
                    <div className="mt-2 text-sm text-slate-300">{String(description)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-cyan-400/25 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-[0_0_28px_rgba(34,211,238,0.14)]">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">AI Analysis</div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-300">Verified</span>
              </div>

              <div className="mt-6 space-y-5">
                <div><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Category</div><div className="mt-2 text-xl font-semibold text-white">Public Infrastructure</div></div>
                <div><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Problem</div><div className="mt-2 text-xl font-semibold text-white">Damaged road</div></div>
                <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-[0.18em] text-slate-400">Priority</span><span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-xs font-medium uppercase tracking-[0.18em] text-amber-300">HIGH</span></div>
                <div><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Responsible Department</div><div className="mt-2 text-lg font-medium text-cyan-200">Municipal Roads Department</div></div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300"><div className="font-medium text-white">Reason</div>Complaint indicates a major road safety issue affecting public movement and student safety near a school zone.</div>
                <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4 text-sm leading-6 text-violet-100"><div className="font-medium">Recommended Action</div>Inspection and temporary safety measures followed by road repair and public signage.</div>
              </div>
            </div>
          </div>
        </section>

        <section id="report-issue" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Demo workflow</div>
              <h2 className="mt-4 text-3xl font-semibold text-white">Citizen complaint to authority resolution flow</h2>
            </div>
            {isLoggedIn ? <button onClick={handleLogout} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"><LogOut className="mr-2 h-4 w-4" /> Logout</button> : null}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Submit issue</div>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Report a problem</h3>
                </div>
                <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">Citizen portal</div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block"><span className="mb-2 block text-sm text-slate-300">Problem title</span><input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Road issue near school" /></label>
                <label className="block"><span className="mb-2 block text-sm text-slate-300">Category</span><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none"><option>Road Infrastructure</option><option>Water</option><option>Electricity</option><option>Sanitation</option><option>Public Safety</option><option>Education</option><option>Healthcare</option><option>Transport</option><option>Environment</option><option>Government Services</option><option>Other</option></select></label>
                <label className="block md:col-span-2"><span className="mb-2 block text-sm text-slate-300">Location</span><input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Near Government High School, Sector 12" /></label>
                <label className="block md:col-span-2"><span className="mb-2 block text-sm text-slate-300">Description</span><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Describe the issue in natural language" /></label>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button onClick={triggerAiAnalysis} className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 font-medium text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.45)]"><BrainCircuit className="mr-2 h-4 w-4" /> Submit & analyze</button>
                <button className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white">Upload evidence</button>
              </div>

              {isAnalyzing ? <div className="mt-8 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-5"><div className="flex items-center gap-2 text-cyan-200"><Activity className="h-4 w-4 animate-pulse" /><span className="text-sm font-medium">AI is analyzing your complaint...</span></div><div className="mt-4 space-y-3 text-sm text-slate-200">{analysisSteps.length === 0 ? <div className="flex items-center gap-2"><div className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" /> Understanding problem...</div> : analysisSteps.map((step) => <div key={step} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />{step}</div>)}</div></div> : null}
            </div>

            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6">
              <div className="mb-5 flex items-center justify-between"><div><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Complaint tracker</div><h3 className="mt-2 text-2xl font-semibold text-white">Live complaint insight</h3></div><span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-violet-300">{activeComplaint?.id || 'N/A'}</span></div>

              {activeComplaint ? <div className="space-y-5"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center justify-between"><div><div className="text-xs uppercase tracking-[0.16em] text-slate-400">Status</div><div className="mt-2 text-xl font-semibold text-white">{activeComplaint.status}</div></div><div className="rounded-full border px-2 py-1 text-xs uppercase tracking-[0.18em]" style={{ borderColor: `${priorityColors[activeComplaint.priority]}66`, backgroundColor: `${priorityColors[activeComplaint.priority]}1A`, color: priorityColors[activeComplaint.priority] }}>{activeComplaint.priority}</div></div></div><div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Assigned department</div><div className="mt-2 text-lg font-medium text-cyan-200">{activeComplaint.department}</div><div className="mt-2 text-sm text-slate-300">Officer: {activeComplaint.officer}</div></div><div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-400">AI summary</div><p className="mt-2 text-sm leading-6 text-slate-200">{activeComplaint.summary}</p></div><div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Tracking timeline</div><div className="mt-4 space-y-4">{activeComplaint.timeline.map((item, index) => <div key={item.stage} className="flex gap-3"><div className="flex flex-col items-center"><div className={`h-3 w-3 rounded-full ${index === activeComplaint.timeline.length - 1 ? 'bg-cyan-300' : 'bg-violet-400'}`} />{index < activeComplaint.timeline.length - 1 ? <div className="mt-2 h-10 w-px bg-white/10" /> : null}</div><div className="flex-1"><div className="flex items-center justify-between text-sm text-slate-300"><span className="font-medium text-white">{item.stage}</span><span>{item.date}</span></div><div className="mt-1 text-xs text-slate-400">{item.note}</div></div></div>)}</div></div></div> : <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">No complaint selected</div>}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6">
              <div className="mb-6 flex items-center justify-between"><div><div className="text-xs uppercase tracking-[0.2em] text-violet-300">Citizen dashboard</div><h2 className="mt-2 text-2xl font-semibold text-white">My complaints and updates</h2></div><button className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-200"><Filter className="mr-2 inline h-3.5 w-3.5" /> Filter</button></div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{['Total complaints', 'Active complaints', 'Resolved complaints', 'AI-analyzed complaints'].map((item, index) => <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-400">{item}</div><div className="mt-3 text-2xl font-semibold text-white">{[complaints.length, 2, totalResolved, 4][index]}</div></div>)}</div>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-white"><FileText className="h-4 w-4 text-cyan-300" /> My Complaints</div><button className="text-xs text-cyan-300">View all</button></div>{complaints.slice(0, 3).map((item) => <button key={item.id} onClick={() => setSelectedComplaintId(item.id)} className={`mb-3 flex w-full items-center justify-between rounded-xl border p-3 text-left ${selectedComplaintId === item.id ? 'border-cyan-400/50 bg-cyan-500/10' : 'border-white/8 bg-white/5'}`}><div><div className="text-sm font-medium text-white">{item.title}</div><div className="mt-1 text-xs text-slate-400">{item.id}</div></div><span className="rounded-full border border-violet-400/40 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-violet-200">{item.status}</span></button>)}</div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"><div className="mb-4 flex items-center gap-2 text-white"><MessageSquareText className="h-4 w-4 text-violet-300" /> AI Civic Assistant</div><div className="space-y-3 text-sm text-slate-300">{['What department handles this issue?', 'How can I track my complaint?', 'What are my basic constitutional rights?'].map((question) => <button key={question} className="block w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left text-slate-200 hover:border-cyan-400/30">{question}</button>)}</div></div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6">
              <div className="mb-5 flex items-center justify-between"><div><div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Authority dashboard</div><h2 className="mt-2 text-2xl font-semibold text-white">Priority queue</h2></div><button className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-200"><TrendingUp className="mr-2 inline h-3.5 w-3.5" /> Sort</button></div>
              <div className="space-y-4">{[['Critical', 'Flood-related emergency', 'Public Safety'], ['High', 'Dangerous damaged bridge', 'Roads'], ['Medium', 'Streetlight failure', 'Public Utilities'], ['Low', 'Minor civic request', 'Municipal Services']].map(([priority, title, department]) => <div key={String(title)} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"><div><div className="text-xs uppercase tracking-[0.18em]" style={{ color: priority === 'Critical' ? '#f87171' : priority === 'High' ? '#fbbf24' : priority === 'Medium' ? '#38bdf8' : '#4ade80' }}>{String(priority)}</div><div className="mt-2 text-base font-medium text-white">{String(title)}</div></div><div className="text-xs uppercase tracking-[0.18em] text-slate-400">{String(department)}</div></div>)}</div>
            </div>
          </div>
        </section>

        <section id="judiciary" className="border-y border-white/10 bg-slate-950/60">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">AI Judiciary</div>
                <h2 className="mt-4 text-3xl font-semibold text-white">Case explorer and legal knowledge hub</h2>
              </div>
              <div className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-200">Informational, not legal advice</div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-4">
                {judiciaryCases.map((item) => <div key={item.title} className="rounded-[26px] border border-white/10 bg-slate-900/80 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-xl font-semibold text-white">{item.title}</div><div className="mt-1 text-sm text-slate-400">{item.court} • {item.status}</div></div><span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-violet-200">{item.status}</span></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Key issue</div><div className="mt-2 text-sm text-slate-200">{item.keyIssue}</div></div><div><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Relevant provisions</div><div className="mt-2 flex flex-wrap gap-2">{item.provisions.map((provision) => <span key={provision} className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-200">{provision}</span>)}</div></div></div><div className="mt-4 text-sm leading-6 text-slate-300">{item.summary}</div></div>)}
              </div>

              <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6">
                <div className="mb-5 flex items-center gap-2 text-white"><Landmark className="h-4 w-4 text-cyan-300" /> Legal knowledge hub</div>
                <div className="flex flex-wrap gap-2">{legalTopics.map((topic) => <span key={topic} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.1em] text-slate-200">{topic}</span>)}</div>
                <div className="mt-8 rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4"><div className="flex items-center gap-2 text-violet-200"><Scale className="h-4 w-4" /> AI case summary generator</div><div className="mt-3 text-sm text-slate-200">Case background, main legal issue, arguments, laws, judgment summary, observations and timeline are generated in a structured format from uploaded legal information.</div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="case-studies" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-violet-300">Case studies</div>
              <h2 className="mt-4 text-3xl font-semibold text-white">Real-world civic and legal transformations</h2>
            </div>
            <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">All filters</button>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">{caseStudies.map((study) => <div key={study.title} className="group rounded-[28px] border border-white/10 bg-slate-900/80 p-5 transition hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.12)]"><div className="mb-4 flex items-center justify-between"><span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-200">{study.filter}</span><ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-300" /></div><div className="text-xl font-semibold text-white">{study.title}</div><div className="mt-4 text-sm leading-6 text-slate-300"><div className="mb-3"><span className="font-medium text-white">Problem:</span> {study.problem}</div><div><span className="font-medium text-white">Outcome:</span> {study.outcome}</div></div></div>)}</div>
        </section>

        <section id="news" className="border-y border-white/10 bg-slate-950/60">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Daily news</div>
                <h2 className="mt-4 text-3xl font-semibold text-white">Civic, legal and governance updates</h2>
              </div>
              <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">Latest updates</button>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">{newsData.map((news) => <div key={news.title} className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5"><div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400"><span>{news.category}</span><span>{news.date}</span></div><div className="mt-4 text-xl font-semibold text-white">{news.title}</div><div className="mt-3 text-sm text-slate-300">{news.summary}</div><div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-400"><span>{news.source}</span><button className="text-cyan-300">Read more</button></div></div>)}</div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6">
              <div className="mb-6 flex items-center justify-between"><div><div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Map & location dashboard</div><h2 className="mt-2 text-2xl font-semibold text-white">Complaint density and critical issue clusters</h2></div><button className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-200"><MapPin className="mr-2 inline h-3.5 w-3.5" /> Live map</button></div>
              <div className="relative h-[340px] overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.08),_rgba(2,6,23,0.9)_70%)]"><div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" /><div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20" />{mapMarkers.map((marker) => <div key={marker.name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: marker.x, top: marker.y }}><div className={`flex h-5 w-5 items-center justify-center rounded-full border text-[8px] ${marker.type === 'critical' ? 'border-rose-400 bg-rose-500/80 text-white' : marker.type === 'high' ? 'border-amber-400 bg-amber-500/80 text-white' : marker.type === 'medium' ? 'border-cyan-400 bg-cyan-500/80 text-white' : 'border-emerald-400 bg-emerald-500/80 text-white'}`}>{marker.label.slice(0, 1)}</div><div className="mt-2 rounded-full border border-white/10 bg-slate-950/80 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-slate-200">{marker.name}</div></div>)}</div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6">
              <div className="mb-5 flex items-center justify-between"><div><div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Transparency dashboard</div><h2 className="mt-2 text-2xl font-semibold text-white">Department performance</h2></div><button className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-200"><BarChart3 className="mr-2 inline h-3.5 w-3.5" /> Stats</button></div>
              <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={transparencyData}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#38bdf8" /></BarChart></ResponsiveContainer></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6"><div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Complaint trends</div><div className="mt-4 h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Line type="monotone" dataKey="submitted" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} /><Line type="monotone" dataKey="resolved" stroke="#a78bfa" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></div></div>
            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6"><div className="text-xs uppercase tracking-[0.2em] text-violet-300">Resolution rate</div><div className="mt-6 grid gap-4">{[['Roads', 82], ['Water', 76], ['Health', 71], ['Safety', 88]].map(([label, value]) => <div key={String(label)}><div className="mb-2 flex items-center justify-between text-sm text-slate-300"><span>{String(label)}</span><span>{Number(value)}%</span></div><div className="h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${Number(value)}%` }} /></div></div>)}</div></div>
            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6"><div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Service mix</div><div className="mt-4 h-52"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={departmentData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">{departmentData.map((entry, index) => <Cell key={entry.name} fill={['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#f87171'][index % 5]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6"><div className="mb-5 flex items-center justify-between"><div><div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Authority controls</div><h2 className="mt-2 text-2xl font-semibold text-white">Process resolved complaint</h2></div></div><div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"><div className="mb-3 flex items-center justify-between"><div className="text-sm uppercase tracking-[0.18em] text-slate-400">Complaint selected</div><span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-200">{activeComplaint?.id || 'N/A'}</span></div><div className="space-y-3">{activeComplaint?.comments.map((comment) => <div key={`${comment.by}-${comment.when}`} className="rounded-xl border border-white/10 bg-white/5 p-3"><div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400"><span>{comment.by}</span><span>{comment.when}</span></div><div className="mt-2 text-sm text-slate-200">{comment.text}</div></div>)}</div><div className="mt-4 space-y-3"><textarea value={responseDraft} onChange={(e) => setResponseDraft(e.target.value)} rows={4} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Add authority comments or action summary" /><div className="flex flex-wrap gap-3"><button onClick={handleResponseAdd} className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950">Add response</button><button onClick={() => handleStatusUpdate('IN PROGRESS')} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">Mark in progress</button><button onClick={() => handleStatusUpdate('RESOLVED')} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">Resolve</button></div></div></div></div>
            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6"><div className="mb-5 flex items-center gap-2 text-white"><Newspaper className="h-4 w-4 text-violet-300" /> Live notifications</div><div className="space-y-4">{notificationSeed.map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300"><Bell className="h-4 w-4" /></div><div className="flex-1 text-sm text-slate-200">{item}</div></div>)}</div></div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-slate-950/80">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">YUVA</div>
                <div className="mt-2 text-lg font-medium text-white">Intelligent Governance • Justice • Citizen Connect</div>
              </div>
              <div className="flex flex-wrap gap-3"><a href="#how-it-works" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">Platform</a><a href="#judiciary" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">Judiciary</a><a href="#news" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">News</a></div>
            </div>
          </div>
        </section>
      </main>

      <AIChatWidget />
    </div>
  )
}

export default App
