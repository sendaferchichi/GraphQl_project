import type { CvEventType } from './eventEmitter.js';

// Entity: represents a persisted CV event record
export interface CvEventRecord {
  id: string;
  type: CvEventType;       // Type of operation (CREATED, UPDATED, DELETED)
  cvId: string;            // ID of the affected CV
  cvName: string;          // Name of the CV at the time of the event
  performedBy: string;     // User ID of who performed the operation
  timestamp: Date;         // Date and time of the operation
  details: string;         // Description of what was done
}

// In-memory persistence store for CV event history
export const cvEventHistory: CvEventRecord[] = [];
