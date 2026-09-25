import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Filter,
  Gavel,
  Landmark,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MapPin,
  Menu,
  MessageSquareText,
  Newspaper,
  Scale,
  Search,
  ShieldCheck,
  ShieldX,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  Settings,
  ClipboardList,
  PlusCircle,
  UserCog,
  Building,
  BellRing,
  Home,
  FileSearch,
  Newspaper as NewspaperIcon,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom'
import { AIChatWidget } from './components/AIChatWidget'
import { SectionHeader } from './components/SectionHeader'
import {
  caseStudies,
  complaintStats,
  initialComplaintForm,
  legalTopics,
  newsData,
  workflowSteps,
} from './data/mockData'
import { addCommentToComplaint, fetchComplaints, loginUser, submitComplaint, updateComplaintStatus } from './services/api'
import type { Complaint, ComplaintInput, ComplaintLocation, ComplaintPriority, ComplaintStatus, Role, User } from './types'

const fallbackComplaintLocation: ComplaintLocation = {
  address: 'Near Government High School, Sector 12',
  latitude: 16.5062,
  longitude: 80.648,
}

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

const departmentProfiles = [
  { name: 'Road Management System', email: 'roads@yuva.in', designation: 'Chief Engineer - Roads & Traffic', officeName: 'Public Works Division', icon: '🛣️', description: 'Potholes, road safety, street maintenance, flyover repair and traffic infrastructure.' },
  { name: 'Health Department', email: 'health@yuva.in', designation: 'District Health Officer', officeName: 'Primary Health Services Wing', icon: '🏥', description: 'Hospital readiness, sanitation, disease control, and public health response.' },
  { name: 'Finance & Budget Office', email: 'finance@yuva.in', designation: 'Finance Controller', officeName: 'Public Finance Cell', icon: '💰', description: 'Public funds, welfare schemes, procurement grants and budget accountability.' },
  { name: 'Women Safety Cell', email: 'women-safety@yuva.in', designation: 'Deputy Commissioner - Women Safety', officeName: 'Women Protection & Support Desk', icon: '🛡️', description: 'Safety complaints, harassment reports, legal aid and immediate intervention.' },
  { name: 'Water Supply Board', email: 'water@yuva.in', designation: 'Superintending Engineer - Water Supply', officeName: 'Urban Water Management Wing', icon: '💧', description: 'Leakages, water quality, supply distribution and pipeline maintenance.' },
  { name: 'Urban Sanitation Wing', email: 'sanitation@yuva.in', designation: 'Sanitation Superintendent', officeName: 'Clean City Operations Cell', icon: '🚮', description: 'Waste collection, drainage complaints, public cleanliness and hygiene.' },
] as const

const authorityProfiles = [
  { role: 'authority' as const, name: 'Road Management System', email: 'roads@yuva.in', password: 'Roads@2026', designation: 'Chief Engineer - Roads & Traffic', officeName: 'Public Works Division', shortLabel: 'Roads', accent: 'cyan' },
  { role: 'authority' as const, name: 'Health Department', email: 'health@yuva.in', password: 'Health@2026', designation: 'District Health Officer', officeName: 'Primary Health Services Wing', shortLabel: 'Health', accent: 'emerald' },
  { role: 'authority' as const, name: 'Finance & Budget Office', email: 'finance@yuva.in', password: 'Finance@2026', designation: 'Finance Controller', officeName: 'Public Finance Cell', shortLabel: 'Finance', accent: 'amber' },
  { role: 'authority' as const, name: 'Women Safety Cell', email: 'women-safety@yuva.in', password: 'Safety@2026', designation: 'Deputy Commissioner - Women Safety', officeName: 'Women Protection & Support Desk', shortLabel: 'Women Safety', accent: 'rose' },
  { role: 'authority' as const, name: 'Water Supply Board', email: 'water@yuva.in', password: 'Water@2026', designation: 'Superintending Engineer - Water Supply', officeName: 'Urban Water Management Wing', shortLabel: 'Water', accent: 'blue' },
  { role: 'authority' as const, name: 'Urban Sanitation Wing', email: 'sanitation@yuva.in', password: 'Sanitation@2026', designation: 'Sanitation Superintendent', officeName: 'Clean City Operations Cell', shortLabel: 'Sanitation', accent: 'violet' },
] as const

const solvedCaseGallery = [
  {
    title: 'School road repair completed',
    location: 'Sector 12, Vijayawada',
    department: 'Road Management System',
    image: 'linear-gradient(135deg, rgba(8,126,139,0.75), rgba(15,23,42,0.9)), url("https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80")',
    status: 'Solved',
  },
  {
    title: 'Water leak fixed',
    location: 'Ward 24, Guntur',
    department: 'Water Supply Board',
    image: 'linear-gradient(135deg, rgba(59,130,246,0.7), rgba(15,23,42,0.9)), url("https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80")',
    status: 'Solved',
  },
  {
    title: 'Emergency health camp delivered',
    location: 'Madhurawada, Visakhapatnam',
    department: 'Health Department',
    image: 'linear-gradient(135deg, rgba(16,185,129,0.7), rgba(15,23,42,0.9)), url("https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80")',
    status: 'Solved',
  },
] as const

const workflowCards = [
  {
    slug: 'report',
    label: 'Report',
    shortText: 'Citizen issue captured',
    title: 'Report an issue',
    description: 'Submit a grievance with location, category, and evidence so the system can classify and route it instantly.',
    points: ['Add title and description', 'Choose category and location', 'Attach evidence or photos'],
    to: '/citizen/report',
    accent: 'cyan',
    icon: FileText,
  },
  {
    slug: 'understand',
    label: 'Understand',
    shortText: 'AI classifies, prioritizes',
    title: 'AI analysis',
    description: 'The platform reads the complaint, flags urgency, detects duplicate reports, and identifies the best department.',
    points: ['Detect issue type', 'Prioritize risk and urgency', 'Check duplicate complaints'],
    to: '/ai-assistant',
    accent: 'violet',
    icon: BrainCircuit,
  },
  {
    slug: 'connect',
    label: 'Connect',
    shortText: 'Department routing',
    title: 'Smart routing',
    description: 'The right authority is mapped based on jurisdiction, geography, and complaint category to avoid delay.',
    points: ['Match department rules', 'Connect to local authority', 'Assign action owner'],
    to: '/transparency',
    accent: 'amber',
    icon: Building2,
  },
  {
    slug: 'act',
    label: 'Act',
    shortText: 'Authority assigned',
    title: 'Authority action',
    description: 'Assigned departments review the issue, schedule action, and update the citizen as the case moves forward.',
    points: ['Review complaint details', 'Track assignment and response', 'Escalate when required'],
    to: '/authority/dashboard',
    accent: 'emerald',
    icon: ShieldCheck,
  },
  {
    slug: 'justice',
    label: 'Justice',
    shortText: 'Legal intelligence',
    title: 'Justice pathway',
    description: 'Where citizens need legal support, the platform surfaces rights, precedents, and relevant legal guidance.',
    points: ['Map to relevant legal basis', 'Review case studies', 'Understand available remedies'],
    to: '/justice',
    accent: 'rose',
    icon: Gavel,
  },
  {
    slug: 'track',
    label: 'Track',
    shortText: 'Timeline updates',
    title: 'Complaint tracking',
    description: 'Every stakeholder can follow progress in real time, from submission to final resolution and communication.',
    points: ['See timestamps and milestones', 'Monitor action status', 'Get updates and alerts'],
    to: '/citizen/track',
    accent: 'cyan',
    icon: Search,
  },
  {
    slug: 'resolve',
    label: 'Resolve',
    shortText: 'Outcome delivered',
    title: 'Resolution and closure',
    description: 'The case is closed only after the action is verified, outcomes are shared, and the citizen is informed.',
    points: ['Verify actual fix', 'Capture closure notes', 'Share final result with citizen'],
    to: '/citizen/complaints',
    accent: 'green',
    icon: CheckCircle2,
  },
] as const

type PortalItem = {
  label: string
  to: string
  icon: LucideIcon
}

const publicNavItems: PortalItem[] = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Report Issue', to: '/citizen/report', icon: PlusCircle },
  { label: 'Track Complaint', to: '/citizen/track', icon: Search },
  { label: 'Explore Cases', to: '/justice/case-studies', icon: Landmark },
  { label: 'Civic News', to: '/news', icon: NewspaperIcon },
  { label: 'AI Assistant', to: '/ai-assistant', icon: BrainCircuit },
  { label: 'About', to: '/about', icon: ShieldCheck },
  { label: 'Login', to: '/login', icon: UserRound },
  { label: 'Get Started', to: '/register', icon: UserCog },
]

const citizenNavItems: PortalItem[] = [
  { label: 'Dashboard', to: '/citizen/dashboard', icon: LayoutDashboard },
  { label: 'Report Issue', to: '/citizen/report', icon: PlusCircle },
  { label: 'My Complaints', to: '/citizen/complaints', icon: FileText },
  { label: 'Track Complaint', to: '/citizen/track', icon: Search },
  { label: 'Notifications', to: '/citizen/notifications', icon: Bell },
  { label: 'Feedback', to: '/citizen/feedback', icon: MessageSquareText },
  { label: 'Profile', to: '/citizen/profile', icon: UserRound },
  { label: 'Settings', to: '/citizen/settings', icon: Settings },
]

