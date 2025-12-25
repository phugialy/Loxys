import type { EmailProvider, SendEmailOptions, ProviderResponse } from '../../types';

/**
 * Postmark Email Provider
 */
export class PostmarkProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.POSTMARK_API_KEY || '';
    this.fromEmail = process.env.POSTMARK_FROM_EMAIL || 'noreply@loxys.app';

    if (!this.apiKey) {
      throw new Error('Postmark API key not configured');
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<ProviderResponse> {
    try {
      // Ensure unsubscribe link is included
      const body = this.ensureUnsubscribeLink(options.body, options.unsubscribeUrl);

      const response = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': this.apiKey,
        },
        body: JSON.stringify({
          From: options.from || this.fromEmail,
          To: options.to,
          Subject: options.subject,
          HtmlBody: body,
          TextBody: this.stripHtml(body),
          MessageStream: 'outbound',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.Message || 'Postmark API error',
          provider: 'postmark',
        };
      }

      return {
        success: true,
        messageId: data.MessageID,
        provider: 'postmark',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'postmark',
      };
    }
  }

  /**
   * Ensure email includes unsubscribe link for compliance
   */
  private ensureUnsubscribeLink(body: string, unsubscribeUrl?: string): string {
    if (!unsubscribeUrl) {
      // Generate default unsubscribe URL if not provided
      unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe`;
    }

    const unsubscribeLink = `<p style="font-size: 12px; color: #666; margin-top: 20px;">
      <a href="${unsubscribeUrl}">Unsubscribe</a> from these emails.
    </p>`;

    // Check if unsubscribe link already exists
    if (body.toLowerCase().includes('unsubscribe')) {
      return body;
    }

    return `${body}\n\n${unsubscribeLink}`;
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }
}

