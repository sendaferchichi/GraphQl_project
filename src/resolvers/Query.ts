import { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../types.js';

export const Query = {
  getAllCvs: async (
    _parent: unknown,
    args: {
      filter?: { name?: string; job?: string; userId?: string; skillId?: string };
      skip?: number;
      take?: number;
    },
    { prisma }: GraphQLContext,
  ) => {
    const skip = args.skip ?? 0;
    const take = args.take ?? 10;
    const where: Prisma.CvWhereInput = {};

    if (args.filter?.name) where.name = { contains: args.filter.name };
    if (args.filter?.job) where.job = { contains: args.filter.job };
    if (args.filter?.userId) where.userId = args.filter.userId;
    if (args.filter?.skillId) where.skills = { some: { id: args.filter.skillId } };

    const [items, total] = await prisma.$transaction([
      prisma.cv.findMany({ where, skip, take }),
      prisma.cv.count({ where }),
    ]);

    return { items, total, hasMore: skip + take < total };
  },

  getCvById: (_parent: unknown, { id }: { id: string }, { prisma }: GraphQLContext) =>
    prisma.cv.findUnique({ where: { id } }),

  getUsers: async (
    _parent: unknown,
    args: {
      filter?: { name?: string; email?: string; role?: 'USER' | 'ADMIN' };
      skip?: number;
      take?: number;
    },
    { prisma }: GraphQLContext,
  ) => {
    const skip = args.skip ?? 0;
    const take = args.take ?? 10;
    const where: Prisma.UserWhereInput = {};

    if (args.filter?.name) where.name = { contains: args.filter.name };
    if (args.filter?.email) where.email = { contains: args.filter.email };
    if (args.filter?.role) where.role = args.filter.role;

    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({ where, skip, take }),
      prisma.user.count({ where }),
    ]);

    return { items, total, hasMore: skip + take < total };
  },

  getUserById: (_parent: unknown, { id }: { id: string }, { prisma }: GraphQLContext) =>
    prisma.user.findUnique({ where: { id } }),

  getSkills: (_parent: unknown, _args: unknown, { prisma }: GraphQLContext) =>
    prisma.skill.findMany(),

  getSkillById: (_parent: unknown, { id }: { id: string }, { prisma }: GraphQLContext) =>
    prisma.skill.findUnique({ where: { id } }),
};