const authorityNavItems: PortalItem[] = [
  { label: 'Dashboard', to: '/authority/dashboard', icon: LayoutDashboard },
  { label: 'Complaint Queue', to: '/authority/complaints', icon: ListChecks },
  { label: 'Priority Cases', to: '/authority/priority', icon: TrendingUp },
  { label: 'Assigned Cases', to: '/authority/assigned', icon: ClipboardList },
  { label: 'Escalations', to: '/authority/escalations', icon: AlertTriangle },
  { label: 'Resolved Cases', to: '/authority/resolved', icon: CheckCircle2 },
  { label: 'Analytics', to: '/authority/analytics', icon: BarChart3 },
  { label: 'Map', to: '/authority/map', icon: MapPin },
  { label: 'Notifications', to: '/authority/notifications', icon: BellRing },
  { label: 'Profile', to: '/authority/profile', icon: UserRound },
  { label: 'Settings', to: '/authority/settings', icon: Settings },
]

const adminNavItems: PortalItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Citizens', to: '/admin/citizens', icon: UserRound },
  { label: 'Authorities', to: '/admin/authorities', icon: Building2 },
  { label: 'Departments', to: '/admin/departments', icon: Building },
  { label: 'Complaints', to: '/admin/complaints', icon: FileText },
  { label: 'Cases', to: '/admin/cases', icon: Scale },
  { label: 'News', to: '/admin/news', icon: Newspaper },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

const justiceNavItems: PortalItem[] = [
  { label: 'Overview', to: '/justice', icon: Gavel },
  { label: 'Case Explorer', to: '/justice/cases', icon: Landmark },
  { label: 'Case Studies', to: '/justice/case-studies', icon: FileSearch },
  { label: 'Legal Search', to: '/justice/legal-search', icon: Search },
  { label: 'Legal Terms', to: '/justice/legal-terms', icon: Scale },
]

function getComplaintLocation(complaint: Complaint): ComplaintLocation {
  if (complaint.locationDetails) {
    return complaint.locationDetails
  }

  return {
    address: complaint.location || fallbackComplaintLocation.address,
    latitude: fallbackComplaintLocation.latitude,
    longitude: fallbackComplaintLocation.longitude,
  }
}

