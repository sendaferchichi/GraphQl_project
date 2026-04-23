import type { GraphQLContext } from '../types.js';

export const Query = {
  getAllCvs: async (_parent: unknown, _args: unknown, { prisma }: GraphQLContext) => {
    const cvs = await prisma.cv.findMany({
      distinct: ['id'], // Ensure unique CVs by ID
      include: {
        owner: true, // Include owner details
        skills: true, // Include skills
      },
    });
    return cvs;
  },
  getCvById: async (_parent: unknown, { id }: { id: string }, { prisma }: GraphQLContext) => {
    return prisma.cv.findUnique({ where: { id } });
  },
};
