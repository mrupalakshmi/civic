export type Role = 'citizen' | 'authority' | 'admin'

export type ComplaintPriority = 'Critical' | 'High' | 'Medium' | 'Low'

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'AI ANALYZED'
  | 'ASSIGNED'
  | 'UNDER REVIEW'
  | 'IN PROGRESS'
  | 'RESOLUTION SUBMITTED'
  | 'VERIFIED'
  | 'RESOLVED'

export type ComplaintLocation = {
  address: string
  latitude: number
  longitude: number
}

export type Complaint = {
  id: string
  title: string
  category: string
  description: string
  location: string
  locationDetails: ComplaintLocation
  priority: ComplaintPriority
  department: string
  authority: string
  officer: string
  status: ComplaintStatus
  summary: string
  keywords: string[]
  sentiment: string
  suggestedAction: string
  estimatedResolution: string
  submittedAt: string
  lastUpdated: string
  evidence: string[]
  comments: { by: string; text: string; when: string }[]
  timeline: { stage: string; date: string; note: string }[]
  resolutionEvidence?: string
}

export type User = {
  id: string
  name: string
  email: string
  role: Role
}

export type ComplaintInput = {
  title: string
  category: string
  location: string
  latitude?: number
  longitude?: number
  description: string
}
