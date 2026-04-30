import { Cv, User, Skill } from '../db.js';
import { appEventEmitter, CvEventType } from '../events/index.js';

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

    // Emit event for history tracking
    appEventEmitter.emitCvEvent({
      type: CvEventType.CREATED,
      cvId: newCv.id,
      cvName: newCv.name,
      performedBy: input.userId,
      timestamp: new Date(),
      details: `CV "${newCv.name}" créé avec le poste "${newCv.job}" par l'utilisateur ${input.userId}`,
    });

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

    const existingCv = db.cvs[index];
    const updatedCv = { ...existingCv, ...input };
    db.cvs[index] = updatedCv;

    pubSub.publish('cvModified', { mutation: 'UPDATED', data: updatedCv });

    // Emit event for history tracking
    const changes: string[] = [];
    if (input.name !== undefined) changes.push(`name→"${input.name}"`);
    if (input.age !== undefined) changes.push(`age→${input.age}`);
    if (input.job !== undefined) changes.push(`job→"${input.job}"`);
    if (input.userId !== undefined) changes.push(`owner→${input.userId}`);
    if (input.skillIds !== undefined) changes.push(`skills→[${input.skillIds.join(',')}]`);

    appEventEmitter.emitCvEvent({
      type: CvEventType.UPDATED,
      cvId: updatedCv.id,
      cvName: updatedCv.name,
      performedBy: input.userId ?? existingCv.userId,
      timestamp: new Date(),
      details: `CV "${updatedCv.name}" mis à jour: ${changes.join(', ')}`,
    });

    return updatedCv;
  },

  deleteCv: (parent: any, { id }: { id: string }, { db, pubSub }: any, info: any) => {
    const index = db.cvs.findIndex((c: Cv) => c.id === id);
    if (index === -1) throw new Error(`CV with id ${id} not found`);

    const deletedCv = db.cvs[index];
    db.cvs.splice(index, 1);

    pubSub.publish('cvModified', { mutation: 'DELETED', data: deletedCv });

    // Emit event for history tracking
    appEventEmitter.emitCvEvent({
      type: CvEventType.DELETED,
      cvId: deletedCv.id,
      cvName: deletedCv.name,
      performedBy: deletedCv.userId,
      timestamp: new Date(),
      details: `CV "${deletedCv.name}" supprimé (appartenait à l'utilisateur ${deletedCv.userId})`,
    });

    return true;
  },

  // Collab Logic
  sendMessage: (_parent: any, { to, text }: any, { db, pubSub }: any) => {
    // On simule l'expéditeur (dans un vrai cas, on le prendrait du token/context)
    const message = {
      senderId: 'unknown', // Sera remplacé par la logique d'auth plus tard
      senderName: 'User',
      text,
      timestamp: new Date().toISOString(),
    };
    pubSub.publish(`MESSAGE_ADDED_${to}`, message);
    return message;
  },

  sendDraw: (_parent: any, args: any, { pubSub }: any) => {
    const drawEvent = {
      senderId: 'unknown',
      ...args,
    };
    pubSub.publish(`BOARD_UPDATED_${args.to}`, drawEvent);
    return drawEvent;
  },

  // Webhook Management
  registerWebhook: (_parent: any, { url, events }: { url: string, events: string[] }, { db }: any) => {
    const newWebhook = {
      id: Math.random().toString(36).substring(2, 11),
      url,
      events,
    };
    db.webhooks.push(newWebhook);
    console.log(`[WEBHOOK] Registered new webhook: ${url} for events: ${events.join(', ')}`);
    return newWebhook;
  },

  unregisterWebhook: (_parent: any, { id }: { id: string }, { db }: any) => {
    const index = db.webhooks.findIndex((w: any) => w.id === id);
    if (index === -1) throw new Error(`Webhook with id ${id} not found`);
    
    const removed = db.webhooks.splice(index, 1);
    console.log(`[WEBHOOK] Unregistered webhook: ${removed[0].url}`);
    return true;
  },
};
