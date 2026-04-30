import { EventEmitter } from 'events';

// Event types for CV operations
export enum CvEventType {
  CREATED = 'CV_CREATED',
  UPDATED = 'CV_UPDATED',
  DELETED = 'CV_DELETED',
}

// Payload emitted with each CV event
export interface CvEventPayload {
  type: CvEventType;
  cvId: string;
  cvName: string;
  performedBy: string; // userId of the person who performed the action
  timestamp: Date;
  details: string;     // Human-readable description of the operation
}

// Singleton event emitter for the application
class AppEventEmitter extends EventEmitter {
  emitCvEvent(payload: CvEventPayload): void {
    this.emit('cv:event', payload);
    console.log(`[EVENT] ${payload.type} on CV "${payload.cvName}" by user ${payload.performedBy} at ${payload.timestamp.toISOString()}`);
  }

  onCvEvent(listener: (payload: CvEventPayload) => void): void {
    this.on('cv:event', listener);
  }
}

export const appEventEmitter = new AppEventEmitter();
