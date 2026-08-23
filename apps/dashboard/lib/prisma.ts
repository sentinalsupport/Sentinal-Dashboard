import { PrismaClient } from "@prisma/client";
declare global { var prismaGlobal: PrismaClient | undefined; }
let prisma: PrismaClient;
try {
  if (process.env.DATABASE_URL) {
    prisma = global.prismaGlobal ?? new PrismaClient();
    if (process.env.NODE_ENV !== "production") (global as any).prismaGlobal = prisma;
  } else {
    // fallback mock that won't throw at import time; actual queries will be caught
    prisma = new Proxy({} as PrismaClient, {
      get() { return () => { throw new Error("DATABASE_URL not configured"); }; }
    });
  }
} catch (e) {
  prisma = new Proxy({} as PrismaClient, {
    get() { return () => { throw new Error("Prisma init failed: "+e); }; }
  });
}
export { prisma };
export default prisma;
