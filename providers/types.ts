/**
 * Provider abstraction types
 */

export type Channel = 'sms' | 'email';

export interface SendSMSOptions {
  to: string; // E.164 format phone number
  body: string;
  from?: string; // Optional sender number
}

export interface SendEmailOptions {
  to: string; // Email address
  subject: string;
  body: string; // HTML or plain text
  from?: string; // Optional sender email
  unsubscribeUrl?: string; // For compliance
}

export interface ProviderResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface SMSProvider {
  sendSMS(options: SendSMSOptions): Promise<ProviderResponse>;
}

export interface EmailProvider {
  sendEmail(options: SendEmailOptions): Promise<ProviderResponse>;
}

export interface MessageProvider extends SMSProvider, EmailProvider {
  name: string;
  supportsSMS: boolean;
  supportsEmail: boolean;
}

