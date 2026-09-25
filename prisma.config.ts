import { definePrismaConfig } from 'prisma/config'

export default definePrismaConfig({
  orm: {
    schema: './prisma/schema.prisma',
  },
})
