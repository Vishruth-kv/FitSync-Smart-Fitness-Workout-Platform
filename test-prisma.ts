import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function main() {
  try {
    console.log("Creating user using runCommandRaw...");
    const userRes = await prisma.$runCommandRaw({
      insert: "User",
      documents: [{
        _id: { $oid: "651f1f1f1f1f1f1f1f1f1f1f" }, // We need to generate OID or just let mongo generate it?
        name: "Test User",
        email: "test_direct_" + Date.now() + "@example.com",
        password: "password123",
        createdAt: { $date: new Date().toISOString() },
        updatedAt: { $date: new Date().toISOString() },
      }],
    });
    console.log("User created:", userRes);

  } catch (e) {
    console.error("FAILED:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
