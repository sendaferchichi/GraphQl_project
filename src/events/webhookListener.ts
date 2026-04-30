import { appEventEmitter, type CvEventPayload } from './eventEmitter.js';
import { db } from '../db.js';

/**
 * Listener that handles CV events and forwards them to registered webhooks
 */
async function handleWebhookEvents(payload: CvEventPayload): Promise<void> {
  // Find webhooks subscribed to this event type
  const subscribers = db.webhooks.filter(w => w.events.includes(payload.type));

  if (subscribers.length === 0) return;

  console.log(`[WEBHOOK] Notifying ${subscribers.length} subscribers for event ${payload.type}`);

  const notification = {
    event: payload.type,
    timestamp: payload.timestamp,
    data: {
      cvId: payload.cvId,
      cvName: payload.cvName,
      performedBy: payload.performedBy,
      details: payload.details
    }
  };

  // Send the notification to each subscriber
  const tasks = subscribers.map(async (webhook) => {
    try {
      console.log(`[WEBHOOK] Sending notification to ${webhook.url}...`);
      
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CvTech-Webhook-Service/1.0'
        },
        body: JSON.stringify(notification)
      });

      if (response.ok) {
        console.log(`[WEBHOOK] Success: Notification sent to ${webhook.url}`);
      } else {
        console.warn(`[WEBHOOK] Warning: ${webhook.url} returned status ${response.status}`);
      }
    } catch (error: any) {
      console.error(`[WEBHOOK] Error: Failed to send notification to ${webhook.url}: ${error.message}`);
    }
  });

  // We don't await here to avoid blocking the main execution thread
  Promise.all(tasks).catch(err => console.error('[WEBHOOK] Error in promise all:', err));
}

/**
 * Register the webhook event listener
 */
export function registerWebhookEventListeners(): void {
  appEventEmitter.onCvEvent(handleWebhookEvents);
  console.log('[EVENTS] Webhook event listener registered successfully.');
}
