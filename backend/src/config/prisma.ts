import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrisma = () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    options: "-c client_encoding=UTF8",
  });
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrisma();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
