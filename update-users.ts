import { prisma } from './src/lib/prisma'
import { hashPassword } from './src/lib/auth'

async function updateUsers() {
  // Hash passwords
  const studentPassword = await hashPassword('student123');
  const adminPassword = await hashPassword('admin123');

  // Update existing users
  await prisma.user.update({
    where: { email: 'john.doe@iith.ac.in' },
    data: { password: studentPassword }
  });

  await prisma.user.update({
    where: { email: 'admin@iith.ac.in' },
    data: { password: adminPassword }
  });

  console.log('Users updated with hashed passwords');
  console.log('Student credentials: john.doe@iith.ac.in / student123');
  console.log('Admin credentials: admin@iith.ac.in / admin123');
}

updateUsers()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
