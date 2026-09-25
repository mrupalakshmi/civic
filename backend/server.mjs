import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import bcrypt from 'bcryptjs'
import prisma from './db/prisma.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(cors())
app.use(express.json())

const defaultLocation = {
  address: 'Near Government High School, Sector 12',
  latitude: 16.5062,
  longitude: 80.648,
}

const authorityDirectory = [
  { name: 'Road Management System', email: 'roads@yuva.in', designation: 'Chief Engineer - Roads & Traffic', department: 'Road Management System', officeName: 'Public Works Division' },
  { name: 'Health Department', email: 'health@yuva.in', designation: 'District Health Officer', department: 'Health Department', officeName: 'Primary Health Services Wing' },
  { name: 'Finance & Budget Office', email: 'finance@yuva.in', designation: 'Finance Controller', department: 'Finance & Budget Office', officeName: 'Public Finance Cell' },
  { name: 'Women Safety Cell', email: 'women-safety@yuva.in', designation: 'Deputy Commissioner - Women Safety', department: 'Women Safety Cell', officeName: 'Women Protection & Support Desk' },
  { name: 'Water Supply Board', email: 'water@yuva.in', designation: 'Superintending Engineer - Water Supply', department: 'Water Supply Board', officeName: 'Urban Water Management Wing' },
  { name: 'Urban Sanitation Wing', email: 'sanitation@yuva.in', designation: 'Sanitation Superintendent', department: 'Urban Sanitation Wing', officeName: 'Clean City Operations Cell' },
]

const fallbackUsers = [
  { id: 'cit-1', name: 'Citizen User', email: 'citizen@yuva.in', password: bcrypt.hashSync('123456', 10), role: 'citizen', designation: 'Citizen Resident', department: 'Public Citizen Portal', officeName: 'Resident Services Desk' },
  ...authorityDirectory.map((authority, index) => ({
    id: `auth-${index + 1}`,
    name: authority.name,
    email: authority.email,
    password: bcrypt.hashSync(
      authority.email.includes('roads') ? 'Roads@2026' :
      authority.email.includes('health') ? 'Health@2026' :
      authority.email.includes('finance') ? 'Finance@2026' :
      authority.email.includes('women') ? 'Safety@2026' :
      authority.email.includes('water') ? 'Water@2026' : 'Sanitation@2026',
      10,
    ),
    role: 'authority',
    designation: authority.designation,
    department: authority.department,
    officeName: authority.officeName,
  })),
  { id: 'admin-1', name: 'System Admin', email: 'admin@yuva.in', password: bcrypt.hashSync('123456', 10), role: 'admin', designation: 'System Administrator', department: 'Digital Governance Office', officeName: 'Platform Operations Cell' },
]

const fallbackComplaints = [
  {
    id: 'YUVA-2026-004821',
    title: 'Large pothole near a school',
    category: 'Road Infrastructure',
    description: 'There is a large pothole near a school. It is dangerous for students and two-wheelers, especially during rain.',
    location: defaultLocation.address,
    locationDetails: defaultLocation,
    priority: 'High',
    department: 'Municipal Roads Department',
    authority: 'Urban Infrastructure Cell',
    officer: 'S. Mehta',
    status: 'UNDER REVIEW',
    summary: 'Potential public safety hazard near a school. Immediate inspection and temporary safety measures are recommended.',
    keywords: ['pothole', 'school', 'road safety', 'rainwater'],
    sentiment: 'Urgent',
    suggestedAction: 'Immediate inspection and temporary safety barriers followed by permanent road repair.',
    estimatedResolution: '3 days',
    submittedAt: '2026-09-24 08:15',
    lastUpdated: '2026-09-24 10:45',
    evidence: ['school-road.jpg', 'pothole-video.mp4'],
    comments: [
      { by: 'AI', text: 'Complaint indicates a possible public safety hazard near a school crossing.', when: '08:20' },
      { by: 'Municipal Desk', text: 'Inspection team assigned and site verification pending.', when: '10:30' },
    ],
    timeline: [
      { stage: 'SUBMITTED', date: '08:15', note: 'Complaint filed by resident' },
      { stage: 'AI ANALYZED', date: '08:32', note: 'Category and urgency identified' },
      { stage: 'ASSIGNED', date: '09:10', note: 'Municipal Roads Department assigned' },
      { stage: 'UNDER REVIEW', date: '10:40', note: 'Site inspection scheduled' },
    ],
  },
]

