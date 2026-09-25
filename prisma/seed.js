import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('123456', 10)
  const authorityPasswords = {
    'roads@yuva.in': await bcrypt.hash('Roads@2026', 10),
    'health@yuva.in': await bcrypt.hash('Health@2026', 10),
    'finance@yuva.in': await bcrypt.hash('Finance@2026', 10),
    'women-safety@yuva.in': await bcrypt.hash('Safety@2026', 10),
    'water@yuva.in': await bcrypt.hash('Water@2026', 10),
    'sanitation@yuva.in': await bcrypt.hash('Sanitation@2026', 10),
  }

  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Municipal Roads Department' },
      update: {},
      create: {
        name: 'Municipal Roads Department',
        description: 'Roads, drainage, and public infrastructure management.',
      },
    }),
    prisma.department.upsert({
      where: { name: 'Water & Sewer Department' },
      update: {},
      create: {
        name: 'Water & Sewer Department',
        description: 'Water supply, sewer, and sanitation issues.',
      },
    }),
    prisma.department.upsert({
      where: { name: 'Public Health Department' },
      update: {},
      create: {
        name: 'Public Health Department',
        description: 'Health services and sanitation compliance.',
      },
    }),
  ])

  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@yuva.in' },
    update: {},
    create: {
      name: 'Citizen User',
      email: 'citizen@yuva.in',
      password,
      role: 'citizen',
      phone: '+91 98765 43210',
      designation: 'Citizen Resident',
      department: 'Public Citizen Portal',
      officeName: 'Resident Services Desk',
    },
  })

  const authorityAccounts = [
    {
      name: 'Road Management System',
      email: 'roads@yuva.in',
      password: authorityPasswords['roads@yuva.in'],
      role: 'authority',
      phone: '+91 98765 10001',
      designation: 'Chief Engineer - Roads & Traffic',
      department: 'Road Management System',
      officeName: 'Public Works Division',
    },
    {
      name: 'Health Department',
      email: 'health@yuva.in',
      password: authorityPasswords['health@yuva.in'],
      role: 'authority',
      phone: '+91 98765 10002',
      designation: 'District Health Officer',
      department: 'Health Department',
      officeName: 'Primary Health Services Wing',
    },
    {
      name: 'Finance & Budget Office',
      email: 'finance@yuva.in',
      password: authorityPasswords['finance@yuva.in'],
      role: 'authority',
      phone: '+91 98765 10003',
      designation: 'Finance Controller',
      department: 'Finance & Budget Office',
      officeName: 'Public Finance Cell',
    },
    {
      name: 'Women Safety Cell',
      email: 'women-safety@yuva.in',
      password: authorityPasswords['women-safety@yuva.in'],
      role: 'authority',
      phone: '+91 98765 10004',
      designation: 'Deputy Commissioner - Women Safety',
      department: 'Women Safety Cell',
      officeName: 'Women Protection & Support Desk',
    },
    {
      name: 'Water Supply Board',
      email: 'water@yuva.in',
      password: authorityPasswords['water@yuva.in'],
      role: 'authority',
      phone: '+91 98765 10005',
      designation: 'Superintending Engineer - Water Supply',
      department: 'Water Supply Board',
      officeName: 'Urban Water Management Wing',
    },
    {
      name: 'Urban Sanitation Wing',
      email: 'sanitation@yuva.in',
      password: authorityPasswords['sanitation@yuva.in'],
      role: 'authority',
      phone: '+91 98765 10006',
      designation: 'Sanitation Superintendent',
      department: 'Urban Sanitation Wing',
      officeName: 'Clean City Operations Cell',
    },
  ]

  for (const authorityUser of authorityAccounts) {
    await prisma.user.upsert({
      where: { email: authorityUser.email },
      update: {},
      create: authorityUser,
    })
  }

  const admin = await prisma.user.upsert({
    where: { email: 'admin@yuva.in' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@yuva.in',
      password,
      role: 'admin',
      phone: '+91 99887 66554',
      designation: 'System Administrator',
      department: 'Digital Governance Office',
      officeName: 'Platform Operations Cell',
    },
  })

  const complaintData = {
    complaintId: 'YUVA-2026-000001',
    title: 'Large pothole near a school',
    description: 'There is a large pothole near a school. It is dangerous for students and two-wheelers, especially during rain.',
    category: 'Road Infrastructure',
    priority: 'HIGH',
    status: 'UNDER_REVIEW',
    address: 'Near Government High School, Sector 12',
    latitude: 16.5062,
    longitude: 80.648,
    aiSummary: 'Potential public safety hazard near a school. Immediate inspection and temporary safety measures are recommended.',
    aiSuggestedAction: 'Immediate inspection and temporary safety barriers followed by permanent road repair.',
    keywords: JSON.stringify(['pothole', 'school', 'road safety', 'rainwater']),
    sentiment: 'Urgent',
    estimatedResolution: '3 days',
    evidence: JSON.stringify(['school-road.jpg', 'pothole-video.mp4']),
  }

  const existingComplaint = await prisma.complaint.findUnique({
    where: { complaintId: complaintData.complaintId },
  })

  if (!existingComplaint) {
    const createdComplaint = await prisma.complaint.create({
      data: {
        ...complaintData,
        departmentId: departments[0].id,
        citizenId: citizen.id,
        assignedAuthorityId: authority.id,
        updates: {
          create: [
            {
              status: 'SUBMITTED',
              message: 'Complaint filed by resident.',
              updatedBy: 'Citizen',
            },
            {
              status: 'AI_ANALYZED',
              message: 'AI classified the issue as a high-risk road hazard.',
              updatedBy: 'AI Engine',
            },
            {
              status: 'UNDER_REVIEW',
              message: 'Inspection team assigned and site verification scheduled.',
              updatedBy: 'Municipal Officer',
            },
          ],
        },
      },
    })

    await prisma.notification.createMany({
      data: [
        {
          userId: citizen.id,
          title: 'Complaint submitted',
          message: `Your complaint ${createdComplaint.complaintId} is now under review.`,
          type: 'INFO',
        },
        {
          userId: authority.id,
          title: 'New case assigned',
          message: `Complaint ${createdComplaint.complaintId} requires inspection.`,
          type: 'ALERT',
        },
      ],
    })
  }

  const caseCount = await prisma.case.count()
  if (caseCount === 0) {
    await prisma.case.createMany({
      data: [
        {
          caseName: 'Public Interest Petition on Urban Drainage',
          court: 'High Court',
          year: 2025,
          category: 'Public Infrastructure',
          summary: 'The matter concerns civic negligence in drainage maintenance and repeated waterlogging.',
          judgment: 'The court ordered a compliance and maintenance review for civic agencies.',
        },
        {
          caseName: 'Digital Governance Transparency Appeal',
          court: 'Supreme Court',
          year: 2026,
          category: 'Governance',
          summary: 'The case looks into digital service transparency and procedural fairness for citizens.',
          judgment: 'The court directed improved disclosure and administrative accountability systems.',
        },
      ],
    })
  }

  const studyCount = await prisma.caseStudy.count()
  if (studyCount === 0) {
    await prisma.caseStudy.createMany({
      data: [
        {
          title: 'Drainage revival for flood-prone neighborhoods',
          category: 'Urban Infrastructure',
          problem: 'Repeated flooding and blocked drains caused health and mobility disruption.',
          background: 'A neighborhood saw recurring flood events during monsoon cycles.',
          actions: 'Survey, desilting, catchment mapping, and field inspections.',
          technology: 'GIS mapping, predictive monitoring, and mobile inspection tools.',
          outcome: 'Flood incidents dropped by 38% within six months.',
          lessons: 'Local data and location-based issue routing improve civic maintenance outcomes.',
        },
      ],
    })
  }

  const articleCount = await prisma.newsArticle.count()
  if (articleCount === 0) {
    await prisma.newsArticle.createMany({
      data: [
        {
          title: 'Public service dashboards strengthen transparency',
          category: 'Governance',
          summary: 'Local officials are using digital dashboards to shorten resolution time.',
          source: 'YUVA Demo',
          sourceUrl: 'https://example.com/demo',
          publishedAt: new Date(),
        },
      ],
    })
  }

  console.log('Seed completed with demo users and complaint records.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
