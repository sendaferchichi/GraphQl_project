import type { GraphQLContext } from '../types.js';

type UserParent = {
  id: string;
};

export const User = {
  cvs: async (parent: UserParent, _args: unknown, { prisma }: GraphQLContext) => {
    return prisma.user.findUnique({ where: { id: parent.id } }).cvs();
  },
};
