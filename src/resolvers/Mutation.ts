import { Prisma, type Cv } from '@prisma/client';
import type { GraphQLContext } from '../types.js';

type CreateCvInput = {
  name: string;
  age: number;
  job: string;
  userId: string;
  skillIds: string[];
};

type UpdateCvInput = {
  id: string;
  name?: string;
  age?: number;
  job?: string;
  userId?: string;
  skillIds?: string[];
};

const ensureUserExists = async (prisma: GraphQLContext['prisma'], userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error(`User with id ${userId} does not exist`);
  }
};

const ensureSkillsExist = async (prisma: GraphQLContext['prisma'], skillIds: string[]) => {
  if (skillIds.length === 0) {
    return;
  }

  const uniqueSkillIds = [...new Set(skillIds)];
  const count = await prisma.skill.count({ where: { id: { in: uniqueSkillIds } } });
  if (count !== uniqueSkillIds.length) {
    throw new Error('One or more skills do not exist');
  }
};

export const Mutation = {
  createCv: async (
    _parent: unknown,
    { input }: { input: CreateCvInput },
    { prisma, pubSub }: GraphQLContext,
  ): Promise<Cv> => {
    await ensureUserExists(prisma, input.userId);
    await ensureSkillsExist(prisma, input.skillIds);

    const newCv = await prisma.cv.create({
      data: {
        name: input.name,
        age: input.age,
        job: input.job,
        owner: { connect: { id: input.userId } },
        skills: { connect: input.skillIds.map((id) => ({ id })) },
      },
    });

    await pubSub.publish('cvModified', { mutation: 'CREATED', data: newCv });
    return newCv;
  },

  updateCv: async (
    _parent: unknown,
    { input }: { input: UpdateCvInput },
    { prisma, pubSub }: GraphQLContext,
  ): Promise<Cv> => {
    const existingCv = await prisma.cv.findUnique({ where: { id: input.id } });
    if (!existingCv) {
      throw new Error(`CV with id ${input.id} not found`);
    }

    if (input.userId !== undefined) {
      await ensureUserExists(prisma, input.userId);
    }

    if (input.skillIds !== undefined) {
      await ensureSkillsExist(prisma, input.skillIds);
    }

    const data: Prisma.CvUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.age !== undefined) data.age = input.age;
    if (input.job !== undefined) data.job = input.job;
    if (input.userId !== undefined) data.owner = { connect: { id: input.userId } };
    if (input.skillIds !== undefined) {
      data.skills = { set: input.skillIds.map((id) => ({ id })) };
    }

    const updatedCv = await prisma.cv.update({
      where: { id: input.id },
      data,
    });

    await pubSub.publish('cvModified', { mutation: 'UPDATED', data: updatedCv });
    return updatedCv;
  },

  deleteCv: async (
    _parent: unknown,
    { id }: { id: string },
    { prisma, pubSub }: GraphQLContext,
  ): Promise<boolean> => {
    const existingCv = await prisma.cv.findUnique({ where: { id } });
    if (!existingCv) {
      throw new Error(`CV with id ${id} not found`);
    }

    const deletedCv = await prisma.cv.delete({ where: { id } });
    await pubSub.publish('cvModified', { mutation: 'DELETED', data: deletedCv });
    return true;
  },
};
