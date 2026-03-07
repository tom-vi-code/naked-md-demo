import { FastifyInstance } from 'fastify';
import { leads, calls } from '../server.js';
import { callManager } from '../services/call-manager.js';
import { createDeepgramAgent } from '../services/deepgram-agent.js';
import { classifyCall } from '../services/groq-classifier.js';
import { sendFollowUpSMS } from '../services/sms-service.js';
import { twilioService } from '../services/twilio-service.js';
import type { Lead, TranscriptEntry, CallRecord } from '../types/index.js';

export async function twilioMediaRoutes(fastify: FastifyInstance) {
  fastify.register(async function (fastify) {
    fastify.get('/twilio/media-stream', { websocket: true }, (socket, request) => {
      fastify.log.info('Twilio Media Stream WebSocket connected');

      let streamSid: string | null = null;
      let callSid: string | null = null;
      let lead: Lead | null = null;
      let sessionCallId: string | null = null;
      let deepgramWs: WebSocket | null = null;
      let deepgramReady = false;
      const pendingAudioChunks: Buffer[] = [];
      const transcript: TranscriptEntry[] = [];

      socket.on('message', async (data: Buffer | string) => {
        let message: TwilioStreamMessage;
        try {
          message = JSON.parse(typeof data === 'string' ? data : data.toString('utf-8'));
        } catch {
          fastify.log.error('Failed to parse Twilio Media Stream message');
          return;
        }

        switch (message.event) {
          case 'connected':
            fastify.log.info('Twilio Media Stream: connected event received');
            break;

          case 'start':
            handleStart(message);
            break;

          case 'media':
            handleMedia(message);
            break;

          case 'stop':
            fastify.log.info({ streamSid }, 'Twilio Media Stream: stop event received');
            await handleStop();
            break;

          default:
            fastify.log.debug({ event: (message as { event: string }).event }, 'Unhandled Twilio event');
        }
      });

      socket.on('close', async () => {
        fastify.log.info({ streamSid }, 'Twilio Media Stream WebSocket closed');
        await handleStop();
      });

      socket.on('error', (err: Error) => {
        fastify.log.error({ err, streamSid }, 'Twilio Media Stream WebSocket error');
      });

      function handleStart(message: TwilioStartMessage) {
        streamSid = message.streamSid;
        callSid = message.start.callSid;
        const params = message.start.customParameters || {};

        fastify.log.info({
          streamSid,
          callSid,
          leadId: params.leadId,
        }, 'Twilio Media Stream: start event');

        // Resolve the lead from in-memory store or build from custom parameters
        const leadId = params.leadId || '';
        lead = leads.get(leadId) || buildLeadFromParams(leadId, params);

        if (lead) {
          leads.set(lead.id, lead);
        }

        // Create a call session
        if (lead && callSid) {
          const session = callManager.createSession(lead, callSid);
          sessionCallId = session.callId;

          if (session.callId) {
            // Update lead status
            lead.status = 'connected';
            lead.callId = session.callId;
          }

          // Initialize Deepgram Voice Agent
          try {
            deepgramWs = createDeepgramAgent(
              lead,
              {
                onAudio: (audioBuffer: Buffer) => sendAudioToTwilio(audioBuffer),
                onTranscript: handleTranscript,
                onFunctionCall: handleFunctionCall,
                onClose: () => {
                  fastify.log.info('Deepgram Voice Agent closed (callback)');
                  deepgramReady = false;
                },
              },
            ) as unknown as WebSocket;

            // Deepgram agent uses the native WebSocket API
            const dgWs = deepgramWs as unknown as {
              readyState: number;
              OPEN: number;
              onopen: ((ev: Event) => void) | null;
              onmessage: ((ev: MessageEvent) => void) | null;
              onerror: ((ev: Event) => void) | null;
              onclose: ((ev: { code: number; reason: string }) => void) | null;
              send: (data: ArrayBuffer | string) => void;
              close: () => void;
            };

            const existingOnOpen = dgWs.onopen;
            dgWs.onopen = (ev: Event) => {
              fastify.log.info('Deepgram Voice Agent connected');
              deepgramReady = true;

              if (existingOnOpen) existingOnOpen.call(dgWs, ev);

              // Flush any pending audio chunks
              for (const chunk of pendingAudioChunks) {
                dgWs.send(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength) as ArrayBuffer);
              }
              pendingAudioChunks.length = 0;
            };

            dgWs.onerror = (ev: Event) => {
              fastify.log.error({ ev }, 'Deepgram Voice Agent error');
            };

            dgWs.onclose = (_ev: { code: number; reason: string }) => {
              fastify.log.info('Deepgram Voice Agent disconnected');
              deepgramReady = false;
            };
          } catch (err) {
            fastify.log.error({ err }, 'Failed to create Deepgram Voice Agent');
          }
        } else {
          fastify.log.error({ callSid, leadId: lead?.id }, 'Cannot start call: no lead data or callSid');
        }
      }

      function handleMedia(message: TwilioMediaMessage) {
        if (!message.media?.payload) return;

        // Decode base64 mulaw audio from Twilio
        const audioChunk = Buffer.from(message.media.payload, 'base64');

        const dgWs = deepgramWs as unknown as {
          readyState: number;
          OPEN: number;
          send: (data: ArrayBuffer | string) => void;
        } | null;

        if (dgWs && deepgramReady && dgWs.readyState === dgWs.OPEN) {
          dgWs.send(audioChunk.buffer.slice(audioChunk.byteOffset, audioChunk.byteOffset + audioChunk.byteLength) as ArrayBuffer);
        } else {
          // Buffer audio until Deepgram is ready
          pendingAudioChunks.push(audioChunk);
          // Limit buffer size to ~5 seconds of audio (8000 bytes/sec for mulaw 8kHz)
          if (pendingAudioChunks.length > 250) {
            pendingAudioChunks.splice(0, pendingAudioChunks.length - 250);
          }
        }
      }

      function sendAudioToTwilio(audioBuffer: Buffer) {
        if (!streamSid) return;

        const base64Audio = audioBuffer.toString('base64');
        const message = JSON.stringify({
          event: 'media',
          streamSid,
          media: {
            payload: base64Audio,
          },
        });

        try {
          socket.send(message);
        } catch (err) {
          fastify.log.error({ err }, 'Failed to send audio to Twilio');
        }
      }

      function handleTranscript(entry: TranscriptEntry) {
        transcript.push(entry);
        fastify.log.debug({
          speaker: entry.speaker,
          text: entry.text,
        }, 'Transcript entry');
      }

      function handleFunctionCall(name: string, args: Record<string, unknown>) {
        fastify.log.info({ name, args }, 'Deepgram function call received');

        switch (name) {
          case 'hang_up':
            fastify.log.info('Function call: hang_up requested');
            if (streamSid) {
              socket.send(JSON.stringify({
                event: 'mark',
                streamSid,
                mark: { name: 'hang_up' },
              }));
            }
            // Actually end the Twilio call
            if (callSid) {
              twilioService.endCall(callSid).catch((err: unknown) => {
                fastify.log.error({ err }, 'Failed to end Twilio call after hang_up');
              });
            }
            break;

          case 'send_sms':
            fastify.log.info({ args }, 'Function call: send_sms requested');
            // SMS will be handled in post-call processing; log intent here
            break;

          default:
            fastify.log.warn({ name }, 'Unknown function call from Deepgram');
        }
      }

      async function handleStop() {
        // Prevent double-processing
        if (!sessionCallId) return;
        const currentCallId = sessionCallId;
        sessionCallId = null;

        fastify.log.info({ callId: currentCallId }, 'Starting post-call processing');

        // Close Deepgram connection
        try {
          const dgWs = deepgramWs as unknown as {
            readyState: number;
            OPEN: number;
            close: () => void;
          } | null;
          if (dgWs && dgWs.readyState === dgWs.OPEN) {
            dgWs.close();
          }
        } catch (err) {
          fastify.log.error({ err }, 'Error closing Deepgram connection');
        }
        deepgramWs = null;
        deepgramReady = false;

        // Run post-call classification and follow-up
        if (lead && transcript.length > 0) {
          try {
            const classification = await classifyCall(transcript, lead);

            // Find and update the call record
            let callRecord: CallRecord | undefined;
            for (const record of calls.values()) {
              if (record.callSid === callSid) {
                callRecord = record;
                break;
              }
            }

            if (callRecord) {
              callRecord.outcome = classification.outcome;
              callRecord.outcomeConfidence = classification.outcomeConfidence;
              callRecord.sentiment = classification.sentiment;
              callRecord.summary = classification.summary;
              callRecord.keyMoments = classification.keyMoments;
              callRecord.objections = classification.objections;
              callRecord.nextAction = classification.nextAction;
              callRecord.transcript = transcript;
              callRecord.status = 'completed';
              callRecord.endedAt = callRecord.endedAt || new Date().toISOString();

              fastify.log.info({
                callId: currentCallId,
                outcome: classification.outcome,
                confidence: classification.outcomeConfidence,
                sentiment: classification.sentiment,
              }, 'Call classified');
            }

            // Update lead status
            lead.status = 'classified';

            // Send follow-up SMS
            try {
              await sendFollowUpSMS(lead, classification.outcome);
              if (callRecord) {
                callRecord.smsFollowUpSent = true;
                callRecord.smsFollowUpSentAt = new Date().toISOString();
              }
              lead.status = 'followed-up';
              fastify.log.info({ leadId: lead.id, outcome: classification.outcome }, 'Follow-up SMS sent');
            } catch (smsErr) {
              fastify.log.error({ err: smsErr }, 'Failed to send follow-up SMS');
            }
          } catch (err) {
            fastify.log.error({ err }, 'Post-call classification failed');
          }
        } else {
          fastify.log.warn({ callId: currentCallId, hasLead: !!lead, transcriptLength: transcript.length },
            'Skipping post-call processing: no lead or empty transcript');
        }

        // End the session in call manager
        try {
          callManager.endSession(currentCallId);
        } catch (err) {
          fastify.log.error({ err }, 'Error ending call session');
        }
      }
    });
  });
}

