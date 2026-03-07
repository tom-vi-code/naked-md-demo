import { NextRequest, NextResponse } from 'next/server';
import { buildConciergeReply } from '@/app/lib/chat-concierge';
import { getPersona } from '@/app/lib/persona-store';
import { transformMessage } from '@/app/lib/persona-transform';
import type { ChatMessage, ChatResponsePayload, LeadContext } from '@/app/lib/types';

export async function POST(request: NextRequest) {
  let body: { messages: ChatMessage[]; leadContext: LeadContext };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { messages, leadContext } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: 'Messages array is required and must not be empty' },
      { status: 400 },
    );
  }

  if (!leadContext || !leadContext.firstName) {
    return NextResponse.json(
      { error: 'Lead context with at least firstName is required' },
      { status: 400 },
    );
  }

  try {
    const persona = getPersona();
    const { message, intent } = buildConciergeReply(messages, leadContext);
    const transformed = transformMessage(message, persona, intent);

    const payload: ChatResponsePayload = { message: transformed };
    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error('[chat] concierge error:', err);

    return NextResponse.json(
      {
        message: {
          role: 'assistant',
          content: `Hey ${leadContext.firstName} - I hit a quick snag. I can still help with treatments, pricing, consultation prep, or studio hours if you try that again in a second.`,
        },
      },
      { status: 200 },
    );
  }
}
