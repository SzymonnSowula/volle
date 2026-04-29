import { google } from 'googleapis';

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  date: Date;
}

export interface DraftEmail {
  to: string;
  subject: string;
  body: string;
  threadId?: string;
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export class GmailWorker {
  private gmail: ReturnType<typeof google.gmail>;
  private initialized = false;

  constructor() {
    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  }

  async listMessages(
    maxResults: number = 10
  ): Promise<GmailMessage[]> {
    if (!this.initialized) {
      throw new Error('Gmail worker not initialized');
    }

    const response = await this.gmail.users.messages.list({
      userId: 'me',
      maxResults,
    });

    const messages = response.data.messages || [];
    const detailedMessages: GmailMessage[] = [];

    for (const msg of messages) {
      const full = await this.gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });

      const headers = full.data.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

      detailedMessages.push({
        id: msg.id!,
        threadId: full.data.threadId!,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        to: getHeader('To'),
        body: this.extractBody(full.data.payload),
        date: new Date(parseInt(full.data.internalDate || '0', 10)),
      });
    }

    return detailedMessages;
  }

  async readMessage(messageId: string): Promise<GmailMessage | null> {
    if (!this.initialized) {
      throw new Error('Gmail worker not initialized');
    }

    try {
      const full = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const headers = full.data.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

      return {
        id: full.data.id!,
        threadId: full.data.threadId!,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        to: getHeader('To'),
        body: this.extractBody(full.data.payload),
        date: new Date(parseInt(full.data.internalDate || '0', 10)),
      };
    } catch {
      return null;
    }
  }

  async draftEmail(draft: DraftEmail): Promise<string> {
    if (!this.initialized) {
      throw new Error('Gmail worker not initialized');
    }

    const raw = this.createRawEmail(draft);
    const response = await this.gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: Buffer.from(raw).toString('base64url'),
        },
      },
    });

    return response.data.id!;
  }

  async sendEmail(draft: DraftEmail): Promise<string> {
    if (!this.initialized) {
      throw new Error('Gmail worker not initialized');
    }

    const raw = this.createRawEmail(draft);
    const response = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: Buffer.from(raw).toString('base64url'),
      },
    });

    return response.data.id!;
  }

  private extractBody(payload: any): string {
    if (!payload) return '';

    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    }

    return '';
  }

  private createRawEmail(draft: DraftEmail): string {
    const lines = [
      `To: ${draft.to}`,
      `Subject: ${draft.subject}`,
      draft.threadId ? `In-Reply-To: ${draft.threadId}` : '',
      draft.threadId ? `References: ${draft.threadId}` : '',
      '',
      draft.body,
    ];

    return lines.filter(Boolean).join('\r\n');
  }

  setCredentials(accessToken: string, refreshToken?: string): void {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const gmailWorker = new GmailWorker();