const statusMap = {
  SUBMITTED: 'SUBMITTED',
  AI_ANALYZED: 'AI ANALYZED',
  ASSIGNED: 'ASSIGNED',
  UNDER_REVIEW: 'UNDER REVIEW',
  IN_PROGRESS: 'IN PROGRESS',
  RESOLUTION_SUBMITTED: 'RESOLUTION SUBMITTED',
  VERIFIED: 'VERIFIED',
  RESOLVED: 'RESOLVED',
}

const prismaStatusMap = {
  SUBMITTED: 'SUBMITTED',
  'AI ANALYZED': 'AI_ANALYZED',
  ASSIGNED: 'ASSIGNED',
  'UNDER REVIEW': 'UNDER_REVIEW',
  'IN PROGRESS': 'IN_PROGRESS',
  'RESOLUTION SUBMITTED': 'RESOLUTION_SUBMITTED',
  VERIFIED: 'VERIFIED',
  RESOLVED: 'RESOLVED',
}

const priorityMap = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

const makeComplaintId = () => `YUVA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(6, '0')}`

const parseJsonArray = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const normalizeComplaint = (complaint) => {
  const location = complaint.locationDetails ?? {
    address: complaint.address || complaint.location || defaultLocation.address,
    latitude: Number(complaint.latitude ?? defaultLocation.latitude),
    longitude: Number(complaint.longitude ?? defaultLocation.longitude),
  }

  const updates = Array.isArray(complaint.updates) ? complaint.updates : []
  const timeline = updates.map((update) => ({
    stage: statusMap[update.status] || update.status,
    date: new Date(update.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    note: update.message,
  }))

  const comments = updates.map((update) => ({
    by: update.updatedBy,
    text: update.message,
    when: new Date(update.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  }))

  return {
    id: complaint.complaintId || complaint.id,
    title: complaint.title,
    category: complaint.category,
    description: complaint.description,
    location: location.address,
    locationDetails: location,
    priority: priorityMap[complaint.priority] || complaint.priority,
    department: complaint.department?.name || 'Municipal Roads Department',
    authority: complaint.assignedAuthority?.name || 'Urban Infrastructure Cell',
    officer: complaint.assignedAuthority?.name || 'S. Mehta',
    status: statusMap[complaint.status] || complaint.status,
    summary: complaint.aiSummary || 'Complaint is in progress.',
    keywords: parseJsonArray(complaint.keywords),
    sentiment: complaint.sentiment || 'Neutral',
    suggestedAction: complaint.aiSuggestedAction || 'Review and route to the relevant department.',
    estimatedResolution: complaint.estimatedResolution || '3 days',
    submittedAt: new Date(complaint.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    lastUpdated: new Date(complaint.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    evidence: parseJsonArray(complaint.evidence),
    comments: comments.length ? comments : [
      { by: 'AI', text: complaint.aiSummary || 'Complaint created.', when: 'Now' },
    ],
    timeline: timeline.length ? timeline : [
      { stage: 'SUBMITTED', date: 'Now', note: 'Citizen report received' },
    ],
  }
}

const analysisFor = (payload) => ({
  category: payload.category || 'Road Infrastructure',
  priority: 'High',
  department: 'Municipal Roads Department',
  authority: 'Urban Infrastructure Cell',
  summary: 'Potential public safety hazard near a school. Immediate inspection and temporary safety measures are recommended.',
  keywords: ['school', 'safety', 'road damage', 'rain'],
  sentiment: 'Urgent',
  suggestedAction: 'Immediate inspection and temporary barricading followed by road repair and safety restoration.',
  estimatedResolution: '3 days',
})

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  designation: user.designation || 'Department Official',
  department: user.department || 'Government Services',
  officeName: user.officeName || 'Public Service Office',
})

const normalizeEmail = (email) => {
  if (!email) return email
  return email.trim().toLowerCase().replace(/@yuva\.demo$/i, '@yuva.in')
}

async function getComplaintRows() {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        department: true,
        assignedAuthority: true,
        updates: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return complaints.map((complaint) => normalizeComplaint(complaint))
  } catch (error) {
    console.warn('Database unavailable, using fallback complaint list.', error.message)
    return fallbackComplaints
  }
}

async function getComplaintByIdFromDb(complaintId) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { complaintId },
      include: {
        department: true,
        assignedAuthority: true,
        updates: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!complaint) return null
    return normalizeComplaint(complaint)
  } catch (error) {
    console.warn('Database unavailable while loading complaint detail.', error.message)
    return fallbackComplaints.find((item) => item.id === complaintId) ?? null
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'YUVA backend' })
})

