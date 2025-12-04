import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ transactionOptions: { timeout: 30 }, log: ["query", "warn", "error"] })

export default prisma
