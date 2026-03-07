import twilio from 'twilio';
import type { Lead } from '../types/index.js';

class TwilioService {
  private client: ReturnType<typeof twilio> | null = null;
  private phoneNumber: string = '';

  private ensureClient(): ReturnType<typeof twilio> {
    if (this.client) return this.client;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
    if (!accountSid || !authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables are required');
    }
    this.client = twilio(accountSid, authToken);
    return this.client;
  }

  async initiateCall(lead: Lead): Promise<string> {
    const client = this.ensureClient();
    const webhookUrl = process.env.TWILIO_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('TWILIO_WEBHOOK_URL environment variable is required');
    }

    const statusCallbackUrl = webhookUrl.replace('/voice', '/status');

    const call = await client.calls.create({
      to: lead.phone,
      from: this.phoneNumber,
      url: `${webhookUrl}?leadId=${encodeURIComponent(lead.id)}`,
      statusCallback: statusCallbackUrl,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });

    return call.sid;
  }

  async endCall(callSid: string): Promise<void> {
    const client = this.ensureClient();
    await client.calls(callSid).update({ status: 'completed' });
  }

  async sendSMS(to: string, body: string): Promise<void> {
    const client = this.ensureClient();
    await client.messages.create({
      to,
      from: this.phoneNumber,
      body,
    });
  }
}

export const twilioService = new TwilioService();
