import type { PrismaClient } from '@prisma/client';

export type GraphQLContext = {
  prisma: PrismaClient;
  pubSub: any;
};
