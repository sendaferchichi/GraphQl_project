import { appEventEmitter, type CvEventPayload } from './eventEmitter.js';
import { cvEventHistory, type CvEventRecord } from './cvEventStore.js';

// Listener (controller) that handles CV events and persists them
function handleCvEvent(payload: CvEventPayload): void {
  const record: CvEventRecord = {
    id: generateId(),
    type: payload.type,
    cvId: payload.cvId,
    cvName: payload.cvName,
    performedBy: payload.performedBy,
    timestamp: payload.timestamp,
    details: payload.details,
  };

  // Persist the event to the history store
  cvEventHistory.push(record);

  console.log(`[HISTORY] Recorded event ${record.id}: ${record.type} - ${record.details}`);
}

// Simple ID generator
function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Register the listener
export function registerCvEventListeners(): void {
  appEventEmitter.onCvEvent(handleCvEvent);
  console.log('[EVENTS] CV event listeners registered successfully.');
}
