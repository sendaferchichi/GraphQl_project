import { Cv as CvType, User as UserType, Skill as SkillType } from '../db.js';

export const Cv = {
  owner: (parent: CvType, args: any, { db }: any, info: any) => {
    return db.users.find((u: UserType) => u.id === parent.userId);
  },
  skills: (parent: CvType, args: any, { db }: any, info: any) => {
    return db.skills.filter((s: SkillType) => parent.skillIds.includes(s.id));
  },
};
