import type { SMSProvider, SendSMSOptions, ProviderResponse } from '../types';

/**
 * Twilio SMS Provider
 */
export class TwilioProvider implements SMSProvider {
  private accountSid: string;
  private authToken: string;
  private phoneNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (!this.accountSid || !this.authToken || !this.phoneNumber) {
      throw new Error('Twilio credentials not configured');
    }
  }

  async sendSMS(options: SendSMSOptions): Promise<ProviderResponse> {
    try {
      // Ensure STOP instructions are included for compliance
      const body = this.ensureStopInstructions(options.body);

      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

      const formData = new URLSearchParams();
      formData.append('To', options.to);
      formData.append('From', options.from || this.phoneNumber);
      formData.append('Body', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Twilio API error',
          provider: 'twilio',
        };
      }

      return {
        success: true,
        messageId: data.sid,
        provider: 'twilio',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'twilio',
      };
    }
  }

  /**
   * Ensure SMS messages include STOP instructions for compliance
   */
  private ensureStopInstructions(body: string): string {
    const stopText = 'Reply STOP to unsubscribe';
    const bodyLower = body.toLowerCase();

    // Check if STOP instructions already exist
    if (
      bodyLower.includes('stop') ||
      bodyLower.includes('unsubscribe') ||
      bodyLower.includes('opt-out')
    ) {
      return body;
    }

    // Add STOP instructions if message has room
    if (body.length + stopText.length + 2 <= 1600) {
      return `${body}\n\n${stopText}`;
    }

    // If message is too long, truncate and add STOP
    const maxLength = 1600 - stopText.length - 2;
    return `${body.substring(0, maxLength)}...\n\n${stopText}`;
  }
}

