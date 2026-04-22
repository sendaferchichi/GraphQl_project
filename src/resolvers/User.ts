import { Cv as CvType, User as UserType } from '../db.js';

export const User = {
  cvs: (parent: UserType, args: any, { db }: any, info: any) => {
    return db.cvs.filter((c: CvType) => c.userId === parent.id);
  },
};
