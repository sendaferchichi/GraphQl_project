import type { PrismaClient } from '@prisma/client';
import type { createPubSub } from 'graphql-yoga';

export type CvNotificationPayload = {
  mutation: 'CREATED' | 'UPDATED' | 'DELETED';
  data: { id: string };
};

export type AppPubSub = ReturnType<
  typeof createPubSub<{ cvModified: [CvNotificationPayload] }>
>;

export type GraphQLContext = {
  prisma: PrismaClient;
  pubSub: AppPubSub;
};
