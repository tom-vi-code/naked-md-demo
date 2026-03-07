import Groq from 'groq-sdk';
import type { ClassificationResult, Lead, OutcomeType, TranscriptEntry } from '../types/index.js';
import { buildClassificationPrompt } from '../prompts/classification-prompt.js';

const VALID_OUTCOMES: OutcomeType[] = [
  'consultation-booked',
  'treatment-sold',
  'appointment-scheduled',
  'package-sold',
  'callback-requested',
  'info-sent',
  'info-provided',
  'nurture',
  'no-answer',
  'voicemail',
  'declined',
  'tech-issue',
  'win-back-success',
  'referral-generated',
];

let _groqClient: Groq | null = null;

function getGroqClient(): Groq | null {
  if (_groqClient) return _groqClient;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  _groqClient = new Groq({ apiKey });
  return _groqClient;
}

function formatTranscript(entries: TranscriptEntry[]): string {
  return entries
    .map((entry) => {
      const speaker = entry.speaker === 'agent' ? 'Agent' : 'Caller';
      return `${speaker}: ${entry.text}`;
    })
    .join('\n');
}

function createDefaultResult(): ClassificationResult {
  return {
    summary: 'Call could not be classified due to a processing error.',
    outcome: 'tech-issue',
    outcomeConfidence: 0,
    sentiment: 50,
    keyMoments: [],
    objections: [],
    nextAction: 'Manual review required',
  };
}

export async function classifyCall(
  transcript: TranscriptEntry[],
  lead: Lead,
): Promise<ClassificationResult> {
  const groq = getGroqClient();
  if (!groq) {
    console.error('[GroqClassifier] GROQ_API_KEY environment variable is not set');
    return createDefaultResult();
  }

  const transcriptText = formatTranscript(transcript);

  if (!transcriptText.trim()) {
    return {
      ...createDefaultResult(),
      summary: 'No transcript content available for classification.',
      outcome: 'no-answer',
    };
  }

  const classificationPrompt = buildClassificationPrompt(transcriptText, {
    firstName: lead.firstName,
    lastName: lead.lastName,
    interest: lead.interest,
    offerType: lead.offerType,
    location: lead.location,
  });

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: classificationPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      console.error('[GroqClassifier] Empty response from Groq API');
      return createDefaultResult();
    }

    const parsed = JSON.parse(responseContent) as Record<string, unknown>;

    // Validate and coerce the outcome
    const rawOutcome = parsed.outcome as string;
    const outcome: OutcomeType = VALID_OUTCOMES.includes(rawOutcome as OutcomeType)
      ? (rawOutcome as OutcomeType)
      : 'tech-issue';

    const result: ClassificationResult = {
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      outcome,
      outcomeConfidence: clamp(Number(parsed.outcomeConfidence) || 0, 0, 1),
      sentiment: clamp(Math.round(Number(parsed.sentiment) || 50), 0, 100),
      keyMoments: Array.isArray(parsed.keyMoments)
        ? (parsed.keyMoments as string[])
        : [],
      objections: Array.isArray(parsed.objections)
        ? (parsed.objections as string[])
        : [],
      nextAction: typeof parsed.nextAction === 'string' ? parsed.nextAction : '',
    };

    return result;
  } catch (error) {
    console.error(
      '[GroqClassifier] Classification failed:',
      error instanceof Error ? error.message : error,
    );
    return createDefaultResult();
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
