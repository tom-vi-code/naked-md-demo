import { FastifyInstance } from 'fastify';
import { leads } from '../server.js';

export async function twilioVoiceRoutes(fastify: FastifyInstance) {
  fastify.post('/twilio/voice', async (request, reply) => {
    const body = request.body as Record<string, string>;

    // Extract leadId from the query parameters (sent via Twilio request URL)
    const query = request.query as Record<string, string>;
    const leadId = query.leadId || body.leadId || '';

    const lead = leads.get(leadId);

    // Build Stream parameters from the lead, falling back to request body
    const firstName = lead?.firstName || body.firstName || '';
    const lastName = lead?.lastName || body.lastName || '';
    const offerType = lead?.offerType || body.offerType || 'complimentary-consult';
    const interest = lead?.interest || body.interest || '';
    const location = lead?.location || body.location || 'newport-beach';
    const email = lead?.email || body.email || '';
    const phone = lead?.phone || body.To || '';

    // Derive the WebSocket URL from the WS_BACKEND_URL environment variable
    const wsBackendUrl = process.env.WS_BACKEND_URL || '';
    const wsUrl = wsBackendUrl
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://${wsUrl}/twilio/media-stream">
      <Parameter name="leadId" value="${escapeXml(leadId)}" />
      <Parameter name="firstName" value="${escapeXml(firstName)}" />
      <Parameter name="lastName" value="${escapeXml(lastName)}" />
      <Parameter name="offerType" value="${escapeXml(offerType)}" />
      <Parameter name="interest" value="${escapeXml(interest)}" />
      <Parameter name="location" value="${escapeXml(location)}" />
      <Parameter name="email" value="${escapeXml(email)}" />
      <Parameter name="phone" value="${escapeXml(phone)}" />
    </Stream>
  </Connect>
</Response>`;

    reply.type('application/xml').send(twiml);
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
