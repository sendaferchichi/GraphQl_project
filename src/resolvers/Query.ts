import { Cv } from '../db.js';

export const Query = {
  getAllCvs: (parent: any, args: any, { db }: any, info: any) => db.cvs,
  getCvById: (parent: any, { id }: { id: string }, { db }: any, info: any) => {
    const cv = db.cvs.find((c: Cv) => c.id === id);
    if (!cv) throw new Error(`CV with id ${id} not found`);
    return cv;
  },
};
