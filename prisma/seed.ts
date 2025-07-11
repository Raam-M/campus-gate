import { prisma } from '../src/lib/prisma'
import { hashPassword } from '../src/lib/auth'

async function main() {
  // Hash passwords
  const studentPassword = await hashPassword('student123');
  const adminPassword = await hashPassword('admin123');

  // Create a test student user
  const student = await prisma.user.upsert({
    where: { email: 'john.doe@iith.ac.in' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@iith.ac.in',
      password: studentPassword,
      role: 'student'
    },
  })

  // Create a test admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@iith.ac.in' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@iith.ac.in',
      password: adminPassword,
      role: 'admin'
    },
  })

  console.log({ student, admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
