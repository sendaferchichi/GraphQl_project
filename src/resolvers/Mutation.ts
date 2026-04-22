import { Cv, User, Skill } from '../db.js';

export const Mutation = {
  createCv: (parent: any, { input }: { input: any }, { db, pubSub }: any, info: any) => {
    // Validate user existence
    const userExists = db.users.some((u: User) => u.id === input.userId);
    if (!userExists) throw new Error(`User with id ${input.userId} does not exist`);

    // Validate skills existence
    input.skillIds.forEach((skillId: string) => {
      if (!db.skills.some((s: Skill) => s.id === skillId)) {
        throw new Error(`Skill with id ${skillId} does not exist`);
      }
    });

    const newCv: Cv = {
      id: Math.random().toString(36).substring(2, 11),
      ...input,
    };

    db.cvs.push(newCv);
    pubSub.publish('cvModified', { mutation: 'CREATED', data: newCv });
    return newCv;
  },

  updateCv: (parent: any, { input }: { input: any }, { db, pubSub }: any, info: any) => {
    const index = db.cvs.findIndex((c: Cv) => c.id === input.id);
    if (index === -1) throw new Error(`CV with id ${input.id} not found`);

    // Validate user existence if changing
    if (input.userId) {
      const userExists = db.users.some((u: User) => u.id === input.userId);
      if (!userExists) throw new Error(`User with id ${input.userId} does not exist`);
    }

    // Validate skills existence if changing
    if (input.skillIds) {
      input.skillIds.forEach((skillId: string) => {
        if (!db.skills.some((s: Skill) => s.id === skillId)) {
          throw new Error(`Skill with id ${skillId} does not exist`);
        }
      });
    }

    const updatedCv = { ...db.cvs[index], ...input };
    db.cvs[index] = updatedCv;

    pubSub.publish('cvModified', { mutation: 'UPDATED', data: updatedCv });
    return updatedCv;
  },

  deleteCv: (parent: any, { id }: { id: string }, { db, pubSub }: any, info: any) => {
    const index = db.cvs.findIndex((c: Cv) => c.id === id);
    if (index === -1) throw new Error(`CV with id ${id} not found`);

    const deletedCv = db.cvs[index];
    db.cvs.splice(index, 1);

    pubSub.publish('cvModified', { mutation: 'DELETED', data: deletedCv });
    return true;
  },
};