function ComplaintLocationMap({ complaints, selectedId, compact = false, onSelect }: { complaints: Complaint[]; selectedId?: string; compact?: boolean; onSelect?: (id: string) => void }) {
  const visibleComplaints = complaints.length ? complaints : [{ id: 'YUVA-2026-004821', title: 'School zone pothole', status: 'UNDER REVIEW', priority: 'High', location: fallbackComplaintLocation.address, locationDetails: fallbackComplaintLocation, category: 'Road Infrastructure' } as Complaint]

  return (
    <div className={`overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/70 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Location map</div>
        <div className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-200">Live</div>
      </div>
      <div className="relative h-64 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(8,126,139,0.2),transparent_35%),linear-gradient(135deg,#07111c,#0b1726_45%,#051017)]">
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20 bg-cyan-500/5" />
        {visibleComplaints.map((complaint) => {
          const location = getComplaintLocation(complaint)
          const left = Math.min(90, Math.max(10, ((location.longitude + 10) / 20) * 100))
          const top = Math.min(82, Math.max(12, ((location.latitude + 10) / 20) * 100))
          const active = complaint.id === selectedId
          return (
            <button
              key={complaint.id}
              type="button"
              onClick={() => onSelect?.(complaint.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${active ? 'border-[#D9A441] bg-[#D9A441]' : 'border-[#087E8B] bg-cyan-300'} shadow-[0_0_18px_rgba(8,126,139,0.8)]`} />
            </button>
          )
        })}
      </div>
      <div className="mt-3 text-sm text-slate-300">
        {visibleComplaints[0] ? (
          <>
            <div className="font-medium text-white">{getComplaintLocation(visibleComplaints[0]).address}</div>
            <div className="mt-1 text-xs text-slate-400">Lat {getComplaintLocation(visibleComplaints[0]).latitude.toFixed(4)}, Lon {getComplaintLocation(visibleComplaints[0]).longitude.toFixed(4)}</div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function AppHeader({ isLoggedIn, user, onLogout }: { isLoggedIn: boolean; user: User | null; onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D9A441] via-[#087E8B] to-[#641C2A] shadow-[0_0_30px_rgba(217,164,65,0.4)]">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-[0.18em] text-[#D9A441]">YUVA</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Youth Unified for Visionary Administration</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          {publicNavItems.filter((item) => item.to !== '/login' && item.to !== '/register').map((item) => (
            <NavLink key={item.label} to={item.to} className={({ isActive }) => `transition ${isActive ? 'text-[#D9A441]' : 'hover:text-cyan-300'}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden rounded-full border border-cyan-400/40 bg-slate-900/80 px-4 py-2 text-sm text-cyan-200 md:inline-flex">
            <Search className="mr-2 h-4 w-4" /> Search
          </button>
          <button className="rounded-full border border-violet-400/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-100 shadow-[0_0_26px_rgba(168,85,247,0.4)]">
            <Bell className="mr-2 inline h-4 w-4" /> 4 alerts
          </button>
          {isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 md:block">
                {user.name}
              </div>
              <button onClick={onLogout} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full bg-[#087E8B] px-4 py-2 text-sm font-medium text-white">Login</Link>
              <Link to="/register" className="rounded-full border border-[#D9A441]/40 bg-[#D9A441]/10 px-4 py-2 text-sm text-[#F7F4ED]">Register</Link>
            </div>
          )}
          <button className="rounded-full border border-white/10 p-2 md:hidden">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}

function PortalShell({ title, subtitle, sidebarItems, user, onLogout, currentRole, children }: {
  title: string
  subtitle: string
  sidebarItems: PortalItem[]
  user: User | null
  onLogout: () => void
  currentRole: Role
  children: React.ReactNode
}) {

  return (
    <div className="min-h-screen bg-[#040914] text-slate-100">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-[28px] border border-white/10 bg-slate-950/80 p-5 lg:block">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D9A441] to-[#087E8B] text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Portal</div>
              <div className="mt-1 text-lg font-semibold text-white capitalize">{currentRole}</div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {sidebarItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                    isActive ? 'border-[#D9A441]/60 bg-[#D9A441]/10 text-[#F7F4ED]' : 'border-white/5 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Signed in as</div>
            <div className="mt-2 text-lg font-medium text-white">{user?.name ?? 'Guest'}</div>
            <div className="text-sm text-slate-400">{user?.email ?? 'Not available'}</div>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden rounded-[30px] border border-white/10 bg-slate-900/80">
          <div className="border-b border-white/10 bg-slate-950/60 px-5 py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#D9A441]">{subtitle}</div>
                <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{title}</h1>
              </div>
              <div className="flex items-center gap-3">
                <button className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                  <Bell className="mr-2 inline h-4 w-4" /> Alerts
                </button>
                <button onClick={onLogout} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                  <LogOut className="mr-2 inline h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

function ProtectedRoute({ isLoggedIn, children }: { isLoggedIn: boolean; children: React.ReactNode }) {
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RoleProtectedRoute({ isLoggedIn, userRole, allowedRole, children }: { isLoggedIn: boolean; userRole: Role | null; allowedRole: Role; children: React.ReactNode }) {
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (!userRole) return <Navigate to="/login" replace />
  if (userRole !== allowedRole) return <AccessDeniedPage />
  return <>{children}</>
}

function AccessDeniedPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#040914] px-4 text-slate-100">
      <div className="w-full max-w-lg rounded-[30px] border border-red-500/30 bg-slate-900/80 p-8 text-center shadow-[0_0_32px_rgba(239,68,68,0.12)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-300">
          <ShieldX className="h-8 w-8" />
        </div>
        <div className="mt-6 text-xs uppercase tracking-[0.22em] text-red-300">Access denied</div>
        <h1 className="mt-3 text-3xl font-semibold text-white">You do not have permission for this portal.</h1>
        <p className="mt-4 text-slate-300">Please sign in with the correct role or return to the main dashboard.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">Go back</button>
          <button onClick={() => navigate('/')} className="rounded-full bg-[#087E8B] px-4 py-2 text-sm font-medium text-white">Go home</button>
        </div>
      </div>
    </div>
  )
}

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#040914] px-4 text-slate-100">
      <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-slate-900/80 p-8 text-center">
        <div className="text-xs uppercase tracking-[0.22em] text-[#D9A441]">404</div>
        <h1 className="mt-3 text-4xl font-semibold text-white">Page not found</h1>
        <p className="mt-4 text-slate-300">The route you requested does not exist or may have moved.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">Back</button>
          <button onClick={() => navigate('/')} className="rounded-full bg-[#D9A441] px-4 py-2 text-sm font-medium text-[#171717]">Home</button>
        </div>
      </div>
    </div>
  )
}

export function ErrorBoundary() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#040914] px-4 text-slate-100">
      <div className="w-full max-w-lg rounded-[28px] border border-[#D9A441]/40 bg-slate-900/80 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D9A441]/10 text-[#D9A441]">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-white">Something went wrong</h1>
        <p className="mt-3 text-slate-300">The page crashed while rendering. Please try returning to a safe page.</p>
        <button onClick={() => navigate('/')} className="mt-6 rounded-full bg-[#087E8B] px-5 py-3 text-sm font-medium text-white">Return home</button>
      </div>
    </div>
  )
}

function PlaceholderPage({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  const navigate = useNavigate()

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="mt-6 text-3xl font-semibold text-white">{title}</h2>
      <p className="mt-3 max-w-xl text-slate-300">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"><ArrowLeft className="mr-2 h-4 w-4" />Back</button>
        <Link to="/" className="inline-flex items-center rounded-full bg-[#087E8B] px-4 py-2 text-sm font-medium text-white">Go to home</Link>
      </div>
    </div>
  )
}

function WorkflowDetailPage() {
  const { slug } = useParams()
  const step = workflowCards.find((item) => item.slug === slug)

  if (!step) return <NotFoundPage />

  const Icon = step.icon

  return (
    <div className="min-h-screen bg-[#040914] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_0_40px_rgba(8,126,139,0.16)] md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-200">Workflow step</span>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{step.label}</span>
          </div>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D9A441]/25 to-[#087E8B]/25 text-[#F0C96A]">
                <Icon className="h-8 w-8" />
              </div>
              <h1 className="mt-5 text-4xl font-semibold text-white md:text-5xl">{step.title}</h1>
              <p className="mt-4 text-lg text-slate-300">{step.description}</p>
            </div>

            <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">What this step does</div>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                {step.points.map((point) => (
                  <li key={point} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /><span>{point}</span></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {step.points.map((point) => (
              <div key={point} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Focus</div>
                <div className="mt-3 text-base font-medium text-white">{point}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={step.to} className="inline-flex items-center rounded-full bg-gradient-to-r from-[#F0C96A] via-[#D9A441] to-[#641C2A] px-5 py-3 font-medium text-[#171717] shadow-[0_0_30px_rgba(217,164,65,0.38)]">Open this page <ArrowRight className="ml-2 h-4 w-4" /></Link>
            <Link to="/" className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white">Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function HomePage({ isLoggedIn, onLogout }: { isLoggedIn: boolean; onLogout: () => void }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#040914] text-slate-100">
      <main>
        <section className="hero-shell relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(217,164,65,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(8,126,139,0.18),transparent_30%)]" />
          <div className="absolute inset-0 opacity-40"><div className="network-grid" /></div>
          <div className="hero-panel-sheen" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="mb-6 inline-flex items-center rounded-full border border-[#D9A441]/30 bg-[#D9A441]/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#F7F4ED]">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Civic Network Online
              </div>

              <h1 className="max-w-2xl text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-white md:text-6xl">
                <span className="block text-[#F8E7B0]">YOUR VOICE.</span>
                <span className="block text-white">YOUR CITY.</span>
                <span className="block text-[#D9A441]">YOUR RIGHTS.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg text-slate-300">An intelligent civic platform connecting citizens, authorities and justice.</p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/citizen/report" className="inline-flex items-center rounded-full bg-gradient-to-r from-[#F0C96A] via-[#D9A441] to-[#641C2A] px-6 py-3 font-medium text-[#171717] shadow-[0_0_30px_rgba(217,164,65,0.38)] transition hover:scale-[1.01]">Report an Issue <ArrowRight className="ml-2 h-4 w-4" /></Link>
                <Link to="/citizen/track" className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-3 font-medium text-white shadow-[0_10px_25px_rgba(8,126,139,0.15)] transition hover:border-cyan-300/40 hover:bg-cyan-400/5">Track Complaint</Link>
                <Link to="/justice/case-studies" className="inline-flex items-center rounded-full border border-[#D9A441]/40 bg-[#D9A441]/10 px-6 py-3 font-medium text-[#F7F4ED] transition hover:border-[#F0C96A]/60 hover:bg-[#D9A441]/15">Explore YUVA</Link>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {complaintStats.map((stat) => (
                  <div key={stat.label} className="stat-tile rounded-2xl border border-white/10 p-4 backdrop-blur-sm">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
                    <div className="mt-3 text-2xl font-semibold text-white">{stat.value}</div>
                    <div className="mt-2 text-xs text-emerald-300">{stat.change}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="hero-portal relative overflow-hidden rounded-[32px] border border-[#D9A441]/25 bg-[linear-gradient(135deg,rgba(19,13,15,0.96),rgba(31,19,22,0.92),rgba(9,75,82,0.9))] p-5 shadow-[0_20px_70px_rgba(100,28,42,0.28)] backdrop-blur-xl">
              <div className="portal-glow" />
              <div className="portal-grid" />

              <div className="relative z-10 mb-5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#F0C96A]">Civic Network Portal</div>
                  <h3 className="mt-2 max-w-xs text-xl font-semibold text-white">A citizen speaks. The system connects.</h3>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-300">LIVE</div>
              </div>

              <div className="portal-frame relative z-10 rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(100,28,42,0.72),rgba(8,126,139,0.20),rgba(17,24,39,0.9))] p-4">
                <div className="mb-4 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-200">
                  {['REPORT', 'AI', 'ROUTE'].map((label) => (
                    <div key={label} className="rounded-full border border-white/10 bg-white/5 px-2 py-2 text-center">{label}</div>
                  ))}
                </div>

                <div className="space-y-3">
                  {workflowCards.map(({ slug, label, shortText }, index) => (
                    <Link key={slug} to={`/workflow/${slug}`} className="story-node flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2 transition hover:border-cyan-400/40 hover:bg-slate-900/80">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9A441]/15 text-[10px] font-semibold text-[#F0C96A]">{String(index + 1).padStart(2, '0')}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-white">{label}</div>
                        <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{shortText}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-5 grid gap-3">
                {(['citizen', 'authority', 'admin'] as Role[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => navigate('/login', { state: { preselectedRole: role } })}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-[#D9A441]/40"
                  >
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
            {isLoggedIn ? <button onClick={onLogout} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"><LogOut className="mr-2 h-4 w-4" /> Logout</button> : null}
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
                <label className="block"><span className="mb-2 block text-sm text-slate-300">Problem title</span><input value={initialComplaintForm.title} readOnly className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Road issue near school" /></label>
                <label className="block"><span className="mb-2 block text-sm text-slate-300">Category</span><select value={initialComplaintForm.category} onChange={() => undefined} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none"><option>Road Infrastructure</option><option>Water</option><option>Electricity</option><option>Sanitation</option><option>Public Safety</option><option>Education</option><option>Healthcare</option><option>Transport</option><option>Environment</option><option>Government Services</option><option>Other</option></select></label>
                <label className="block md:col-span-2"><span className="mb-2 block text-sm text-slate-300">Location</span><input value={initialComplaintForm.location} readOnly className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Near Government High School, Sector 12" /></label>
                <label className="block md:col-span-2"><span className="mb-2 block text-sm text-slate-300">Description</span><textarea value={initialComplaintForm.description} readOnly rows={5} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Describe the issue in natural language" /></label>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link to="/citizen/report" className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 font-medium text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.45)]"><BrainCircuit className="mr-2 h-4 w-4" /> Submit & analyze</Link>
                <button className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white">Upload evidence</button>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6">
              <div className="mb-5 flex items-center justify-between"><div><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Complaint tracker</div><h3 className="mt-2 text-2xl font-semibold text-white">Live complaint insight</h3></div><span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-violet-300">CIV-2026-004821</span></div>
              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center justify-between"><div><div className="text-xs uppercase tracking-[0.16em] text-slate-400">Status</div><div className="mt-2 text-xl font-semibold text-white">UNDER REVIEW</div></div><div className="rounded-full border px-2 py-1 text-xs uppercase tracking-[0.18em]" style={{ borderColor: `${priorityColors.High}66`, backgroundColor: `${priorityColors.High}1A`, color: priorityColors.High }}>High</div></div></div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Assigned department</div><div className="mt-2 text-lg font-medium text-cyan-200">Municipal Roads Department</div><div className="mt-2 text-sm text-slate-300">Officer: S. Mehta</div></div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-400">AI summary</div><p className="mt-2 text-sm leading-6 text-slate-200">Potential public safety hazard near a school. Immediate inspection and temporary safety measures are recommended.</p></div>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  )
}

function CitizenLayout({ user, complaints, onLogout, onStatusUpdate, onAddResponse, responseDraft, setResponseDraft, formData, setFormData, submitForm, isLoggedIn }: {
  user: User | null
  complaints: Complaint[]
  onLogout: () => void
  onStatusUpdate: (newStatus: ComplaintStatus) => Promise<void>
  onAddResponse: () => Promise<void>
  responseDraft: string
  setResponseDraft: (value: string) => void
  formData: ComplaintInput
  setFormData: (value: ComplaintInput) => void
  submitForm: () => Promise<Complaint | undefined>
  isLoggedIn: boolean
}) {
  return (
    <PortalShell title="Citizen Portal" subtitle="Public services" sidebarItems={citizenNavItems} user={user} onLogout={onLogout} currentRole="citizen">
      <Outlet context={{ user, complaints, onLogout, onStatusUpdate, onAddResponse, responseDraft, setResponseDraft, formData, setFormData, submitForm, isLoggedIn }} />
    </PortalShell>
  )
}

function AuthorityLayout({ user, complaints, onLogout, onStatusUpdate, onAddResponse, responseDraft, setResponseDraft }: {
  user: User | null
  complaints: Complaint[]
  onLogout: () => void
  onStatusUpdate: (newStatus: ComplaintStatus) => Promise<void>
  onAddResponse: () => Promise<void>
  responseDraft: string
  setResponseDraft: (value: string) => void
}) {
  return (
    <PortalShell title="Authority Portal" subtitle="Civic action desk" sidebarItems={authorityNavItems} user={user} onLogout={onLogout} currentRole="authority">
      <Outlet context={{ user, complaints, onLogout, onStatusUpdate, onAddResponse, responseDraft, setResponseDraft }} />
    </PortalShell>
  )
}

function AdminLayout({ user, complaints, onLogout }: { user: User | null; complaints: Complaint[]; onLogout: () => void }) {
  return (
    <PortalShell title="Admin Portal" subtitle="System oversight" sidebarItems={adminNavItems} user={user} onLogout={onLogout} currentRole="admin">
      <Outlet context={{ user, complaints, onLogout }} />
    </PortalShell>
  )
}

function JusticeLayout({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-[#040914] text-slate-100">
      <AppHeader isLoggedIn={!!user} user={user} onLogout={onLogout} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          {justiceNavItems.map(({ label, to, icon: Icon }) => (
            <NavLink key={label} to={to} className={({ isActive }) => `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.16em] ${isActive ? 'border-[#D9A441]/60 bg-[#D9A441]/10 text-[#F7F4ED]' : 'border-white/10 bg-white/5 text-slate-300'}`}>
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
        </div>
        <Outlet />
      </div>
    </div>
  )
}

function PublicLayout({ user, isLoggedIn, onLogout }: { user: User | null; isLoggedIn: boolean; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-[#040914] text-slate-100">
      <AppHeader isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />
      <Outlet />
      <AIChatWidget />
    </div>
  )
}

function CitizenDashboardPage({ complaints, totalResolved }: { complaints: Complaint[]; totalResolved: number }) {
  const activeComplaints = complaints.filter((item) => item.status !== 'RESOLVED').length
  const pendingComplaints = complaints.filter((item) => ['UNDER REVIEW', 'AI ANALYZED', 'ASSIGNED', 'IN PROGRESS'].includes(item.status)).length

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 via-slate-900 to-slate-950 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-cyan-300">Citizen portal</div>
            <h2 className="mt-3 text-3xl font-semibold text-white">Your city, your voice, your rights</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-300">Track grievances, connect with official departments, and follow every step from report to resolution.</p>
          </div>
          <Link to="/citizen/report" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 font-medium text-slate-950">Report new issue</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Active Complaints', total: activeComplaints, path: '/citizen/complaints', accent: 'cyan' },
          { label: 'Pending', total: pendingComplaints, path: '/citizen/complaints?status=pending', accent: 'amber' },
          { label: 'Resolved', total: totalResolved, path: '/citizen/complaints?status=resolved', accent: 'emerald' },
          { label: 'Notifications', total: 4, path: '/citizen/notifications', accent: 'violet' },
        ].map((card) => (
          <Link key={card.label} to={card.path} className="rounded-[24px] border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{card.label}</div>
            <div className="mt-3 text-3xl font-semibold text-white">{card.total}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Authorized departments</div>
              <h3 className="mt-2 text-xl font-semibold text-white">Official civic service desks</h3>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {departmentProfiles.map((department) => (
              <div key={department.name} className="rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-4 shadow-[0_0_24px_rgba(8,126,139,0.12)]">
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{department.icon}</div>
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-200">Active</span>
                </div>
                <div className="mt-4 text-lg font-semibold text-white">{department.name}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">Designation</div>
                <div className="mt-1 text-sm text-cyan-100">{department.designation}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">Office</div>
                <div className="mt-1 text-sm text-slate-200">{department.officeName}</div>
                <div className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">Official email</div>
                <div className="mt-1 text-sm text-cyan-200">{department.email}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
            <h3 className="text-xl font-semibold text-white">AI civic assistant</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {['Which department handles this issue?', 'How can I track my complaint?', 'What are my rights as a citizen?'].map((question) => (
                <button key={question} className="block w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left text-slate-200 hover:border-cyan-400/30">{question}</button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
            <h3 className="text-xl font-semibold text-white">Quick actions</h3>
            <div className="mt-4 grid gap-3">
              <Link to="/citizen/report" className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">Submit complaint</Link>
              <Link to="/citizen/track" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white">Track complaint</Link>
              <Link to="/justice/case-studies" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white">Explore legal remedies</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Recent complaints</h3>
          <Link to="/citizen/complaints" className="text-sm text-cyan-300">View all</Link>
        </div>
        <div className="space-y-3">
          {complaints.slice(0, 4).map((item) => (
            <Link key={item.id} to={`/citizen/complaints/${item.id}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-left hover:border-cyan-400/30">
              <div>
                <div className="text-sm font-medium text-white">{item.title}</div>
                <div className="mt-1 text-xs text-slate-400">{item.id}</div>
              </div>
              <span className="rounded-full border border-violet-400/40 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-violet-200">{item.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function CitizenReportPage({ formData, setFormData, submitForm, isAnalyzing, analysisSteps }: { formData: ComplaintInput; setFormData: (value: ComplaintInput) => void; submitForm: () => Promise<Complaint | undefined>; isAnalyzing: boolean; analysisSteps: string[] }) {
  const navigate = useNavigate()

  const onSubmit = async () => {
    const result = await submitForm()
    if (result) navigate(`/citizen/complaints/${result.id}`)
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6">
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
        <label className="block md:col-span-2"><span className="mb-2 block text-sm text-slate-300">Problem location</span><input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Near Government High School, Sector 12" /></label>
        <label className="block"><span className="mb-2 block text-sm text-slate-300">Latitude</span><input type="number" step="0.0001" value={formData.latitude ?? 16.5062} onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" /></label>
        <label className="block"><span className="mb-2 block text-sm text-slate-300">Longitude</span><input type="number" step="0.0001" value={formData.longitude ?? 80.648} onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" /></label>
        <label className="block md:col-span-2"><span className="mb-2 block text-sm text-slate-300">Description</span><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Describe the issue in natural language" /></label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button onClick={onSubmit} className="rounded-full bg-gradient-to-r from-[#087E8B] to-[#641C2A] px-5 py-3 font-medium text-white shadow-[0_0_20px_rgba(34,211,238,0.45)]">Submit & analyze</button>
        <button className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white">Upload evidence</button>
      </div>

      {isAnalyzing ? (
        <div className="mt-8 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-5">
          <div className="flex items-center gap-2 text-cyan-200"><Activity className="h-4 w-4 animate-pulse" /><span className="text-sm font-medium">AI is analyzing your complaint...</span></div>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            {analysisSteps.map((step) => (
              <div key={step} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />{step}</div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CitizenComplaintsPage({ complaints }: { complaints: Complaint[] }) {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const filter = params.get('status')
  const visibleComplaints = filter ? complaints.filter((item) => {
    if (filter === 'pending') return ['UNDER REVIEW', 'AI ANALYZED', 'ASSIGNED', 'IN PROGRESS'].includes(item.status)
    if (filter === 'resolved') return item.status === 'RESOLVED'
    return true
  }) : complaints

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">My complaints</h3>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-200"><Filter className="mr-2 inline h-3.5 w-3.5" /> Filter</button>
          <Link to="/citizen/report" className="rounded-full bg-[#087E8B] px-3 py-2 text-sm text-white">Report issue</Link>
        </div>
      </div>
      <div className="space-y-3">
        {visibleComplaints.map((item) => (
          <Link key={item.id} to={`/citizen/complaints/${item.id}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-cyan-400/30">
            <div>
              <div className="text-sm font-medium text-white">{item.title}</div>
              <div className="mt-1 text-xs text-slate-400">{item.id} • {item.department}</div>
            </div>
            <span className="rounded-full border border-violet-400/40 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-violet-200">{item.status}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function CitizenComplaintDetailPage({ complaints }: { complaints: Complaint[] }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const complaint = complaints.find((item) => item.id === id)

  if (!complaint) {
    return <NotFoundPage />
  }

  const location = getComplaintLocation(complaint)

  return (
    <div className="space-y-6 rounded-[28px] border border-white/10 bg-slate-950/60 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Complaint ID</div>
          <h3 className="mt-2 text-2xl font-semibold text-white">{complaint.id}</h3>
        </div>
        <button onClick={() => navigate('/citizen/track')} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">Track complaint</button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Status</div>
          <div className="mt-2 text-xl font-semibold text-white">{complaint.status}</div>
          <div className="mt-4 text-sm text-slate-300">Priority: <span className="font-medium text-white">{complaint.priority}</span></div>
          <div className="mt-2 text-sm text-slate-300">Department: <span className="font-medium text-white">{complaint.department}</span></div>
          <div className="mt-2 text-sm text-slate-300">Assigned authority: <span className="font-medium text-white">{complaint.authority}</span></div>
          <div className="mt-2 text-sm text-slate-300">Location: <span className="font-medium text-white">{location.address}</span></div>
          <div className="mt-2 text-sm text-slate-300">Coordinates: <span className="font-medium text-white">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span></div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.16em] text-slate-400">AI analysis</div>
          <p className="mt-3 text-sm leading-6 text-slate-200">{complaint.summary}</p>
          <div className="mt-4 text-sm text-slate-300">Suggested action: <span className="font-medium text-white">{complaint.suggestedAction}</span></div>
        </div>
      </div>

      <ComplaintLocationMap complaints={[complaint]} selectedId={complaint.id} compact={false} />

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
        <div className="mb-4 text-xs uppercase tracking-[0.18em] text-slate-400">Timeline</div>
        <div className="space-y-4">
          {complaint.timeline.map((item, index) => (
            <div key={`${item.stage}-${index}`} className="flex gap-3">
              <div className="flex flex-col items-center"><div className={`h-3 w-3 rounded-full ${index === complaint.timeline.length - 1 ? 'bg-cyan-300' : 'bg-violet-400'}`} />{index < complaint.timeline.length - 1 ? <div className="mt-2 h-8 w-px bg-white/10" /> : null}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm text-slate-300"><span className="font-medium text-white">{item.stage}</span><span>{item.date}</span></div>
                <div className="mt-1 text-sm text-slate-300">{item.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CitizenTrackPage({ complaints }: { complaints: Complaint[] }) {
  const navigate = useNavigate()
  const [trackId, setTrackId] = useState('YUVA-2026-004821')
  const result = complaints.find((item) => item.id.toLowerCase() === trackId.trim().toLowerCase())

  const handleTrack = () => {
    const trimmed = trackId.trim()
    if (!trimmed) return

    const match = complaints.find((item) => item.id.toLowerCase() === trimmed.toLowerCase())
    if (match) {
      navigate(`/citizen/complaints/${match.id}`)
    }
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Track complaint</h3>
        <Link to="/citizen/complaints" className="text-sm text-cyan-300">View all</Link>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input value={trackId} onChange={(e) => setTrackId(e.target.value)} className="flex-1 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none" placeholder="Enter complaint ID" />
        <button onClick={handleTrack} className="rounded-full bg-[#087E8B] px-5 py-3 text-sm font-medium text-white">Track complaint</button>
      </div>

      {result ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Complaint</div>
              <div className="mt-2 text-xl font-semibold text-white">{result.title}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</div>
              <div className="mt-2 text-xl font-semibold text-white">{result.status}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Priority</div>
              <div className="mt-2 text-white">{result.priority}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Department</div>
              <div className="mt-2 text-white">{result.department}</div>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Latest update</div>
            <div className="mt-2 text-sm text-slate-200">{result.summary}</div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-slate-900/60 p-5 text-slate-300">No complaint found for that ID. Try YUVA-2026-004821.</div>
      )}
    </div>
  )
}

function CitizenNotificationsPage() {
  return <PlaceholderPage title="Notifications" description="Your civic updates, reminders, and response notifications will appear here in real time." icon={Bell} />
}

function CitizenFeedbackPage() {
  return <PlaceholderPage title="Feedback" description="Share your service experience and help improve the civic journey." icon={MessageSquareText} />
}

function CitizenProfilePage() {
  return <PlaceholderPage title="Profile" description="Manage your public identity, contact information, and service preferences." icon={UserRound} />
}

function CitizenSettingsPage() {
  return <PlaceholderPage title="Settings" description="Update privacy preferences, notifications, and portal settings." icon={Settings} />
}

function AuthorityDashboardPage({ complaints }: { complaints: Complaint[] }) {
  const totalComplaints = complaints.length
  const highPriority = complaints.filter((item) => item.priority === 'High').length
  const escalated = complaints.filter((item) => item.status === 'UNDER REVIEW').length
  const resolved = complaints.filter((item) => item.status === 'RESOLVED').length

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] border border-violet-400/20 bg-gradient-to-r from-violet-500/10 via-slate-900 to-slate-950 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-violet-300">Authority portal</div>
            <h2 className="mt-3 text-3xl font-semibold text-white">Civic action desk</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-300">Monitor active grievances, assign the right officer, and close cases with verified outcomes.</p>
          </div>
          <Link to="/authority/complaints" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-400 to-indigo-500 px-5 py-3 font-medium text-white">Open queue</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Complaints', total: totalComplaints, path: '/authority/complaints' },
          { label: 'High Priority', total: highPriority, path: '/authority/priority' },
          { label: 'Escalated', total: escalated, path: '/authority/escalations' },
          { label: 'Resolved', total: resolved, path: '/authority/resolved' },
        ].map((card) => (
          <Link key={card.label} to={card.path} className="rounded-[24px] border border-white/10 bg-white/5 p-4 hover:border-violet-400/30">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{card.label}</div>
            <div className="mt-3 text-3xl font-semibold text-white">{card.total}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-violet-300">Authority directory</div>
              <h3 className="mt-2 text-xl font-semibold text-white">Approved civic departments</h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {authorityProfiles.map((authority) => (
              <div key={authority.email} className="rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{authority.shortLabel === 'Roads' ? '🛣️' : authority.shortLabel === 'Health' ? '🏥' : authority.shortLabel === 'Finance' ? '💰' : authority.shortLabel === 'Women Safety' ? '🛡️' : authority.shortLabel === 'Water' ? '💧' : '🚮'}</div>
                  <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-violet-200">Verified</span>
                </div>
                <div className="mt-4 text-lg font-semibold text-white">{authority.name}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">Designation</div>
                <div className="mt-1 text-sm text-violet-100">{authority.designation}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">Office</div>
                <div className="mt-1 text-sm text-slate-200">{authority.officeName}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">Login email</div>
                <div className="mt-1 text-sm text-violet-200">{authority.email}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
            <h3 className="text-xl font-semibold text-white">Priority queue</h3>
            <div className="mt-5 space-y-3">
              {complaints.slice(0, 4).map((item) => (
                <Link key={item.id} to={`/authority/complaints/${item.id}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 hover:border-violet-400/30">
                  <div>
                    <div className="text-sm font-medium text-white">{item.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{item.department} • {item.priority}</div>
                  </div>
                  <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-200">{item.status}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
            <h3 className="text-xl font-semibold text-white">Quick actions</h3>
            <div className="mt-4 grid gap-3">
              <Link to="/authority/complaints" className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-3 text-sm text-violet-100">Review complaint queue</Link>
              <Link to="/authority/priority" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white">View urgent priorities</Link>
              <Link to="/authority/resolved" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white">Resolved case archive</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Recently solved cases</h3>
          <Link to="/authority/resolved" className="text-sm text-violet-300">View all</Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {solvedCaseGallery.map((item) => (
            <div key={item.title} className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/80">
              <div className="h-40 w-full bg-cover bg-center" style={{ backgroundImage: item.image }} />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-300">{item.status}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{item.department}</span>
                </div>
                <div className="mt-3 text-lg font-semibold text-white">{item.title}</div>
                <div className="mt-2 text-sm text-slate-300">{item.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AuthorityComplaintsPage({ complaints }: { complaints: Complaint[] }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Complaint queue</h3>
        <Link to="/authority/priority" className="text-sm text-violet-300">Priority view</Link>
      </div>
      <div className="space-y-3">
        {complaints.map((item) => (
          <Link key={item.id} to={`/authority/complaints/${item.id}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-violet-400/30">
            <div>
              <div className="text-sm font-medium text-white">{item.title}</div>
              <div className="mt-1 text-xs text-slate-400">{item.id} • {item.location}</div>
            </div>
            <span className="rounded-full border border-violet-400/40 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-violet-200">{item.priority}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function AuthorityComplaintDetailPage({ complaints }: { complaints: Complaint[] }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const complaint = complaints.find((item) => item.id === id)

  if (!complaint) return <NotFoundPage />

  const location = getComplaintLocation(complaint)

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Complaint</div>
          <h3 className="mt-2 text-2xl font-semibold text-white">{complaint.title}</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/authority/complaints')} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">List</button>
          <button className="rounded-full bg-[#087E8B] px-3 py-2 text-sm font-medium text-white">Assign</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">AI analysis</div>
            <p className="mt-3 text-sm leading-6 text-slate-200">{complaint.summary}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Location</div>
            <div className="mt-2 text-sm text-slate-200">{location.address}</div>
            <div className="mt-2 text-xs text-slate-400">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Timeline</div>
            <div className="mt-4 space-y-4">
              {complaint.timeline.map((item, index) => (
                <div key={`${item.stage}-${index}`} className="flex gap-3">
                  <div className="flex flex-col items-center"><div className={`h-3 w-3 rounded-full ${index === complaint.timeline.length - 1 ? 'bg-cyan-300' : 'bg-violet-400'}`} />{index < complaint.timeline.length - 1 ? <div className="mt-2 h-8 w-px bg-white/10" /> : null}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm text-slate-300"><span className="font-medium text-white">{item.stage}</span><span>{item.date}</span></div>
                    <div className="mt-1 text-sm text-slate-300">{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <ComplaintLocationMap complaints={[complaint]} selectedId={complaint.id} compact />
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Actions</div>
            <div className="mt-4 space-y-3">
              <button onClick={() => navigate('/authority/escalations')} className="w-full rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">Escalate</button>
              <button onClick={() => navigate('/authority/resolved')} className="w-full rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">Resolve</button>
              <button className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">Update status</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AuthorityPriorityPage() { return <PlaceholderPage title="Priority Cases" description="Review the highest-risk issues and assign urgent resources quickly." icon={TrendingUp} /> }
function AuthorityAssignedPage() { return <PlaceholderPage title="Assigned Cases" description="See all open cases assigned to the current authority team." icon={ClipboardList} /> }
function AuthorityEscalationsPage() { return <PlaceholderPage title="Escalations" description="Review escalated matters requiring higher-level intervention." icon={AlertTriangle} /> }
function AuthorityResolvedPage() { return <PlaceholderPage title="Resolved Cases" description="Review and verify complaints that have been closed successfully." icon={CheckCircle2} /> }
function AuthorityAnalyticsPage() { return <PlaceholderPage title="Analytics" description="Track complaint trends, resolution metrics, and response times." icon={BarChart3} /> }
function AuthorityMapPage({ complaints }: { complaints: Complaint[] }) {
  const navigate = useNavigate()
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  const filteredComplaints = complaints.filter((complaint) => {
    const categoryMatch = categoryFilter === 'All' || complaint.category === categoryFilter
    const priorityMatch = priorityFilter === 'All' || complaint.priority === priorityFilter
    return categoryMatch && priorityMatch
  })

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
      <div className="mb-5 flex flex-wrap gap-3">
        {['All', 'Road Infrastructure', 'Water', 'Electricity', 'Sanitation', 'Public Safety', 'Environment'].map((option) => (
          <button key={option} onClick={() => setCategoryFilter(option)} className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.16em] ${categoryFilter === option ? 'bg-[#087E8B] text-white' : 'border border-white/10 bg-white/5 text-slate-200'}`}>{option}</button>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap gap-3">
        {['All', 'Critical', 'High', 'Medium', 'Low'].map((option) => (
          <button key={option} onClick={() => setPriorityFilter(option)} className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.16em] ${priorityFilter === option ? 'bg-[#D9A441] text-[#171717]' : 'border border-white/10 bg-white/5 text-slate-200'}`}>{option}</button>
        ))}
      </div>
      <ComplaintLocationMap complaints={filteredComplaints} onSelect={(id) => navigate(`/authority/complaints/${id}`)} />
    </div>
  )
}
function AuthorityNotificationsPage() { return <PlaceholderPage title="Notifications" description="Monitor alerts, updates, and user actions from the civic network." icon={BellRing} /> }
function AuthorityProfilePage() { return <PlaceholderPage title="Profile" description="Manage your authority profile, team details, and operational settings." icon={UserRound} /> }
function AuthoritySettingsPage() { return <PlaceholderPage title="Settings" description="Update operational preferences, escalations, and department controls." icon={Settings} /> }

function AdminDashboardPage() {
  const cards = [
    { label: 'Users', to: '/admin/users', count: 84 },
    { label: 'Authorities', to: '/admin/authorities', count: 19 },
    { label: 'Complaints', to: '/admin/complaints', count: 142 },
    { label: 'Cases', to: '/admin/cases', count: 37 },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-amber-300">Admin control room</div>
            <h2 className="mt-3 text-3xl font-semibold text-white">System oversight and governance intelligence</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-300">Monitor departments, citizens, escalations, and civic performance across the complete platform.</p>
          </div>
          <Link to="/admin/users" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-300 to-orange-500 px-5 py-3 font-medium text-slate-950">Open admin panel</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} to={card.to} className="rounded-[24px] border border-white/10 bg-white/5 p-4 hover:border-[#D9A441]/40">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{card.label}</div>
            <div className="mt-3 text-3xl font-semibold text-white">{card.count}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
          <h3 className="text-xl font-semibold text-white">System overview</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Active departments</div><div className="mt-2 text-2xl font-semibold text-white">12</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Pending escalations</div><div className="mt-2 text-2xl font-semibold text-white">8</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Resolution rate</div><div className="mt-2 text-2xl font-semibold text-white">82%</div></div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
          <h3 className="text-xl font-semibold text-white">Quick actions</h3>
          <div className="mt-4 grid gap-3">
            <Link to="/admin/authorities" className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">Review authorities</Link>
            <Link to="/admin/complaints" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white">Audit complaints</Link>
            <Link to="/admin/analytics" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white">Platform analytics</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminUsersPage() { return <PlaceholderPage title="Users" description="Manage all registered platform users and role assignments." icon={Users} /> }
function AdminCitizensPage() { return <PlaceholderPage title="Citizens" description="Monitor public registrations, service access, and engagement metrics." icon={UserRound} /> }
function AdminAuthoritiesPage() { return <PlaceholderPage title="Authorities" description="Manage departments, officers, and governance roles across the system." icon={Building2} /> }
function AdminDepartmentsPage() { return <PlaceholderPage title="Departments" description="Review department performance and operational coverage." icon={Building} /> }
function AdminComplaintsPage() { return <PlaceholderPage title="Complaints" description="Track all civic complaints across the platform in a central operational view." icon={FileText} /> }
function AdminCasesPage() { return <PlaceholderPage title="Cases" description="Review legal and governance matters under active case management." icon={Scale} /> }
function AdminNewsPage() { return <PlaceholderPage title="News" description="Manage civic and legal updates, announcements, and public communications." icon={Newspaper} /> }
function AdminAnalyticsPage() { return <PlaceholderPage title="Analytics" description="Inspect platform performance, resolution rates, and service quality trends." icon={BarChart3} /> }
function AdminSettingsPage() { return <PlaceholderPage title="Settings" description="Configure system policies, portal preferences, and administrative controls." icon={Settings} /> }

function JusticePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
        <div className="text-xs uppercase tracking-[0.22em] text-cyan-300">AI Judiciary</div>
        <h2 className="mt-4 text-3xl font-semibold text-white">Case explorer and legal knowledge hub</h2>
        <p className="mt-4 text-slate-300">Use AI-supported tools to understand legal rights, case patterns, and public interest matters.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/justice/cases" className="rounded-full bg-[#087E8B] px-4 py-2 text-sm font-medium text-white">Case Explorer</Link>
          <Link to="/justice/case-studies" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">Case Studies</Link>
          <Link to="/justice/legal-search" className="rounded-full border border-[#D9A441]/40 bg-[#D9A441]/10 px-4 py-2 text-sm text-[#F7F4ED]">Legal Search</Link>
        </div>
      </div>
      <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
        <div className="mb-5 flex items-center gap-2 text-white"><Landmark className="h-4 w-4 text-cyan-300" /> Legal knowledge hub</div>
        <div className="flex flex-wrap gap-2">{legalTopics.map((topic) => <span key={topic} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.1em] text-slate-200">{topic}</span>)}</div>
      </div>
    </div>
  )
}

function JusticeCasesPage() {
  return (
    <div className="space-y-4">
      {judiciaryCases.map((item) => (
        <div key={item.title} className="rounded-[26px] border border-white/10 bg-slate-900/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xl font-semibold text-white">{item.title}</div>
              <div className="mt-1 text-sm text-slate-400">{item.court} • {item.status}</div>
            </div>
            <Link to={`/justice/cases/${encodeURIComponent(item.title)}`} className="rounded-full bg-[#087E8B] px-3 py-2 text-sm text-white">View Case</Link>
          </div>
          <div className="mt-4 text-sm leading-6 text-slate-300">{item.summary}</div>
        </div>
      ))}
    </div>
  )
}

function JusticeCaseDetailPage() {
  const { id } = useParams()
  const caseItem = judiciaryCases.find((item) => encodeURIComponent(item.title) === id)
  if (!caseItem) return <NotFoundPage />

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
      <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Case detail</div>
      <h2 className="mt-4 text-3xl font-semibold text-white">{caseItem.title}</h2>
      <p className="mt-3 text-slate-300">{caseItem.summary}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Court</div><div className="mt-2 text-white">{caseItem.court}</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</div><div className="mt-2 text-white">{caseItem.status}</div></div>
      </div>
      <div className="mt-5 rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4 text-sm leading-6 text-violet-100">{caseItem.keyIssue}</div>
    </div>
  )
}

function JusticeCaseStudiesPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">{caseStudies.map((study) => <div key={study.title} className="group rounded-[28px] border border-white/10 bg-slate-900/80 p-5 transition hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.12)]"><div className="mb-4 flex items-center justify-between"><span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-200">{study.filter}</span><ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-300" /></div><div className="text-xl font-semibold text-white">{study.title}</div><div className="mt-4 text-sm leading-6 text-slate-300"><div className="mb-3"><span className="font-medium text-white">Problem:</span> {study.problem}</div><div><span className="font-medium text-white">Outcome:</span> {study.outcome}</div></div></div>)}</div>
  )
}

function JusticeLegalSearchPage() { return <PlaceholderPage title="Legal Search" description="Search legal provisions, rights, and guidance across the justice knowledge base." icon={Search} /> }
function JusticeLegalTermsPage() { return <PlaceholderPage title="Legal Terms" description="Explore common legal terms, rights, and procedural concepts in plain language." icon={Scale} /> }

function NewsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Daily news</div>
          <h2 className="mt-4 text-3xl font-semibold text-white">Civic, legal and governance updates</h2>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">{newsData.map((news) => <div key={news.title} className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5"><div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400"><span>{news.category}</span><span>{news.date}</span></div><div className="mt-4 text-xl font-semibold text-white">{news.title}</div><div className="mt-3 text-sm text-slate-300">{news.summary}</div><div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-400"><span>{news.source}</span><button className="text-cyan-300">Read more</button></div></div>)}</div>
    </div>
  )
}

function AboutPage() { return <PlaceholderPage title="About YUVA" description="YUVA connects citizen grievances, public authorities, and justice workflows through AI-powered governance services." icon={ShieldCheck} /> }
function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = (location.state ?? {}) as { preselectedRole?: Role; prefilledEmail?: string; prefilledPassword?: string }
  const [selectedRole, setSelectedRole] = useState<Role>(routeState.preselectedRole ?? 'citizen')
  const [email, setEmail] = useState(routeState.prefilledEmail ?? 'citizen@yuva.in')
  const [password, setPassword] = useState(routeState.prefilledPassword ?? '123456')
  const [error, setError] = useState('')

  const roleOptions = [
    { label: 'Citizen', value: 'citizen' as const, description: 'Public portal', email: 'citizen@yuva.in', password: '123456' },
    { label: 'Authority', value: 'authority' as const, description: 'Government dashboard', email: 'roads@yuva.in', password: 'Roads@2026' },
    { label: 'Admin', value: 'admin' as const, description: 'System control', email: 'admin@yuva.in', password: '123456' },
  ]

  const handleSubmit = async () => {
    try {
      setError('')
      navigate('/login/verify', {
        state: {
          role: selectedRole,
          email,
          password,
        },
      })
    } catch {
      setError('The credentials do not match an authorized account for this portal.')
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-10">
      <div className="w-full overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/80 shadow-[0_0_40px_rgba(8,126,139,0.14)]">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-white/10 bg-gradient-to-br from-[#0b1726] via-[#091722] to-[#0f172a] p-8 lg:border-b-0 lg:border-r">
            <div className="inline-flex items-center rounded-full border border-[#D9A441]/30 bg-[#D9A441]/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#F7F4ED]">
              Government Access Portal
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-white md:text-4xl">Secure civic service access</h2>
            <p className="mt-4 max-w-md text-slate-300">Sign in to access the authorized citizen, authority, or administrative dashboard with verified civic credentials.</p>

            <div className="mt-8 space-y-4">
              {roleOptions.map((role) => (
                <div
                  key={role.value}
                  className={`rounded-2xl border p-4 ${selectedRole === role.value ? 'border-cyan-400/40 bg-cyan-500/10' : 'border-white/10 bg-white/5'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-medium text-white">{role.label}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">{role.description}</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-slate-950/60 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200">{role.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-cyan-300">Secure sign in</div>
                <h3 className="mt-2 text-3xl font-semibold text-white">Access your portal</h3>
              </div>
              <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-300">SSL protected</div>
            </div>

            <div className="mt-8">
              <div className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-400">Select portal</div>
              <div className="grid gap-3 md:grid-cols-3">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => {
                      setSelectedRole(role.value)
                      setEmail(role.email)
                      setPassword(role.password)
                    }}
                    className={`rounded-2xl border p-3 text-left transition ${selectedRole === role.value ? 'border-cyan-400/40 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:border-cyan-400/30'}`}
                  >
                    <div className="text-base font-medium capitalize text-white">{role.label}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-slate-400">{role.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-5">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Official Email / User ID</span>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="name@yuva.in or official ID" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Password</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Enter password" />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-white/10 bg-slate-950 text-cyan-400" />
                Remember this device
              </label>
              <Link to="/forgot-password" className="text-cyan-300 hover:text-cyan-200">Forgot password?</Link>
            </div>

            {error ? <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={handleSubmit} className="rounded-full bg-gradient-to-r from-[#D9A441] via-[#D9A441] to-[#641C2A] px-6 py-3 font-medium text-[#171717] shadow-[0_0_28px_rgba(217,164,65,0.28)]">Continue to portal</button>
              <Link to="/register" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white">Create account</Link>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
              Use the official email or user ID assigned by your department, authority, or administrator.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
function RegisterPage({ onRegister }: { onRegister: (role: Role, name: string, email: string, password: string) => Promise<void> }) {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<Role>('citizen')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please complete all fields before creating your account.')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      await onRegister(selectedRole, name.trim(), email.trim(), password)
      navigate('/login', {
        state: {
          preselectedRole: selectedRole,
          prefilledEmail: email.trim(),
          prefilledPassword: password,
        },
      })
    } catch {
      setError('Registration failed. Please try again with a different email.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-900/80 p-8">
        <div className="text-xs uppercase tracking-[0.22em] text-violet-300">Register</div>
        <h2 className="mt-4 text-3xl font-semibold text-white">Create an account</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(['citizen', 'authority', 'admin'] as Role[]).map((role) => (
            <button key={role} onClick={() => setSelectedRole(role)} className={`rounded-2xl border p-5 text-left transition ${selectedRole === role ? 'border-violet-400/40 bg-violet-500/10' : 'border-white/10 bg-white/5 hover:border-violet-400/30'}`}>
              <div className="text-lg font-medium capitalize text-white">{role}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.15em] text-slate-400">{role === 'citizen' ? 'Public portal' : role === 'authority' ? 'Government dashboard' : 'System control'}</div>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" placeholder="Enter full name" />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" placeholder="name@example.com" />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" placeholder="Create a password" />
          </label>
        </div>

        {error ? <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={handleSubmit} disabled={isSubmitting} className="rounded-full bg-gradient-to-r from-violet-400 to-cyan-500 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? 'Creating account...' : 'Create account'}</button>
          <Link to="/login" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">Already have an account? Sign in</Link>
        </div>
      </div>
    </div>
  )
}
function ForgotPasswordPage() { return <PlaceholderPage title="Forgot password" description="Recover your account and regain access to your portal securely." icon={ShieldCheck} /> }

function VerificationPage({ onLogin }: { onLogin: (role: Role, email?: string, password?: string) => Promise<void> }) {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as { role?: Role; email?: string; password?: string }
  const role = state.role ?? 'citizen'
  const email = state.email ?? ''
  const password = state.password ?? ''
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = async () => {
    if (!email || !password) {
      navigate('/login')
      return
    }

    try {
      setIsVerifying(true)
      setError('')
      await onLogin(role, email, password)
      navigate(role === 'citizen' ? '/citizen/dashboard' : role === 'authority' ? '/authority/dashboard' : '/admin/dashboard')
    } catch {
      setError('Verification failed. The credentials do not match an authorized account for this portal.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-900/80 p-8">
        <div className="text-xs uppercase tracking-[0.22em] text-[#D9A441]">Verification</div>
        <h2 className="mt-4 text-3xl font-semibold text-white">Secure login check</h2>
        <p className="mt-3 text-slate-300">We are validating the account details before granting access to your {role} portal.</p>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Portal</span>
            <span className="font-medium capitalize text-white">{role}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
            <span>Email</span>
            <span className="font-medium text-white">{email}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
            <span>Security status</span>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-300">Verified</span>
          </div>
        </div>

        {error ? <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={handleVerify} disabled={isVerifying} className="rounded-full bg-gradient-to-r from-[#D9A441] via-[#D9A441] to-[#641C2A] px-5 py-3 font-medium text-[#171717] disabled:cursor-not-allowed disabled:opacity-70">
            {isVerifying ? 'Verifying...' : 'Verify & Continue'}
          </button>
          <button onClick={() => navigate('/login')} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white">Back to login</button>
        </div>
      </div>
    </div>
  )
}

function AIAssistantPage() {
  const quickQuestions = [
    'Which department handles a road pothole near a school?',
    'How do I track my complaint status?',
    'Who handles women safety complaints?',
    'What is the process for a health grievance?',
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">AI assistant</div>
          <h2 className="mt-3 text-3xl font-semibold text-white">Civic guidance and complaint routing</h2>
        </div>
        <div className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">Live support</div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
        <div className="text-sm uppercase tracking-[0.18em] text-slate-400">Quick prompts</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {quickQuestions.map((question) => (
            <button
              key={question}
              onClick={() => document.dispatchEvent(new CustomEvent('yuva-chat-question', { detail: question }))}
              className="block w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-left text-sm text-slate-200 transition hover:border-cyan-400/30"
            >
              {question}
            </button>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-violet-400/25 bg-violet-500/10 p-4 text-sm text-violet-100">
          Ask about road issues, health, women safety, finance, water, sanitation, or complaint tracking. The assistant will route the issue to the relevant department.
        </div>
      </div>
    </div>
  )
}
function TransparencyPage() { return <PlaceholderPage title="Transparency" description="Monitor department performance, service timelines, and public accountability metrics." icon={BarChart3} /> }
function MapPage() { return <PlaceholderPage title="Map" description="View complaint hotspots and location-based civic issues across the city." icon={MapPin} /> }
function TrackPage({ complaints }: { complaints: Complaint[] }) { return <CitizenTrackPage complaints={complaints} /> }
function NotificationsPage() { return <CitizenNotificationsPage /> }

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, { email: string; password: string; name: string; role: Role }>>({})
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

  const handleLogin = async (role: Role, emailOverride?: string, passwordOverride?: string) => {
    const allowedCredentials: Record<Role, { email: string; password: string; name: string }[]> = {
      citizen: [{ email: 'citizen@yuva.in', password: '123456', name: 'Citizen User' }],
      authority: [
        { email: 'roads@yuva.in', password: 'Roads@2026', name: 'Road Management System' },
        { email: 'health@yuva.in', password: 'Health@2026', name: 'Health Department' },
        { email: 'finance@yuva.in', password: 'Finance@2026', name: 'Finance & Budget Office' },
        { email: 'women-safety@yuva.in', password: 'Safety@2026', name: 'Women Safety Cell' },
        { email: 'water@yuva.in', password: 'Water@2026', name: 'Water Supply Board' },
        { email: 'sanitation@yuva.in', password: 'Sanitation@2026', name: 'Urban Sanitation Wing' },
      ],
      admin: [{ email: 'admin@yuva.in', password: '123456', name: 'System Admin' }],
    }

    const email = (emailOverride ?? (role === 'citizen' ? 'citizen@yuva.in' : role === 'authority' ? 'roads@yuva.in' : 'admin@yuva.in')).trim().toLowerCase()
    const password = passwordOverride ?? (role === 'citizen' ? '123456' : role === 'authority' ? 'Roads@2026' : '123456')

    const registeredCredential = Object.values(registeredUsers).find(
      (entry) => entry.role === role && entry.email.toLowerCase() === email && entry.password === password,
    )

    const credential = allowedCredentials[role].find((entry) => entry.email.toLowerCase() === email && entry.password === password) ?? (registeredCredential ? {
      email: registeredCredential.email,
      password: registeredCredential.password,
      name: registeredCredential.name,
    } : undefined)

    if (!credential) {
      throw new Error('Unauthorized login attempt')
    }

    try {
      const result = await loginUser(role, email, password)
      setUser(result.user)
      setIsLoggedIn(true)

      const { complaints: nextComplaints } = await fetchComplaints()
      setComplaints(nextComplaints)
      if (nextComplaints[0]) setSelectedComplaintId(nextComplaints[0].id)
    } catch (error) {
      console.error(error)
      const fallbackUser: User = {
        id: `${role}-${credential.email}`,
        name: credential.name,
        email: credential.email,
        role,
      }
      setUser(fallbackUser)
      setIsLoggedIn(true)
    }
  }

  const handleRegister = async (role: Role, name: string, email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    const existing = Object.values(registeredUsers).find((entry) => entry.email.toLowerCase() === normalizedEmail)

    if (existing) {
      throw new Error('User already exists')
    }

    const generatedUser: User = {
      id: `${role}-${Date.now()}`,
      name: name.trim() || (role === 'citizen' ? 'New Citizen' : role === 'authority' ? 'New Authority' : 'New Admin'),
      email: normalizedEmail,
      role,
    }

    setRegisteredUsers((current) => ({
      ...current,
      [normalizedEmail]: {
        email: normalizedEmail,
        password,
        name: generatedUser.name,
        role,
      },
    }))

    setUser(generatedUser)
    setIsLoggedIn(false)

    const { complaints: nextComplaints } = await fetchComplaints().catch(() => ({ complaints: [] }))
    setComplaints(nextComplaints)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
  }

  const submitForm = async (): Promise<Complaint | undefined> => {
    if (!formData.title.trim() || !formData.location.trim()) return undefined

    setIsAnalyzing(true)
    setAnalysisSteps([])

    const steps = [
      'Understanding problem...',
      'Identifying category...',
      'Analyzing urgency...',
      'Finding responsible authority...',
      'Checking similar complaints...',
      'Routing complaint...',
    ]

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
      setFormData(initialComplaintForm)
      return complaint
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
    <Routes>
      <Route path="/" element={<PublicLayout user={user} isLoggedIn={isLoggedIn} onLogout={handleLogout} />}>
        <Route index element={<HomePage isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
        <Route path="transparency" element={<TransparencyPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="track" element={<TrackPage complaints={complaints} />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="login/verify" element={<VerificationPage onLogin={handleLogin} />} />
        <Route path="register" element={<RegisterPage onRegister={handleRegister} />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route path="/justice" element={<JusticeLayout user={user} onLogout={handleLogout} />}>
        <Route index element={<JusticePage />} />
        <Route path="cases" element={<JusticeCasesPage />} />
        <Route path="cases/:id" element={<JusticeCaseDetailPage />} />
        <Route path="case-studies" element={<JusticeCaseStudiesPage />} />
        <Route path="legal-search" element={<JusticeLegalSearchPage />} />
        <Route path="legal-terms" element={<JusticeLegalTermsPage />} />
      </Route>

      <Route element={<ProtectedRoute isLoggedIn={isLoggedIn}><Outlet /></ProtectedRoute>}>
        <Route path="/citizen" element={<RoleProtectedRoute isLoggedIn={isLoggedIn} userRole={user?.role ?? null} allowedRole="citizen"><CitizenLayout user={user} complaints={complaints} onLogout={handleLogout} onStatusUpdate={handleStatusUpdate} onAddResponse={handleResponseAdd} responseDraft={responseDraft} setResponseDraft={setResponseDraft} formData={formData} setFormData={setFormData} submitForm={submitForm} isLoggedIn={isLoggedIn} /></RoleProtectedRoute>}>
          <Route index element={<Navigate to="/citizen/dashboard" replace />} />
          <Route path="dashboard" element={<CitizenDashboardPage complaints={complaints} totalResolved={totalResolved} />} />
          <Route path="report" element={<CitizenReportPage formData={formData} setFormData={setFormData} submitForm={submitForm} isAnalyzing={isAnalyzing} analysisSteps={analysisSteps} />} />
          <Route path="complaints" element={<CitizenComplaintsPage complaints={complaints} />} />
          <Route path="complaints/:id" element={<CitizenComplaintDetailPage complaints={complaints} />} />
          <Route path="track" element={<CitizenTrackPage complaints={complaints} />} />
          <Route path="notifications" element={<CitizenNotificationsPage />} />
          <Route path="feedback" element={<CitizenFeedbackPage />} />
          <Route path="profile" element={<CitizenProfilePage />} />
          <Route path="settings" element={<CitizenSettingsPage />} />
        </Route>

        <Route path="/authority" element={<RoleProtectedRoute isLoggedIn={isLoggedIn} userRole={user?.role ?? null} allowedRole="authority"><AuthorityLayout user={user} complaints={complaints} onLogout={handleLogout} onStatusUpdate={handleStatusUpdate} onAddResponse={handleResponseAdd} responseDraft={responseDraft} setResponseDraft={setResponseDraft} /></RoleProtectedRoute>}>
          <Route index element={<Navigate to="/authority/dashboard" replace />} />
          <Route path="dashboard" element={<AuthorityDashboardPage complaints={complaints} />} />
          <Route path="complaints" element={<AuthorityComplaintsPage complaints={complaints} />} />
          <Route path="complaints/:id" element={<AuthorityComplaintDetailPage complaints={complaints} />} />
          <Route path="priority" element={<AuthorityPriorityPage />} />
          <Route path="assigned" element={<AuthorityAssignedPage />} />
          <Route path="escalations" element={<AuthorityEscalationsPage />} />
          <Route path="resolved" element={<AuthorityResolvedPage />} />
          <Route path="analytics" element={<AuthorityAnalyticsPage />} />
          <Route path="map" element={<AuthorityMapPage complaints={complaints} />} />
          <Route path="notifications" element={<AuthorityNotificationsPage />} />
          <Route path="profile" element={<AuthorityProfilePage />} />
          <Route path="settings" element={<AuthoritySettingsPage />} />
        </Route>

        <Route path="/admin" element={<RoleProtectedRoute isLoggedIn={isLoggedIn} userRole={user?.role ?? null} allowedRole="admin"><AdminLayout user={user} complaints={complaints} onLogout={handleLogout} /></RoleProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="citizens" element={<AdminCitizensPage />} />
          <Route path="authorities" element={<AdminAuthoritiesPage />} />
          <Route path="departments" element={<AdminDepartmentsPage />} />
          <Route path="complaints" element={<AdminComplaintsPage />} />
          <Route path="cases" element={<AdminCasesPage />} />
          <Route path="news" element={<AdminNewsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      <Route path="/workflow/:slug" element={<WorkflowDetailPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
