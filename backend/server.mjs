import cors from 'cors'
import express from 'express'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

const users = [
  { id: 'cit-1', name: 'Citizen User', email: 'citizen@yuva.in', password: '123456', role: 'citizen' },
  { id: 'auth-1', name: 'Municipal Officer', email: 'authority@yuva.in', password: '123456', role: 'authority' },
  { id: 'admin-1', name: 'System Admin', email: 'admin@yuva.in', password: '123456', role: 'admin' },
]

const complaints = [
  {
    id: 'CIV-2026-004821',
    title: 'Large pothole near a school',
    category: 'Road Infrastructure',
    description: 'There is a large pothole near a school. It is dangerous for students and two-wheelers, especially during rain.',
    location: 'Near Government High School, Sector 12',
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

const analysisFor = (payload) => ({
  category: payload.category || 'Road Infrastructure',
  priority: 'High',
  department: 'Municipal Roads Department',
  authority: 'Urban Infrastructure Cell',
  summary:
    'Potential public safety hazard near a school. Immediate inspection and temporary safety measures are recommended.',
  keywords: ['school', 'safety', 'road damage', 'rain'],
  sentiment: 'Urgent',
  suggestedAction:
    'Immediate inspection and temporary barricading followed by road repair and safety restoration.',
  estimatedResolution: '3 days',
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'YUVA backend' })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body || {}
  const match = users.find((user) => user.email === email && user.password === password && user.role === role)

  if (!match) {
    return res.status(401).json({ message: 'Invalid login credentials for the selected role.' })
  }

  return res.json({
    token: 'demo-jwt-token',
    user: {
      id: match.id,
      name: match.name,
      email: match.email,
      role: match.role,
    },
  })
})

app.get('/api/complaints', (_req, res) => {
  res.json({ complaints })
})

app.post('/api/complaints', (req, res) => {
  const payload = req.body || {}
  const ai = analysisFor(payload)
  const complaint = {
    id: `CIV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    title: payload.title || 'New civic issue',
    category: ai.category,
    description: payload.description || '',
    location: payload.location || 'Unknown location',
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

  complaints.unshift(complaint)
  res.status(201).json({ complaint })
})

app.patch('/api/complaints/:id/status', (req, res) => {
  const { id } = req.params
  const complaint = complaints.find((item) => item.id === id)

  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found' })
  }

  complaint.status = req.body.status || complaint.status
  complaint.lastUpdated = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  complaint.comments.push({
    by: 'Authority Response',
    text: req.body.response || `Status updated to ${complaint.status}.`,
    when: 'Just now',
  })
  complaint.timeline.push({ stage: complaint.status, date: 'Now', note: 'Authority updated status' })

  return res.json({ complaint })
})

app.post('/api/complaints/:id/comment', (req, res) => {
  const { id } = req.params
  const complaint = complaints.find((item) => item.id === id)

  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found' })
  }

  complaint.comments.push({ by: 'Authority', text: req.body.text, when: 'Now' })
  complaint.lastUpdated = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  return res.json({ complaint })
})

app.listen(port, () => {
  console.log(`YUVA backend running on http://localhost:${port}`)
})
