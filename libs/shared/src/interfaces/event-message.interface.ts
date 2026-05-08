export interface EventMessage {
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  occurredAt: string;
  producer: string;
  version: 1;
  tenantId?: string;
  metadata: {
    correlationId: string;
    retryCount: number;
  };
}
