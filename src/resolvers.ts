import { createPubSub } from 'graphql-yoga';
import { db, UserRole, Cv, User, Skill } from './db.js';

const pubsub = createPubSub<{
  cvModified: [
    {
      mutation: 'CREATED' | 'UPDATED' | 'DELETED';
      data: Cv;
    }
  ];
}>();

export const resolvers = {
  Query: {
    getAllCvs: (parent: any, args: any, { db }: any) => db.cvs,
    getCvById: (parent: any, { id }: { id: string }, { db }: any) => {
      const cv = db.cvs.find((c: Cv) => c.id === id);
      if (!cv) throw new Error(`CV with id ${id} not found`);
      return cv;
    },
  },

  Cv: {
    owner: (parent: Cv, args: any, { db }: any) => {
      return db.users.find((u: User) => u.id === parent.userId);
    },
    skills: (parent: Cv, args: any, { db }: any) => {
      return db.skills.filter((s: Skill) => parent.skillIds.includes(s.id));
    },
  },

  User: {
    cvs: (parent: User, args: any, { db }: any) => {
      return db.cvs.filter((c: Cv) => c.userId === parent.id);
    },
  },

  Skill: {
    cvs: (parent: Skill, args: any, { db }: any) => {
      return db.cvs.filter((c: Cv) => c.skillIds.includes(parent.id));
    },
  },

  Mutation: {
    createCv: (parent: any, { input }: { input: any }, { db }: any) => {
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
        id: Math.random().toString(36).substr(2, 9),
        ...input,
      };

      db.cvs.push(newCv);
      pubsub.publish('cvModified', { mutation: 'CREATED', data: newCv });
      return newCv;
    },

    updateCv: (parent: any, { input }: { input: any }, { db }: any) => {
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

      pubsub.publish('cvModified', { mutation: 'UPDATED', data: updatedCv });
      return updatedCv;
    },

    deleteCv: (parent: any, { id }: { id: string }, { db }: any) => {
      const index = db.cvs.findIndex((c: Cv) => c.id === id);
      if (index === -1) throw new Error(`CV with id ${id} not found`);

      const deletedCv = db.cvs[index];
      db.cvs.splice(index, 1);

      pubsub.publish('cvModified', { mutation: 'DELETED', data: deletedCv });
      return true;
    },
  },

  Subscription: {
    cvModified: {
      subscribe: () => pubsub.subscribe('cvModified'),
      resolve: (payload: any) => payload,
    },
  },
};
