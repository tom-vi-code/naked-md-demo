import WebSocket from 'ws';
import type { Lead, TranscriptEntry } from '../types/index.js';
import { buildVoiceAgentPrompt } from '../prompts/voice-agent-system.js';

interface DeepgramAgentCallbacks {
  onAudio: (audioBuffer: Buffer) => void;
  onTranscript: (entry: TranscriptEntry) => void;
  onFunctionCall: (name: string, params: Record<string, unknown>) => void;
  onClose: () => void;
}

export function createDeepgramAgent(
  lead: Lead,
  callbacks: DeepgramAgentCallbacks,
): WebSocket {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPGRAM_API_KEY environment variable is not set');
  }

  const ws = new WebSocket('wss://agent.deepgram.com/v1/agent/converse', {
    headers: {
      Authorization: `Token ${apiKey}`,
    },
  });

  const systemPrompt = buildVoiceAgentPrompt({
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    interest: lead.interest,
    offerType: lead.offerType,
    location: lead.location,
  });

  ws.on('open', () => {
    const config = {
      type: 'Settings',
      audio: {
        input: {
          encoding: 'mulaw',
          sample_rate: 8000,
        },
        output: {
          encoding: 'mulaw',
          sample_rate: 8000,
          container: 'none',
        },
      },
      agent: {
        language: 'en',
        listen: {
          provider: {
            type: 'deepgram',
            model: 'nova-3',
          },
        },
        think: {
          provider: {
            type: 'open_ai',
            model: 'gpt-4o-mini',
          },
          prompt: systemPrompt,
          functions: [
            {
              name: 'hang_up',
              description:
                'End the phone call when the conversation has naturally concluded and both parties have said goodbye.',
              parameters: {
                type: 'object',
                properties: {
                  reason: {
                    type: 'string',
                    description: 'Brief reason for ending the call',
                  },
                },
                required: ['reason'],
              },
            },
            {
              name: 'send_sms',
              description:
                'Send the prospect a confirmation text message with next steps, pricing info, or guest pass details.',
              parameters: {
                type: 'object',
                properties: {
                  template: {
                    type: 'string',
                    description:
                      'The type of SMS to send: tour_confirmation, guest_pass_info, pricing_summary, or general_followup',
                  },
                },
                required: ['template'],
              },
            },
          ],
        },
        speak: {
          provider: {
            type: 'deepgram',
            model: 'aura-2-thalia-en',
          },
        },
        greeting: `Hi ${lead.firstName}! This is Vi from NakedMD. How are you doing today?`,
      },
    };

    console.log('[DeepgramAgent] Sending Settings config to Deepgram');
    ws.send(JSON.stringify(config));
  });

  ws.on('message', (data: WebSocket.RawData) => {
    // Deepgram sends both binary (audio) and text (JSON) messages
    if (typeof data === 'string' || (data instanceof Buffer && isJsonBuffer(data))) {
      const messageStr = data.toString();
      let message: Record<string, unknown>;

      try {
        message = JSON.parse(messageStr) as Record<string, unknown>;
      } catch {
        return;
      }

      const messageType = message.type as string | undefined;

      switch (messageType) {
        case 'Welcome':
          console.log('[DeepgramAgent] Received Welcome from Deepgram');
          break;

        case 'SettingsApplied':
          console.log('[DeepgramAgent] Settings applied successfully');
          break;

        case 'UserStartedSpeaking':
          break;

        case 'ConversationText': {
          const role = message.role as string;
          const content = message.content as string;
          if (role && content) {
            const entry: TranscriptEntry = {
              speaker: role === 'user' ? 'caller' : 'agent',
              text: content,
              timestamp: Date.now(),
            };
            callbacks.onTranscript(entry);
          }
          break;
        }

        case 'FunctionCallRequest': {
          const functionName = message.function_name as string;
          const functionInput = (message.input as Record<string, unknown>) ?? {};
          if (functionName) {
            callbacks.onFunctionCall(functionName, functionInput);

            const response = {
              type: 'FunctionCallResponse',
              function_call_id: message.function_call_id,
              output: JSON.stringify({ status: 'success' }),
            };
            ws.send(JSON.stringify(response));
          }
          break;
        }

        case 'AgentAudioDone':
        case 'EndOfThought':
          break;

        case 'Error':
          console.error('[DeepgramAgent] Error from Deepgram:', JSON.stringify(message));
          break;

        default:
          console.log('[DeepgramAgent] Message type:', messageType);
          break;
      }
    } else {
      // Binary data — this is audio output from TTS
      const audioBuffer = Buffer.isBuffer(data)
        ? data
        : Buffer.from(data as ArrayBuffer);
      callbacks.onAudio(audioBuffer);
    }
  });

  ws.on('close', (code: number, reason: Buffer) => {
    console.log(`[DeepgramAgent] WebSocket closed: code=${code} reason=${reason.toString()}`);
    callbacks.onClose();
  });

  ws.on('error', (error: Error) => {
    console.error('[DeepgramAgent] WebSocket error:', error.message);
    callbacks.onClose();
  });

  return ws;
}

function isJsonBuffer(buf: Buffer): boolean {
  if (buf.length === 0) return false;
  const firstByte = buf[0];
  return firstByte === 0x7b || firstByte === 0x5b;
}
