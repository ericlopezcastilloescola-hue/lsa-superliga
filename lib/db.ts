import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { getTursoConfig } from "@/lib/db/turso-config";

function createPrismaClient(): PrismaClient {
  const turso = getTursoConfig();

  if (turso) {
    const adapter = new PrismaLibSQL({
      url: turso.url,
      authToken: turso.authToken,
    });
    return new PrismaClient({ adapter });
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Faltan TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en el entorno de producción.",
    );
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
