import { FastifyInstance } from 'fastify';
import {
  addTrackedDMFromWebhook,
  addTrackedDMFromTrigger,
  getTrackedDMs,
  getTrackedDM,
  type WebhookPayload,
  type TriggerPayload,
} from '../services/dm-tracker.js';

export async function instagramWebhookRoutes(fastify: FastifyInstance) {
  // ---------- ManyChat webhook ----------
  fastify.post<{ Body: WebhookPayload }>('/api/instagram-webhook', async (request, reply) => {
    const body = request.body;

    if (!body.name || !body.ig_handle) {
      return reply.status(400).send({ error: 'Missing required fields: name, ig_handle' });
    }

    const dm = addTrackedDMFromWebhook({
      name: body.name,
      ig_handle: body.ig_handle,
      keyword: body.keyword || 'unknown',
      timestamp: body.timestamp || new Date().toISOString(),
    });

    fastify.log.info(
      { dmId: dm.id, handle: dm.contact.handle, keyword: body.keyword },
      'Instagram DM webhook received',
    );

    return reply.status(201).send({ id: dm.id, status: 'tracked' });
  });

  // ---------- GET all tracked DMs (dashboard polling) ----------
  // Serve on both paths — /api/dm-events is what the frontend expects
  const getAllDMs = async (_request: unknown, reply: { send: (data: unknown) => unknown }) => {
    const dms = getTrackedDMs();
    return reply.send({ dms, count: dms.length });
  };
  fastify.get('/api/instagram-webhook', getAllDMs);
  fastify.get('/api/dm-events', getAllDMs);

  // ---------- GET single tracked DM ----------
  fastify.get<{ Params: { id: string } }>('/api/instagram-webhook/:id', async (request, reply) => {
    const dm = getTrackedDM(request.params.id);
    if (!dm) {
      return reply.status(404).send({ error: 'DM not found' });
    }
    return reply.send(dm);
  });

  // ---------- Manual trigger (demo fallback) ----------
  fastify.post<{ Body: TriggerPayload }>('/api/dm-trigger', async (request, reply) => {
    const body = request.body;

    if (!body.name || !body.handle) {
      return reply.status(400).send({ error: 'Missing required fields: name, handle' });
    }

    const dm = addTrackedDMFromTrigger({
      name: body.name,
      handle: body.handle,
    });

    fastify.log.info(
      { dmId: dm.id, handle: dm.contact.handle },
      'Manual DM trigger fired',
    );

    return reply.status(201).send({ id: dm.id, status: 'tracked' });
  });
}
