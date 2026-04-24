import type { GraphQLContext } from '../types.js';

type CvParent = {
  id: string;
};

export const Cv = {
  owner: async (parent: CvParent, _args: unknown, { prisma }: GraphQLContext) => {
    return prisma.cv.findUnique({ where: { id: parent.id } }).owner();
  },
  skills: async (parent: CvParent, _args: unknown, { prisma }: GraphQLContext) => {
    return prisma.cv.findUnique({ where: { id: parent.id } }).skills();
  },
};