app.get('/api/authorities', (_req, res) => {
  res.json({ authorities: authorityDirectory })
})

app.post('/api/chat', (req, res) => {
  const message = String(req.body?.message || '').trim()

  if (!message) {
    return res.status(400).json({ message: 'Please provide a message.' })
  }

  const lower = message.toLowerCase()

  if (/(road|pothole|traffic|street|drain|bridge)/.test(lower)) {
    return res.json({
      reply: 'This looks like a Road Management System issue. The relevant officer is the Chief Engineer - Roads & Traffic, and the complaint should be routed to the Public Works Division for inspection and repair.',
    })
  }

  if (/(water|leak|pipeline|supply|tap|sanitation|garbage|drainage)/.test(lower)) {
    return res.json({
      reply: 'This falls under the Water Supply Board or Urban Sanitation Wing depending on whether it is a water leak, sewage issue, or garbage problem. Both departments can coordinate resolution and public safety checks.',
    })
  }

  if (/(health|hospital|clinic|medicine|disease|sanit)/.test(lower)) {
    return res.json({
      reply: 'For health-related complaints, the Health Department is the relevant authority. The District Health Officer can coordinate emergency service coverage, sanitation checks, and medical response.',
    })
  }

  if (/(women|safety|harassment|abuse|security)/.test(lower)) {
    return res.json({
      reply: 'Women Safety Cell is the designated authority for harassment, safety, and protection-related grievances. The Deputy Commissioner - Women Safety can coordinate immediate response and support.',
    })
  }

  if (/(finance|budget|scheme|grant|payment|welfare)/.test(lower)) {
    return res.json({
      reply: 'Finance & Budget Office handles welfare schemes, budget allocation, public funds, and accountability issues. The Finance Controller can review the complaint and direct eligibility checks.',
    })
  }

  if (/(track|status|progress|complaint|case)/.test(lower)) {
    return res.json({
      reply: 'You can track your complaint from the citizen dashboard using the complaint ID. The system also shares updates from the assigned department and the current status timeline.',
    })
  }

  return res.json({
    reply: 'YUVA can route civic matters to the correct authority. For example, roads go to Road Management System, health goes to Health Department, women safety goes to Women Safety Cell, and water or sanitation issues go to Water Supply Board or Urban Sanitation Wing.',
  })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body || {}
  const normalizedEmail = normalizeEmail(email)

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (user && user.role === role && (await bcrypt.compare(password, user.password))) {
      return res.json({ token: 'demo-jwt-token', user: serializeUser(user) })
    }

    const aliasMatch = await prisma.user.findFirst({
      where: {
        email: { endsWith: '@yuva.in' },
        role,
      },
    })

    if (aliasMatch && aliasMatch.email.toLowerCase() === normalizedEmail.toLowerCase() && (await bcrypt.compare(password, aliasMatch.password))) {
      return res.json({ token: 'demo-jwt-token', user: serializeUser(aliasMatch) })
    }
  } catch (error) {
    const match = fallbackUsers.find((user) => normalizeEmail(user.email) === normalizedEmail && user.role === role)
    if (match && bcrypt.compareSync(password, match.password)) {
      return res.json({ token: 'demo-jwt-token', user: serializeUser(match) })
    }
  }

  return res.status(401).json({ message: 'Invalid login credentials for the selected role.' })
})

app.get('/api/complaints', async (_req, res) => {
  const complaints = await getComplaintRows()
  res.json({ complaints })
})

app.get('/api/complaints/:id', async (req, res) => {
  const complaint = await getComplaintByIdFromDb(req.params.id)
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' })
  return res.json({ complaint })
})

