export const Subscription = {
  cvModified: {
    subscribe: (parent: any, args: any, { pubSub }: any, info: any) => pubSub.subscribe('cvModified'),
    resolve: (payload: any) => payload,
  },
};
