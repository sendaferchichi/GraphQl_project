import { Cv } from '../db.js';
import { cvEventHistory, type CvEventRecord } from '../events/index.js';

export const Query = {
  getAllCvs: (parent: any, args: any, { db }: any, info: any) => db.cvs,
  getCvById: (parent: any, { id }: { id: string }, { db }: any, info: any) => {
    const cv = db.cvs.find((c: Cv) => c.id === id);
    if (!cv) throw new Error(`CV with id ${id} not found`);
    return cv;
  },

  // History queries - event sourcing
  getCvHistory: (): CvEventRecord[] => {
    // Return all CV events sorted by most recent first
    return [...cvEventHistory]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .map((event) => ({
        ...event,
        timestamp: event.timestamp.toISOString(),
      }));
  },

  getCvHistoryByCvId: (_parent: any, { cvId }: { cvId: string }) => {
    // Return events for a specific CV, sorted by most recent first
    return cvEventHistory
      .filter((event) => event.cvId === cvId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .map((event) => ({
        ...event,
        timestamp: event.timestamp.toISOString(),
      }));
  },
};
