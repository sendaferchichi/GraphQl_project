import { Prisma, type Cv, UserRole } from '@prisma/client';
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

  createUser: async (
    _parent: unknown,
    { input }: { input: { name: string; email: string; role?: UserRole } },
    { prisma }: GraphQLContext,
  ) => {
    const taken = await prisma.user.findUnique({ where: { email: input.email } });
    if (taken) {
      throw new Error(`Email ${input.email} is already in use`);
    }
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role ?? UserRole.USER,
      },
    });
  },

  updateUser: async (
    _parent: unknown,
    {
      input,
    }: {
      input: { id: string; name?: string; email?: string; role?: UserRole };
    },
    { prisma }: GraphQLContext,
  ) => {
    const user = await prisma.user.findUnique({ where: { id: input.id } });
    if (!user) throw new Error(`User with id ${input.id} not found`);

    if (input.email && input.email !== user.email) {
      const clash = await prisma.user.findUnique({ where: { email: input.email } });
      if (clash) throw new Error(`Email ${input.email} is already in use`);
    }

    return prisma.user.update({
      where: { id: input.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.role !== undefined && { role: input.role }),
      },
    });
  },

  deleteUser: async (
    _parent: unknown,
    { id }: { id: string },
    { prisma }: GraphQLContext,
  ) => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { cvs: true } } },
    });
    if (!user) throw new Error(`User with id ${id} not found`);

    if (user._count.cvs > 0) {
      throw new Error(
        `Cannot delete user ${id}: they still own ${user._count.cvs} CV(s).`,
      );
    }

    await prisma.user.delete({ where: { id } });
    return true;
  },

  createSkill: async (
    _parent: unknown,
    { input }: { input: { designation: string } },
    { prisma }: GraphQLContext,
  ) => {
    const exists = await prisma.skill.findUnique({ where: { designation: input.designation } });
    if (exists) throw new Error(`Skill "${input.designation}" already exists`);
    return prisma.skill.create({ data: { designation: input.designation } });
  },

  updateSkill: async (
    _parent: unknown,
    { input }: { input: { id: string; designation: string } },
    { prisma }: GraphQLContext,
  ) => {
    const skill = await prisma.skill.findUnique({ where: { id: input.id } });
    if (!skill) throw new Error(`Skill with id ${input.id} not found`);

    if (input.designation !== skill.designation) {
      const clash = await prisma.skill.findUnique({ where: { designation: input.designation } });
      if (clash) throw new Error(`Skill "${input.designation}" already exists`);
    }

    return prisma.skill.update({
      where: { id: input.id },
      data: { designation: input.designation },
    });
  },

  deleteSkill: async (
    _parent: unknown,
    { id }: { id: string },
    { prisma }: GraphQLContext,
  ) => {
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new Error(`Skill with id ${id} not found`);
    await prisma.skill.delete({ where: { id } });
    return true;
  },
};
