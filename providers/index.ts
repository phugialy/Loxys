import { TwilioProvider } from './twilio/client';
import { PostmarkProvider } from './email/postmark/client';
import type { MessageProvider, SendSMSOptions, SendEmailOptions, ProviderResponse } from './types';

/**
 * Provider factory
 */
export function getSMSProvider(): TwilioProvider {
  return new TwilioProvider();
}

export function getEmailProvider(): PostmarkProvider {
  return new PostmarkProvider();
}

/**
 * Send SMS using configured provider
 */
export async function sendSMS(options: SendSMSOptions): Promise<ProviderResponse> {
  const provider = getSMSProvider();
  return provider.sendSMS(options);
}

/**
 * Send Email using configured provider
 */
export async function sendEmail(options: SendEmailOptions): Promise<ProviderResponse> {
  const provider = getEmailProvider();
  return provider.sendEmail(options);
}

