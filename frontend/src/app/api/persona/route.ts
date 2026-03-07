import { NextRequest, NextResponse } from 'next/server';
import { getPersona, setPersona, resetPersona } from '@/app/lib/persona-store';

export async function GET() {
  return NextResponse.json(getPersona());
}

export async function PUT(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updated = setPersona(body);
  return NextResponse.json(updated);
}

export async function DELETE() {
  const reset = resetPersona();
  return NextResponse.json(reset);
}
