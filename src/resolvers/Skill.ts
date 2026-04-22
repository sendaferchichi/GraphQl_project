import { Cv as CvType, Skill as SkillType } from '../db.js';

export const Skill = {
  cvs: (parent: SkillType, args: any, { db }: any, info: any) => {
    return db.cvs.filter((c: CvType) => c.skillIds.includes(parent.id));
  },
};
