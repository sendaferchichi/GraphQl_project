import type { GraphQLContext } from '../types.js';

type SkillParent = {
  id: string;
};

export const Skill = {
  cvs: async (parent: SkillParent, _args: unknown, { prisma }: GraphQLContext) => {
    return prisma.skill.findUnique({ where: { id: parent.id } }).cvs();
  },
};
