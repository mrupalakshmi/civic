export const workflowSteps = ['CITIZEN', 'REPORT', 'AI ANALYSIS', 'SMART ROUTING', 'AUTHORITY', 'TRACKING', 'RESOLUTION']

export const legalTopics = [
  'Constitution',
  'Fundamental Rights',
  'Fundamental Duties',
  'Major Acts',
  'Legal Procedures',
  'Citizen Rights',
  'Public Interest Litigation',
  'Consumer Rights',
  'Cyber Laws',
  "Women's Rights",
  'Child Rights',
]

export const complaintStats = [
  { label: 'Total complaints', value: '12,480', change: '+18.4%' },
  { label: 'Active cases', value: '3,210', change: '+9.1%' },
  { label: 'Resolved', value: '8,990', change: '+14.3%' },
  { label: 'Avg. response', value: '2.6 days', change: '-0.8d' },
]

export const newsData = [
  {
    title: 'Smart city dashboard expands grievance response visibility',
    category: 'Civic Development',
    source: 'Ministry of Urban Affairs',
    date: 'Today',
    summary: 'Authorities are expanding digital public dashboards to make civic service performance more transparent.',
  },
  {
    title: 'High court directs faster e-filing and status transparency',
    category: 'Judiciary',
    source: 'State Court Bulletin',
    date: 'Today',
    summary: 'Judicial offices have announced improved digital case timelines and status tracking for citizens.',
  },
  {
    title: 'AI-assisted citizen services improve resolution predictability',
    category: 'Technology & AI',
    source: 'Digital Governance Review',
    date: 'Today',
    summary: 'Pilot programs demonstrate faster triaging and better routing for civic issues across departments.',
  },
]

export const caseStudies = [
  {
    title: 'School Zone Pothole Safety Initiative',
    filter: 'Governance',
    problem: 'Repeated public safety complaints near schools and high-risk areas.',
    outcome: 'Emergency repair and notification system cut accident risk by 41%.',
  },
  {
    title: 'Open Data for Water Leakage Accountability',
    filter: 'Technology',
    problem: 'Citizen reports of pipeline leaks were delayed due to manual triage.',
    outcome: 'Geo-tagging and AI routing reduced average closure time from 9 days to 4 days.',
  },
  {
    title: 'Public Safety Response for Encroachment Removal',
    filter: 'Public Safety',
    problem: 'Unsafe encroachment and blocked access in a dense urban corridor.',
    outcome: 'Coordinated intervention resolved the hazard and improved public confidence.',
  },
]

export const departmentData = [
  { name: 'Roads', value: 46 },
  { name: 'Water', value: 18 },
  { name: 'Health', value: 15 },
  { name: 'Safety', value: 12 },
  { name: 'Education', value: 9 },
]

export const chartData = [
  { name: 'Jan', resolved: 24, submitted: 33 },
  { name: 'Feb', resolved: 28, submitted: 36 },
  { name: 'Mar', resolved: 31, submitted: 40 },
  { name: 'Apr', resolved: 38, submitted: 42 },
  { name: 'May', resolved: 46, submitted: 47 },
  { name: 'Jun', resolved: 52, submitted: 55 },
]

export const transparencyData = [
  { name: 'Roads', value: 82 },
  { name: 'Water', value: 73 },
  { name: 'Safety', value: 68 },
  { name: 'Health', value: 76 },
  { name: 'Education', value: 88 },
]

export const mapMarkers = [
  { x: '35%', y: '28%', label: 'Critical', type: 'critical', name: 'Flooded underpass' },
  { x: '60%', y: '44%', label: 'High', type: 'high', name: 'Damaged bridge' },
  { x: '48%', y: '70%', label: 'Medium', type: 'medium', name: 'Streetlight outage' },
  { x: '76%', y: '36%', label: 'Resolved', type: 'resolved', name: 'Drain repair' },
]

export const notificationSeed = [
  'Complaint submitted successfully',
  'AI analysis completed for CIV-2026-004821',
  'Authority assignment confirmed',
  'Status changed to Under Review',
]

export const initialComplaintForm = {
  title: 'Large pothole near a school',
  category: 'Road Infrastructure',
  location: 'Near Government High School, Sector 12',
  latitude: 16.5062,
  longitude: 80.648,
  description:
    'There is a large pothole near a school. It is dangerous for students and two-wheelers, especially during rain.',
}