// ---- Twilio Media Stream message types ----

interface TwilioConnectedMessage {
  event: 'connected';
  protocol: string;
  version: string;
}

interface TwilioStartMessage {
  event: 'start';
  sequenceNumber: string;
  streamSid: string;
  start: {
    streamSid: string;
    accountSid: string;
    callSid: string;
    tracks: string[];
    mediaFormat: {
      encoding: string;
      sampleRate: number;
      channels: number;
    };
    customParameters: Record<string, string>;
  };
}

interface TwilioMediaMessage {
  event: 'media';
  sequenceNumber: string;
  streamSid: string;
  media: {
    track: string;
    chunk: string;
    timestamp: string;
    payload: string;
  };
}

interface TwilioStopMessage {
  event: 'stop';
  sequenceNumber: string;
  streamSid: string;
}

type TwilioStreamMessage =
  | TwilioConnectedMessage
  | TwilioStartMessage
  | TwilioMediaMessage
  | TwilioStopMessage;

function buildLeadFromParams(leadId: string, params: Record<string, string>): Lead | null {
  if (!leadId) return null;

  return {
    id: leadId,
    firstName: params.firstName || 'Unknown',
    lastName: params.lastName || '',
    phone: params.phone || '',
    email: params.email || '',
    offerType: (params.offerType as Lead['offerType']) || 'complimentary-consult',
    interest: params.interest || '',
    location: (params.location as Lead['location']) || 'newport-beach',
    status: 'connected',
    source: 'web-form',
    createdAt: new Date().toISOString(),
    callAttempts: 1,
    lastCallAttempt: new Date().toISOString(),
    callId: null,
  };
}
