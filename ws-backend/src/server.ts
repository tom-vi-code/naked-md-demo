import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { v4 as uuidv4 } from 'uuid';

import type { Lead, CallRecord, LeadSubmission } from './types/index.js';
import { healthRoutes } from './routes/health.js';
import { twilioVoiceRoutes } from './routes/twilio-voice.js';
import { twilioMediaRoutes } from './routes/twilio-media.js';
import { twilioStatusRoutes } from './routes/twilio-status.js';
import { processLead } from './services/lead-processor.js';

// ---------------------------------------------------------------------------
// In-memory stores
// ---------------------------------------------------------------------------

export const leads = new Map<string, Lead>();
export const calls = new Map<string, CallRecord>();

// ---------------------------------------------------------------------------
// Fastify server
// ---------------------------------------------------------------------------

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' } }
        : undefined,
  },
});

async function bootstrap() {
  // ---- Plugins ----

  await server.register(cors, {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await server.register(websocket);

  // Fastify v5 / @fastify/websocket v11: register content-type parser for
  // Twilio's form-urlencoded webhooks
  server.addContentTypeParser(
    'application/x-www-form-urlencoded',
    { parseAs: 'string' },
    (_req, body, done) => {
      try {
        const parsed = Object.fromEntries(new URLSearchParams(body as string));
        done(null, parsed);
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  // ---- Routes ----

  await server.register(healthRoutes);
  await server.register(twilioVoiceRoutes);
  await server.register(twilioMediaRoutes);
  await server.register(twilioStatusRoutes);

  // ---- Lead processing endpoint ----

  server.post<{
    Body: LeadSubmission & { leadId?: string };
  }>('/api/lead/process', async (request, reply) => {
    const body = request.body;

    const leadId = body.leadId || uuidv4();
    const lead: Lead = {
      id: leadId,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      email: body.email,
      offerType: body.offerType,
      interest: body.interest,
      location: body.location,
      status: 'new',
      source: 'web-form',
      createdAt: new Date().toISOString(),
      callAttempts: 0,
      lastCallAttempt: null,
      callId: null,
    };

    leads.set(leadId, lead);
    server.log.info({ leadId, phone: lead.phone }, 'Processing new lead');

    try {
      const { callSid } = await processLead(lead, { leads, calls });

      return reply.status(200).send({
        callSid,
        leadId,
        status: 'initiating',
      });
    } catch (err) {
      server.log.error({ err, leadId }, 'Failed to process lead');
      lead.status = 'new'; // Reset status on failure
      return reply.status(500).send({
        error: 'Failed to initiate call',
        leadId,
      });
    }
  });

  // ---- Seed data (optional – will exist later) ----

  try {
    const seedModule = await import('./seed-data.js');
    if (seedModule.seedLeads) {
      for (const lead of seedModule.seedLeads) {
        leads.set(lead.id, lead);
      }
      server.log.info(`Loaded ${seedModule.seedLeads.length} seed leads`);
    }
    if (seedModule.seedCalls) {
      for (const call of seedModule.seedCalls) {
        calls.set(call.id, call);
      }
      server.log.info(`Loaded ${seedModule.seedCalls.length} seed call records`);
    }
  } catch {
    server.log.debug('No seed data module found – starting with empty stores');
  }

  // ---- Start server ----

  const port = parseInt(process.env.PORT || '8080', 10);
  const host = process.env.HOST || '0.0.0.0';

  await server.listen({ port, host });
  server.log.info(`Server listening on ${host}:${port}`);
}

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

const shutdown = async (signal: string) => {
  server.log.info(`Received ${signal} – shutting down gracefully`);
  try {
    await server.close();
    process.exit(0);
  } catch (err) {
    server.log.error({ err }, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

bootstrap().catch((err) => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});
