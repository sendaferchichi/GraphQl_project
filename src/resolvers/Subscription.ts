import type { GraphQLContext } from '../types.js';

type CvNotificationPayload = {
  mutation: 'CREATED' | 'UPDATED' | 'DELETED';
  data: {
    id: string;
  };
};

export const Subscription = {
  cvModified: {
    subscribe: (_parent: unknown, _args: unknown, { pubSub }: GraphQLContext) => pubSub.subscribe('cvModified'),
    resolve: (payload: CvNotificationPayload) => payload,
  },
};
