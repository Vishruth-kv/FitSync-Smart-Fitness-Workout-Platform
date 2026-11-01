import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst({ where: { email: 'test8@example.com' } });
    console.log("User:", user);
    
    // Also raw query to see if it's there
    const rawUsers = await prisma.$runCommandRaw({
      find: "User",
      filter: { email: 'test8@example.com' }
    });
    console.log("Raw Users:", JSON.stringify(rawUsers, null, 2));
    
  } finally {
    await prisma.$disconnect();
  }
}
main();