app.post('/api/complaints', async (req, res) => {
  const payload = req.body || {}
  const ai = analysisFor(payload)
  const locationDetails = {
    address: payload.location || 'Unknown location',
    latitude: Number(payload.latitude ?? defaultLocation.latitude),
    longitude: Number(payload.longitude ?? defaultLocation.longitude),
  }

  const complaintId = makeComplaintId()

  try {
    const [department] = await prisma.department.findMany({
      where: { name: ai.department },
      take: 1,
    })

    const citizen = await prisma.user.findFirst({
      where: { role: 'citizen' },
    })

    const authority = await prisma.user.findFirst({
      where: { role: 'authority' },
    })

    const complaint = await prisma.complaint.create({
      data: {
        complaintId,
        title: payload.title || 'New civic issue',
        description: payload.description || '',
        category: ai.category,
        priority: 'HIGH',
        status: 'AI_ANALYZED',
        address: locationDetails.address,
        latitude: locationDetails.latitude,
        longitude: locationDetails.longitude,
        departmentId: department?.id ?? null,
        citizenId: citizen?.id ?? null,
        assignedAuthorityId: authority?.id ?? null,
        aiSummary: ai.summary,
        aiSuggestedAction: ai.suggestedAction,
        keywords: JSON.stringify(ai.keywords),
        sentiment: ai.sentiment,
        estimatedResolution: ai.estimatedResolution,
        evidence: JSON.stringify(['uploaded-evidence.jpg']),
        updates: {
          create: [
            {
              status: 'SUBMITTED',
              message: 'Citizen report received',
              updatedBy: 'Citizen',
            },
            {
              status: 'AI_ANALYZED',
              message: 'Urgency and category detected',
              updatedBy: 'AI Engine',
            },
          ],
        },
      },
      include: {
        department: true,
        assignedAuthority: true,
        updates: true,
      },
    })

    const normalized = normalizeComplaint(complaint)
    return res.status(201).json({ complaint: normalized })
  } catch (error) {
    console.warn('Database write failed, creating fallback complaint.', error.message)

    const complaint = {
      id: complaintId,
      title: payload.title || 'New civic issue',
      category: ai.category,
      description: payload.description || '',
      location: locationDetails.address,
      locationDetails,
      priority: ai.priority,
      department: ai.department,
      authority: ai.authority,
      officer: 'S. Mehta',
      status: 'AI ANALYZED',
      summary: ai.summary,
      keywords: ai.keywords,
      sentiment: ai.sentiment,
      suggestedAction: ai.suggestedAction,
      estimatedResolution: ai.estimatedResolution,
      submittedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      lastUpdated: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      evidence: ['uploaded-evidence.jpg'],
      comments: [{ by: 'AI', text: 'Problem classified as high priority due to school safety risk.', when: 'Now' }],
      timeline: [
        { stage: 'SUBMITTED', date: 'Now', note: 'Citizen report received' },
        { stage: 'AI ANALYZED', date: 'Now', note: 'Urgency and category detected' },
        { stage: 'ASSIGNED', date: 'Pending', note: 'Municipal Roads Department routing in progress' },
      ],
    }

    fallbackComplaints.unshift(complaint)
    return res.status(201).json({ complaint })
  }
})

app.patch('/api/complaints/:id/status', async (req, res) => {
  const { id } = req.params
  const nextStatus = req.body.status || 'UNDER REVIEW'
  const responseText = req.body.response || `Status updated to ${nextStatus}.`

  try {
    const complaint = await prisma.complaint.findUnique({
      where: { complaintId: id },
      include: { updates: true },
    })

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        status: prismaStatusMap[nextStatus] || 'UNDER_REVIEW',
        updatedAt: new Date(),
        updates: {
          create: {
            status: prismaStatusMap[nextStatus] || 'UNDER_REVIEW',
            message: responseText,
            updatedBy: 'Authority Response',
          },
        },
      },
      include: {
        department: true,
        assignedAuthority: true,
        updates: { orderBy: { createdAt: 'asc' } },
      },
    })

    return res.json({ complaint: normalizeComplaint(updatedComplaint) })
  } catch (error) {
    const complaint = fallbackComplaints.find((item) => item.id === id)
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

    complaint.status = nextStatus
    complaint.lastUpdated = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    complaint.comments.push({ by: 'Authority Response', text: responseText, when: 'Just now' })
    complaint.timeline.push({ stage: nextStatus, date: 'Now', note: 'Authority updated status' })

    return res.json({ complaint })
  }
})

app.post('/api/complaints/:id/comment', async (req, res) => {
  const { id } = req.params
  const text = req.body.text

  try {
    const complaint = await prisma.complaint.findUnique({
      where: { complaintId: id },
      include: { updates: true },
    })

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        updatedAt: new Date(),
        updates: {
          create: {
            status: complaint.status,
            message: text,
            updatedBy: 'Authority',
          },
        },
      },
      include: {
        department: true,
        assignedAuthority: true,
        updates: { orderBy: { createdAt: 'asc' } },
      },
    })

    return res.json({ complaint: normalizeComplaint(updatedComplaint) })
  } catch (error) {
    const complaint = fallbackComplaints.find((item) => item.id === id)
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

    complaint.comments.push({ by: 'Authority', text, when: 'Now' })
    complaint.lastUpdated = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    return res.json({ complaint })
  }
})

app.listen(port, () => {
  console.log(`YUVA backend running on http://localhost:${port}`)
})
