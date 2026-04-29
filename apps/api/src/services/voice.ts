import WebSocket from 'ws';

export interface ElevenLabsConfig {
  apiKey: string;
  agentId: string;
  wsUrl?: string;
}

export interface VoiceEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export class VoiceService {
  private connections: Map<string, WebSocket> = new Map();
  private eventListeners: Map<string, ((event: VoiceEvent) => void)[]> = new Map();
  private config: ElevenLabsConfig;

  constructor(config: ElevenLabsConfig) {
    this.config = {
      wsUrl: 'wss://api.elevenlabs.io/v1/agent/stream',
      ...config,
    };
  }

  async connect(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.config.wsUrl}?agent_id=${this.config.agentId}`;
      const ws = new WebSocket(wsUrl, {
        headers: {
          'xi-api-key': this.config.apiKey,
        },
      });

      ws.on('open', () => {
        this.connections.set(sessionId, ws);
        this.emit(sessionId, {
          type: 'connected',
          data: { sessionId },
          timestamp: new Date(),
        });
        resolve();
      });

      ws.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          this.emit(sessionId, {
            type: parsed.type || 'unknown',
            data: parsed,
            timestamp: new Date(),
          });
        } catch {
          console.error('Failed to parse WebSocket message');
        }
      });

      ws.on('error', (error) => {
        this.emit(sessionId, {
          type: 'error',
          data: { error: error.message },
          timestamp: new Date(),
        });
        reject(error);
      });

      ws.on('close', () => {
        this.connections.delete(sessionId);
        this.emit(sessionId, {
          type: 'disconnected',
          data: { sessionId },
          timestamp: new Date(),
        });
      });
    });
  }

  async disconnect(sessionId: string): Promise<void> {
    const ws = this.connections.get(sessionId);
    if (ws) {
      ws.close();
      this.connections.delete(sessionId);
    }
  }

  sendAudio(sessionId: string, audioData: Buffer): void {
    const ws = this.connections.get(sessionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(audioData);
    }
  }

  sendText(sessionId: string, text: string): void {
    const ws = this.connections.get(sessionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'text',
          data: text,
        })
      );
    }
  }

  on(
    sessionId: string,
    callback: (event: VoiceEvent) => void
  ): () => void {
    if (!this.eventListeners.has(sessionId)) {
      this.eventListeners.set(sessionId, []);
    }
    this.eventListeners.get(sessionId)!.push(callback);

    return () => {
      const listeners = this.eventListeners.get(sessionId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  private emit(sessionId: string, event: VoiceEvent): void {
    const listeners = this.eventListeners.get(sessionId);
    if (listeners) {
      listeners.forEach((callback) => callback(event));
    }
  }

  isConnected(sessionId: string): boolean {
    return this.connections.has(sessionId);
  }
}

export const voiceService = new VoiceService({
  apiKey: process.env.ELEVENLABS_API_KEY || '',
  agentId: process.env.ELEVENLABS_AGENT_ID || '',
});
